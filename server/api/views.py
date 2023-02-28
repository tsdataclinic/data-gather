import logging
from typing import Optional, Sequence, TypeVar, Union

from fastapi import Body, Depends, FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi_azure_auth import B2CMultiTenantAuthorizationCodeBearer
from fastapi_azure_auth.user import User as AzureUser
from pydantic import AnyHttpUrl, BaseSettings, Field
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlmodel import Session, SQLModel, select

from server.api.airtable_api import AirtableAPI, PartialRecord, Record
from server.api.airtable_config import AIRTABLE_API_KEY, AIRTABLE_BASE_ID
from server.api.exceptions import InvalidOrder
from server.api.services.interview_screen_service import InterviewScreenService
from server.api.services.interview_service import InterviewService
from server.engine import create_fk_constraint_engine
from server.init_db import SQLITE_DB_PATH
from server.models.common import OrderedModel
from server.models.conditional_action import ConditionalAction
from server.models.interview import (Interview, InterviewCreate, InterviewRead,
                                     InterviewReadWithScreensAndActions,
                                     InterviewUpdate, ValidationError)
from server.models.interview_screen import (InterviewScreen,
                                            InterviewScreenCreate,
                                            InterviewScreenRead,
                                            InterviewScreenReadWithChildren,
                                            InterviewScreenUpdate)
from server.models.interview_screen_entry import (
    InterviewScreenEntry, InterviewScreenEntryReadWithScreen)
from server.models.interview_setting import InterviewSetting, InterviewSettingType
from server.models.submission_action import SubmissionAction
from server.models.user import User, UserRead

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# TODO - get api key from a given interview
# airtable_client = AirtableAPI(AIRTABLE_API_KEY, AIRTABLE_BASE_ID)


class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: list[Union[str, AnyHttpUrl]] = ["http://localhost:3000"]
    OPENAPI_CLIENT_ID: str = Field(default="", env="OPENAPI_CLIENT_ID")
    APP_CLIENT_ID: str = Field(default="", env="REACT_APP_AZURE_APP_CLIENT_ID")
    AZURE_DOMAIN_NAME: str = Field(default="", env="AZURE_DOMAIN_NAME")
    AZURE_POLICY_AUTH_NAME: str = Field(default="", env="AZURE_POLICY_AUTH_NAME")
    AZURE_API_SCOPE: str = Field(default="", env="REACT_APP_AZURE_B2C_SCOPES")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


def custom_generate_unique_id(route: APIRoute) -> str:
    """Change the unique id that FastAPI gives each function so it's formatted
    as [apiTag]-[routeName]. This makes our autogenerated TypeScript functions
    a lot cleaner.
    """
    if len(route.tags) > 0:
        return f"{route.tags[0]}-{route.name}"
    return f"{route.name}"


TAG_METADATA = [{"name": "airtable", "description": "Endpoints for querying Airtable"}]

settings = Settings()

app = FastAPI(
    title="Interview App API",
    openapi_tags=TAG_METADATA,
    generate_unique_id_function=custom_generate_unique_id,
    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": settings.OPENAPI_CLIENT_ID,
    },
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

azure_scheme = B2CMultiTenantAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    scopes={
        f"https://{settings.AZURE_API_SCOPE}": "API Scope",
    },
    openid_config_url=f"https://{settings.AZURE_DOMAIN_NAME}.b2clogin.com/{settings.AZURE_DOMAIN_NAME}.onmicrosoft.com/{settings.AZURE_POLICY_AUTH_NAME}/v2.0/.well-known/openid-configuration",
    openapi_authorization_url=f"https://{settings.AZURE_DOMAIN_NAME}.b2clogin.com/{settings.AZURE_DOMAIN_NAME}.onmicrosoft.com/{settings.AZURE_POLICY_AUTH_NAME}/oauth2/v2.0/authorize",
    openapi_token_url=f"https://{settings.AZURE_DOMAIN_NAME}.b2clogin.com/{settings.AZURE_DOMAIN_NAME}.onmicrosoft.com/{settings.AZURE_POLICY_AUTH_NAME}/oauth2/v2.0/token",
    validate_iss=False,
)

engine = create_fk_constraint_engine(SQLITE_DB_PATH)


def get_session():
    with Session(engine) as session:
        yield session


def get_current_user(
    azure_user: AzureUser = Depends(azure_scheme),
    session: Session = Depends(get_session),
) -> User:
    # check if the azure user exists in our database already
    user_id: str = azure_user.claims.get("oid", "")
    db_user = session.get(User, user_id)
    if db_user:
        return db_user

    # user doesn't exist yet, so create the user
    token = azure_user.claims
    new_user = User(
        id=user_id,
        email=token.get("emails", ["no_email"])[0],
        identity_provider=token.get("idp", "local"),
        family_name=token.get("family_name", ""),
        given_name=token.get("given_name", ""),
    )
    session.add(new_user)
    session.commit()
    return new_user


def get_interview_service(session: Session = Depends(get_session)) -> InterviewService:
    return InterviewService(db=session)


def get_interview_screen_service(
    session: Session = Depends(get_session),
) -> InterviewScreenService:
    return InterviewScreenService(db=session)


@app.get("/hello")
def hello_api():
    return {"message": "Hello World"}


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """This will globally handle any ValidationError from SQLAlchemy and
    return a 400 Bad Request response.
    """
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)},
    )


@app.on_event("startup")
async def load_config() -> None:
    """Load OpenID config on startup."""
    await azure_scheme.openid_config.load_config()


@app.get("/auth", dependencies=[Security(azure_scheme)])
def test_auth():
    return {"message": "auth success!"}


@app.get(
    "/api/user/self",
    dependencies=[Security(azure_scheme)],
    response_model=UserRead,
    tags=["users"],
)
def get_self_user(user: User = Depends(get_current_user)) -> User:
    return user


@app.post(
    "/api/interviews/",
    tags=["interviews"],
    response_model=InterviewRead,
)
def create_interview(
    interview: InterviewCreate,
    interview_service: InterviewService = Depends(get_interview_service),
) -> Interview:
    """Create an interview. An interview is created with a default screen to start
    with.
    """
    return interview_service.create_interview(interview)


@app.get(
    "/api/interviews/{interview_id}",
    response_model=InterviewReadWithScreensAndActions,
    tags=["interviews"],
)
def get_interview(
    *,
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
) -> Interview:
    return interview_service.get_interview_by_id(interview_id)


@app.get(
    "/api/interviews/by-vanity-url/{vanity_url}",
    response_model=InterviewReadWithScreensAndActions,
    tags=["interviews"],
)
def get_interview_by_vanity_url(
    *,
    vanity_url: str,
    interview_service: InterviewService = Depends(get_interview_service),
) -> Interview:
    """Get a published Interview by its vanity url"""
    return interview_service.get_interview_by_vanity_url(vanity_url)


@app.get(
    "/api/interviews/{interview_id}/entries",
    response_model=list[InterviewScreenEntryReadWithScreen],
    tags=["interviews"],
)
def get_interview_entries(
    *,
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
) -> list[InterviewScreenEntry]:
    interview = interview_service.get_interview_by_id(interview_id)
    entries: list[InterviewScreenEntry] = []
    for screen in interview.screens:
        entries.extend(screen.entries)
    return entries


@app.put(
    "/api/interviews/{interview_id}",
    response_model=InterviewRead,
    tags=["interviews"],
)
def update_interview(
    interview_id: str,
    interview: InterviewUpdate,
    session: Session = Depends(get_session),
) -> Interview:
    try:
        db_interview = session.exec(
            select(Interview).where(Interview.id == interview_id)
        ).one()
    except NoResultFound:
        raise HTTPException(
            status_code=404, detail=f"Interview with id {interview_id} not found"
        )
    # update the nested submission actions
    _reset_object_order(interview.submission_actions)
    actions_to_set, actions_to_delete = _diff_model_lists(
        db_interview.submission_actions,
        [SubmissionAction.from_orm(action) for action in interview.submission_actions],
    )

    # set the updated actions
    db_interview.submission_actions = actions_to_set

    # get settings to update and delete
    settings_to_set, settings_to_delete = _diff_model_lists(
        db_interview.interview_settings,
        [InterviewSetting.from_orm(setting) for setting in interview.interview_settings],
    )

    # set the updated settings
    db_interview.interview_settings = settings_to_set

    # now update the top-level db_interview
    _update_model_diff(db_interview, interview.copy(exclude={"submission_actions", "interview_settings"}))
    session.add(db_interview)

    # delete the necessary actions
    for action in actions_to_delete:
        session.delete(action)

    
    # delete the necessary settings
    for setting in settings_to_delete:
        session.delete(setting)

    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Error validating interview")
    return db_interview


@app.post(
    "/api/interviews/{interview_id}/starting_state",
    response_model=InterviewReadWithScreensAndActions,
    tags=["interviews"],
)
def update_interview_starting_state(
    *,
    session: Session = Depends(get_session),
    interview_id: str,
    starting_state: list[str],
) -> Interview:
    db_screens = session.exec(
        select(InterviewScreen).where(InterviewScreen.interview_id == interview_id)
    ).all()
    starting_screen_to_idx = {
        screen_id: i for i, screen_id in enumerate(starting_state)
    }
    for db_screen in db_screens:
        db_screen_id = str(db_screen.id)
        if db_screen_id in starting_screen_to_idx:
            idx = starting_screen_to_idx[db_screen_id]
            db_screen.is_in_starting_state = True
            db_screen.starting_state_order = idx
        else:
            db_screen.is_in_starting_state = False
            db_screen.starting_state_order = None

    session.add_all(db_screens)
    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e.orig),
        )

    db_interview = session.get(Interview, interview_id)
    if not db_interview:
        raise HTTPException(
            status_code=404, detail=f"Interview with id {interview_id} not found"
        )
    return db_interview


@app.get(
    "/api/interviews/",
    response_model=list[InterviewRead],
    tags=["interviews"],
)
def get_interviews(
    user: User = Depends(get_current_user), session: Session = Depends(get_session)
) -> list[Interview]:
    interviews = session.exec(
        select(Interview).where(Interview.owner_id == user.id).limit(100)
    ).all()
    return interviews


@app.delete(
    "/api/interview/{interview_id}",
    response_model=None,
    tags=["interviews"],
    dependencies=[Security(azure_scheme)],
)
def delete_interview(
    *,
    user: User = Depends(get_current_user),
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
) -> None:
    """Delete an interview. Requires authentication.
    Deletion is only allowed if the logged in user is the owner of the interview.
    """
    db_interview = interview_service.get_interview_by_id(interview_id)
    if db_interview.owner_id == user.id:
        interview_service.delete_interview(db_interview)


@app.get(
    "/api/interview_screens/{screen_id}",
    response_model=InterviewScreenReadWithChildren,
    tags=["interviewScreens"],
)
def get_interview_screen(
    *,
    screen_id: str,
    interview_screen_service: InterviewScreenService = Depends(
        get_interview_screen_service
    ),
) -> InterviewScreen:
    return interview_screen_service.get_interview_screen_by_id(screen_id)


@app.post(
    "/api/interview_screens/",
    response_model=InterviewScreenRead,
    tags=["interviewScreens"],
)
def create_interview_screen(
    *, session: Session = Depends(get_session), screen: InterviewScreenCreate
) -> InterviewScreen:
    existing_screens = (
        session.query(InterviewScreen)
        .where(InterviewScreen.interview_id == screen.interview_id)
        .all()
    )

    if not existing_screens:
        screen.order = 0
        db_screen = InterviewScreen.from_orm(screen)
        session.add(db_screen)
    else:
        try:
            db_screen, ordered_screens = _adjust_screen_order(existing_screens, screen)
            session.add_all(ordered_screens)
        except InvalidOrder as e:
            raise HTTPException(status_code=400, detail=str(e.message))

    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e.orig),
        )

    session.refresh(db_screen)
    return db_screen


@app.delete(
    "/api/interview_screens/{screen_id}",
    response_model=None,
    tags=["interviewScreens"],
)
def delete_interview_screen(
    *,
    screen_id: str,
    interview_screen_service: InterviewScreenService = Depends(
        get_interview_screen_service
    ),
) -> None:
    interview_screen_service.delete_interview_screen_by_id(screen_id)


@app.put(
    "/api/interview_screens/{screen_id}",
    response_model=InterviewScreenReadWithChildren,
    tags=["interviewScreens"],
)
def update_interview_screen(
    *,
    session: Session = Depends(get_session),
    screen_id: str,
    screen: InterviewScreenUpdate,
) -> InterviewScreen:
    """
    Update an Interview Screen. This API function updates the values
    of an InterviewScreen as well as its nested Conditional Actions
    and Entries.
    """
    try:
        db_screen: InterviewScreen = (
            session.query(InterviewScreen).where(InterviewScreen.id == screen_id).one()
        )
    except NoResultFound:
        raise HTTPException(
            status_code=404, detail=f"Screen with id {screen_id} not found"
        )

    # update the top-level InterviewScreen model values
    _update_model_diff(db_screen, screen.copy(exclude={"actions", "entries"}))

    # validate that actions and entries have valid orders
    _reset_object_order(screen.actions)
    _reset_object_order(screen.entries)

    # update the InterviewScreen relationships (actions and entries)
    actions_to_set, actions_to_delete = _diff_model_lists(
        db_screen.actions,
        [ConditionalAction.from_orm(action) for action in screen.actions],
    )
    entries_to_set, entries_to_delete = _diff_model_lists(
        db_screen.entries,
        [InterviewScreenEntry.from_orm(entry) for entry in screen.entries],
    )

    # set the updated relationships
    db_screen.actions = actions_to_set
    db_screen.entries = entries_to_set

    # now apply all changes to the session
    session.add(db_screen)

    # delete the necessary actions and entries
    for model in actions_to_delete + entries_to_delete:
        session.delete(model)

    LOG.info(f"Making changes to screen:")
    LOG.info(f"Additions {session.new}")
    LOG.info(f"Deletions: {session.deleted}")
    LOG.info(f"Updates: {session.dirty}")

    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))
    return db_screen


def _update_model_diff(existing_model: SQLModel, new_model: SQLModel):
    """
    Update a model returned from the DB with any changes in the new
    model.
    """
    for key in new_model.dict().keys():
        new_val = getattr(new_model, key)
        old_val = getattr(existing_model, key)
        if old_val != new_val:
            setattr(existing_model, key, new_val)
    return existing_model


TInterviewChild = TypeVar(
    "TInterviewChild", ConditionalAction, InterviewScreenEntry, SubmissionAction
)


def _diff_model_lists(
    db_models: list[TInterviewChild],
    request_models: list[TInterviewChild],
) -> tuple[list[TInterviewChild], list[TInterviewChild]]:
    """
    Given two list of models, diff them to come up with the list of models to
    set in the db (which includes the models to update and the models to add)
    and the list of models to delete.

    The model types must have an `id` member for this to work since that is
    the field this function uses to compare them.

    Args:
        db_models: The existing list of models in the db
        request_models: The list of models coming in from a request which we
            wish to write.

    Returns:
        A tuple of: list of models to set and list of models to delete
    """
    # create map of id to request_model (i.e. the models not in the db)
    db_models_dict = {model.id: model for model in db_models}
    request_model_ids = set(req_model.id for req_model in request_models)

    # figure out which models are new and which ones have to be updated
    models_to_create = []
    models_to_update = []
    for request_model in request_models:
        if request_model.id is None:
            models_to_create.append(request_model)
        else:
            db_model = db_models_dict.get(request_model.id, None)
            if db_model:
                # if the model already exists in the database, then we update the
                # db_model with the request_model data
                models_to_update.append(_update_model_diff(db_model, request_model))

    # figure out which models need to be deleted from the database
    models_to_delete = []
    for db_model in db_models:
        if db_model.id not in request_model_ids:
            models_to_delete.append(db_model)

    models_to_set = models_to_create + models_to_update
    return (models_to_set, models_to_delete)


def _reset_object_order(request_models: Sequence[OrderedModel]):
    """
    Resets the order attribute of objects in given iterable to their index value
    """
    for index, ordered_model in enumerate(request_models):
        ordered_model.order = index


def _adjust_screen_order(
    existing_screens: list[InterviewScreen], new_screen: InterviewScreenCreate
) -> tuple[InterviewScreen, list[InterviewScreen]]:
    """
    Given a list of existing screens and a new screen
    do the necessary re-ordering.

    Return the newly created screen and the new list of ordered screens.
    """
    sorted_screens = sorted(existing_screens, key=lambda x: x.order)
    # If an order was not speficied for the new screen add it to the end
    if new_screen.order == None:
        new_screen.order = sorted_screens[-1].order + 1
    else:
        # Screens shouldn't be created with an order that is
        # not in or adjacent to the current screen orders
        existing_orders = [i.order for i in sorted_screens]
        if (
            new_screen.order not in existing_orders
            and new_screen.order != existing_orders[0] + 1
            and new_screen.order != existing_orders[-1] + 1
        ):
            raise InvalidOrder(new_screen.order, existing_orders)

        # if proposed screen order is the same as existing
        # increment matching screen and subsequent screens by 1
        for screen in sorted_screens:
            if screen.order >= new_screen.order:
                screen.order += 1

    db_screen = InterviewScreen.from_orm(new_screen)
    return (db_screen, sorted_screens + [db_screen])


@app.get("/api/airtable-records/{interview_id}/{table_name}", tags=["airtable"])
def get_airtable_records(
    table_name,
    request: Request,
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
) -> list[Record]:
    """
    Fetch records from an airtable table. Filtering can be performed
    by adding query parameters to the URL, keyed by column name.
    """
    airtable_settings = interview_service.get_interview_setting_by_interview_id_and_type(interview_id, InterviewSettingType.AIRTABLE)
    airtable_client = AirtableAPI(airtable_settings)
    query = dict(request.query_params)
    return airtable_client.search_records(table_name, query)


@app.get("/api/airtable-records/{interview_id}/{table_name}/{record_id}", tags=["airtable"])
def get_airtable_record(
    table_name: str,
    record_id: str,
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
    session: Session = Depends(get_session),
) -> Record:
    """
    Fetch record with a particular id from a table in airtable.
    """
    airtable_settings = interview_service.get_interview_setting_by_interview_id_and_type(interview_id, InterviewSettingType.AIRTABLE)
    airtable_client = AirtableAPI(airtable_settings)
    return airtable_client.fetch_record(table_name, record_id)

@app.get("/api/airtable-schema/{interview_id}", tags=["airtable"])
def get_airtable_schema(
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
    session: Session = Depends(get_session),
) -> Record:
    """
    Given an interview object, fetch the list of bases + schema for each base for its given Airtable access key.
    Combine the schema into a single JSON object.
    Update a given Interview object with that schema.
    """
    interview = interview_service.get_interview_by_id(interview_id)
    new_interview = InterviewUpdate.from_orm(interview)
    airtableSetting = {}
    update_interview_setting_index = 0
    update_interview_setting = InterviewSetting()
    for index, setting in enumerate(interview.interview_settings):
        if (setting.settings[InterviewSettingType.AIRTABLE]):
            update_interview_setting_index = index
            update_interview_setting = setting
            airtableSetting = setting.settings[InterviewSettingType.AIRTABLE]
    
    airtable_client = AirtableAPI(airtableSetting)
    new_airtable_settings = airtable_client.fetch_schema(airtableSetting)
    update_interview_setting.settings[InterviewSettingType.AIRTABLE].update(new_airtable_settings)
    new_interview.interview_settings[update_interview_setting_index] = update_interview_setting
    
    return update_interview(interview_id, new_interview, session)

@app.post("/api/airtable-records/{interview_id}/{table_name}", tags=["airtable"])
async def create_airtable_record(
    table_name: str, 
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
    session: Session = Depends(get_session),
    record: Record = Body(...),
) -> Record:
    """
    Create an airtable record in a table.
    """
    airtable_settings = interview_service.get_interview_setting_by_interview_id_and_type(interview_id, InterviewSettingType.AIRTABLE)
    airtable_client = AirtableAPI(airtable_settings)
    return airtable_client.create_record(table_name, record)


@app.put("/api/airtable-records/{interview_id}/{table_name}/{record_id}", tags=["airtable"])
async def update_airtable_record(
    table_name: str,
    record_id: str,
    interview_id: str,
    interview_service: InterviewService = Depends(get_interview_service),
    session: Session = Depends(get_session),
    update: PartialRecord = Body(...)
) -> Record:
    """
    Update an airtable record in a table.
    """
    airtable_settings = interview_service.get_interview_setting_by_interview_id_and_type(interview_id, InterviewSettingType.AIRTABLE)
    airtable_client = AirtableAPI(airtable_settings)
    return airtable_client.update_record(table_name, record_id, update)
