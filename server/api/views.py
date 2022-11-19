import copy
import logging
from typing import Iterable, Literal, NewType, TypeVar

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlmodel import Session, SQLModel, select

from server.api.exceptions import InvalidOrder
from server.engine import create_fk_constraint_engine
from server.init_db import SQLITE_DB_PATH
from server.models import (
    ConditionalAction,
    Interview,
    InterviewScreen,
    InterviewScreenEntry,
    OrderedModel,
)
from server.models_util import prepare_relationships

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Interview App API")

# allow access from create-react-app
origins = ["http://localhost:3000"]

app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", tags=["Interviews"])
def create_interview(interview: Interview) -> str:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    session.add(interview)
    session.commit()
    return "success"


@app.get(
    "/api/interviews/{interview_id}",
    response_model=prepare_relationships(Interview, ["screens"]),
    tags=["Interviews"],
)
def get_interview(interview_id: str) -> Interview:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@app.put(
    "/api/interviews/{interview_id}",
    response_model=Interview,
    tags=["Interviews"],
)
def update_interview(interview_id: str, interview: Interview) -> Interview:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(
        autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
    ) as session:
        try:
            db_interview = session.exec(
                select(Interview).where(Interview.id == interview_id)
            ).one()
        except NoResultFound:
            raise HTTPException(
                status_code=404, detail=f"Interview with id {interview_id} not found"
            )

        # now update the db_interview
        _update_model_diff(db_interview, interview)
        session.add(db_interview)

        try:
            session.commit()
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=str(e.orig))

        return db_interview


@app.get(
    "/api/interviews/",
    response_model=list[Interview],
    tags=["Interviews"],
)
def get_interviews() -> list[Interview]:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interviews: list[Interview] = session.query(Interview).limit(100).all()
    return interviews


@app.get(
    "/api/interview_screens/{screen_id}",
    response_model=prepare_relationships(InterviewScreen, ["actions", "entries"]),
    tags=["InterviewScreens"],
)
def get_interview_screen(screen_id: str) -> InterviewScreen:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    screen = session.get(InterviewScreen, screen_id)
    if not screen:
        raise HTTPException(status_code=404, detail="Interview not found")
    return screen


@app.post(
    "/api/interview_screens/",
    response_model=InterviewScreen,
    tags=["InterviewScreens"],
)
def create_interview_screen(screen: InterviewScreen) -> InterviewScreen:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        existing_screens = (
            session.query(InterviewScreen)
            .where(InterviewScreen.interview_id == screen.interview_id)
            .all()
        )
        if not existing_screens:
            screen.order = 1
            session.add(screen)
        else:
            try:
                ordered_screens = _adjust_screen_order(existing_screens, screen)
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
        session.refresh(screen)

        return screen


InterviewScreenWithActionsAndEntries = NewType(
    "InterviewScreenWithActionsAndEntries",
    prepare_relationships(InterviewScreen, ["actions", "entries"]),
)


@app.put(
    "/api/interview_screens/{screen_id}",
    response_model=InterviewScreenWithActionsAndEntries,
    tags=["InterviewScreens"],
)
def update_interview_screen(
    screen_id: str,
    screen: InterviewScreenWithActionsAndEntries,
) -> InterviewScreen:
    """
    Update an Interview Screen. This API function updates the values
    of an InterviewScreen as well as its nested Conditional Actions
    and Entries.
    """
    request_screen = _cast_relationship_orm_types(screen)
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(
        autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
    ) as session:
        try:
            db_screen: InterviewScreen = (
                session.query(InterviewScreen)
                .where(InterviewScreen.id == screen_id)
                .one()
            )
        except NoResultFound:
            raise HTTPException(
                status_code=404, detail=f"Screen with id {screen_id} not found"
            )

        _validate_sequential_order(screen.actions)
        _validate_sequential_order(screen.entries)

        # update the InterviewScreen relationships (actions and entries)
        actions_to_set, actions_to_delete = _update_db_screen_relationships(
            db_screen.actions,
            request_screen.actions,
        )
        entries_to_set, entries_to_delete = _update_db_screen_relationships(
            db_screen.entries,
            request_screen.entries,
        )

        # set the updated relationships
        db_screen.actions = actions_to_set
        db_screen.entries = entries_to_set

        # update the top-level InterviewScreen model values
        _update_model_diff(
            db_screen, request_screen.copy(exclude={"actions", "entries"})
        )

        # now apply all changes to the session
        session.add(db_screen)
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
    """Update a model returned from the DB with any changes in the new model"""
    for key in new_model.dict().keys():
        new_val = getattr(new_model, key)
        old_val = getattr(existing_model, key)
        if old_val != new_val:
            setattr(existing_model, key, new_val)
    return existing_model


def _cast_relationship_orm_types(request_screen: InterviewScreen):
    """Cast the relationship models on the request to the appropriate types"""
    casted_screen = copy.deepcopy(request_screen)
    casted_screen.actions = [
        ConditionalAction.from_orm(action) for action in request_screen.actions
    ]
    casted_screen.entries = [
        InterviewScreenEntry.from_orm(entry) for entry in request_screen.entries
    ]
    return casted_screen


TScreenChild = TypeVar("TScreenChild", ConditionalAction, InterviewScreenEntry)


def _update_db_screen_relationships(
    db_models: list[TScreenChild],
    request_models: list[TScreenChild],
) -> tuple[list[TScreenChild], list[TScreenChild]]:
    """
    Given two list of models, diff them to come up with the list of
    the list of models to set in the db (which includes the models to
    update and the models to add) and the list of models to delete.

    Args:
        db_models: The list of ConditionalAction or InterviewScreenEntry
            models from the db
        request_models: The list of ConditionalAction or InterviewScreenEntry
            models sent in the request body

    Returns:
        A tuple of: list of models to set and list of models to delete
    """
    # create map of id to request_model (i.e. the models not in the db)
    request_models_dict: dict[str, SQLModel] = {
        model.getId(): model for model in request_models
    }
    db_model_ids = set(db_model.getId() for db_model in db_models)

    models_to_set = []
    models_to_delete = []
    for db_model in db_models:
        request_model = request_models_dict.get(db_model.getId())

        if request_model:
            # if the db_model id matched one of our request models, then we
            # update the db_model with the request_model data
            models_to_set.append(_update_model_diff(db_model, request_model))
        else:
            # otherwise, delete the db model because it should no longer
            # exist (it wasn't in our request_models_dict)
            models_to_delete.append(db_model)

    # all models in request_models_dict that *aren't* in the db should now
    # get added as is
    for id, request_model in request_models_dict.items():
        if id not in db_model_ids:
            models_to_set.append(request_model)

    return (models_to_set, models_to_delete)


def _validate_sequential_order(request_models: Iterable[OrderedModel]):
    """Validate that the provided ordered models are in sequential order starting at 1"""
    model_order = sorted([i.order for i in request_models])
    exc = HTTPException(
        status_code=400,
        detail=f"Invalid order provided for added/updated models {model_order}",
    )

    if model_order != list(range(min(model_order), max(model_order) + 1)):
        raise exc

    if model_order[0] != 1:
        raise exc


def _adjust_screen_order(
    existing_screens: list[InterviewScreen], new_screen: InterviewScreen
) -> list[InterviewScreen]:
    """
    Given a list of existing screens and a new screen
    do the necessary re-ordering
    """
    sorted_screens = sorted(existing_screens, key=lambda x: x.order)
    # If an order was not speficied for the new screen add it to the end
    if new_screen.order == 0:
        new_screen.order = sorted_screens[-1].order + 1
        return existing_screens + [new_screen]

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

    return sorted_screens + [new_screen]
