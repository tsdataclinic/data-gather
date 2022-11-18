import copy
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel
from sqlalchemy.exc import IntegrityError, NoResultFound

from server.init_db import SQLITE_DB_PATH
from server.models import (
    Interview,
    InterviewScreen,
    InterviewScreenEntry,
    ConditionalAction,
    OrderedModel,
)
from server.models_util import prepare_relationships
from server.engine import create_fk_constraint_engine

from server.api.exceptions import InvalidOrder

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


# TODO: this needs to return conditional actions and entries as well
@app.get(
    "/api/interviewScreens/{screen_id}",
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
    "/api/interviewScreens/",
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

@app.put(
    "/api/interviewScreens/{screen_id}",
    response_model=prepare_relationships(InterviewScreen, ["actions", "entries"]),
    tags=["InterviewScreens"],
)
def update_interview_screen(
    screen_id: str,
    screen: prepare_relationships(InterviewScreen, ["actions", "entries"]),
) -> InterviewScreen:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        try:
            db_screen = (
                session.query(InterviewScreen).where(InterviewScreen.id == screen_id).one()
            )
        except NoResultFound:
            raise HTTPException(
                status_code=404, detail=f"Screen with id {screen_id} not found"
            )
        
        _validate_sequential_order(screen.actions)
        _validate_sequential_order(screen.entries)
        
        casted_request_screen = _cast_correct_types(screen)

        for rel, primary_key in zip(["actions", "entries"], ["id", "response_key"]):
            session, db_screen = _update_db_screen_relationships(
                session,
                db_screen,
                casted_request_screen,
                rel,
                primary_key,
            )

        session.add(db_screen)

        LOG.info(f"Making changes to screen:")
        LOG.info(f"Additions {session.new}" )
        LOG.info(f"Deletions: {session.deleted}")
        LOG.info(f"Updates: {session.dirty}")
        
        try:
            session.commit()
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e.orig),
            )
        return screen


def _update_model_diff(existing_model: SQLModel, new_model: SQLModel):
    """Update a model returned from the DB with any changes in the new model"""
    for key, val in new_model.dict().items():
        if getattr(existing_model, key) != val:
            setattr(existing_model, key, val)
    
    return existing_model

def _cast_correct_types(request_screen: InterviewScreen):
    """Cast the relationship models on the request to the appropriate types"""
    casted_screen = copy.deepcopy(request_screen)
    casted_screen.actions = [ConditionalAction(**action.dict()) for action in request_screen.actions]
    casted_screen.entries = [InterviewScreenEntry(**entry.dict()) for entry in request_screen.entries]
    return casted_screen


def _update_db_screen_relationships(
    session: Session, 
    db_screen: InterviewScreen,
    request_screen: InterviewScreen,
    relationship: str,
    rel_primary_key: str,
):
    """
    Handle all necessary adds, deletes and updates to the DB session 
    for the given screens and relationship.
    
    Args:
        session: DB session 
        db_screen: The InterviewScreen as read from the DB
        request_screen: The InterviewScreen sent in the request body
        relationship: The screen relationship to target for updates
        rel_primary_key: The primary key to reference on the given relationship object

    """
    request_models = {
        getattr(model, rel_primary_key): model
        for model in getattr(request_screen, relationship)
    }

    db_model_ids = []
    for i, model in enumerate(getattr(db_screen, relationship)):
        model_id = getattr(model, rel_primary_key)
        db_model_ids.append(model_id)
        if request_models.get(model_id) is None:
            session.delete(model)
        else:
            updated_model = _update_model_diff(model, request_models.get(model_id))
            getattr(db_screen, relationship)[i] = updated_model

    for id, model in request_models.items():
        if id not in db_model_ids:
            session.add(model)
    
    return session, db_screen


def _validate_sequential_order(request_models: list[OrderedModel]):
    """Validate that the provided ordered models are in sequential order starting at 1"""
    model_order = sorted(
        [
            i.order
            for i in request_models
        ]
    )
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
