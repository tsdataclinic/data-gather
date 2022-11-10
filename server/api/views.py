import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel
from sqlalchemy.exc import IntegrityError

from server.init_db import SQLITE_DB_PATH
from server.models import (
    Interview,
    InterviewScreen,
    InterviewScreenEntry,
    ConditionalAction,
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
        db_screen = (
            session.query(InterviewScreen).where(InterviewScreen.id == screen_id).all()
        )
        if not db_screen:
            raise HTTPException(
                status_code=404, detail=f"Screen with id {screen_id} not found"
            )
        # TODO: There is probably a way to make these queries more efficient
        db_actions = {
            i.id: i
            for i in session.query(ConditionalAction)
            .where(ConditionalAction.screen_id == screen_id)
            .all()
        }
        request_actions = {
            i.id: ConditionalAction(**i.dict(exclude_unset=True))
            for i in screen.actions
        }
        db_entries = {
            i.response_key: i
            for i in session.query(InterviewScreenEntry)
            .where(InterviewScreenEntry.screen_id == screen_id)
            .all()
        }
        # By default our request model will create <model>Base classes which don't exactly
        # match our expected models, so cast to their expected types
        # TODO: fix ^
        request_entries = {
            i.response_key: InterviewScreenEntry(**i.dict(exclude_unset=True))
            for i in screen.entries
        }

        add_actions, remove_actions, remaining_actions = _get_created_deleted_models(
            db_actions, request_actions
        )

        add_entries, remove_entries, remaining_entries = _get_created_deleted_models(
            db_entries, request_entries
        )
        
        # Raise exception if provided order of actions or entries is not sequential starting at 1
        _validate_sequential_order(add_actions.values(), remaining_actions.values())
        _validate_sequential_order(add_entries.values(), remaining_entries.values())

        for id, model in list(remaining_actions.items()) + list(remaining_entries.items()):
            existing_model = db_actions.get(id) or db_entries.get(id)
            if not existing_model:
                raise ValueError(f"No existing model found for changed model {model}")
            
            session.add(_update_model_diff(existing_model, model.dict(exclude_unset=True)))

        session.add_all(add_actions.values())
        session.add_all(add_entries.values())
        for r in remove_actions.values():
            session.delete(r)
        for r in remove_entries.values():
            session.delete(r)
        
        screen_no_rels = screen.dict(exclude_unset=True)
        screen_no_rels.pop("actions")
        screen_no_rels.pop("entries")
        session.add(_update_model_diff(db_screen[0], screen_no_rels))

        LOG.info(f"Making changes to screen: Additions {session.new} Deletions: {session.deleted} Updates: {session.dirty}")
        
        try:
            session.commit()
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e.orig),
            )
        return screen


def _get_created_deleted_models(
    existing_models: dict[str, SQLModel],
    new_models: dict[str, SQLModel],
):
    add_models = {
        i: new_models.get(i)
        for i in new_models.keys()
        if existing_models.get(i) is None
    }
    delete_models = {
        i: existing_models.get(i)
        for i in existing_models.keys()
        if new_models.get(i) is None
    }

    return (
        add_models,
        delete_models,
        {
            n: new_models.get(n)
            for n in new_models.keys()
            if n not in list(add_models.keys()) + list(delete_models.keys())
        },
    )

def _validate_sequential_order(added_models: list[SQLModel], remaining_models: list[SQLModel]):
    add_updated_order = sorted(
        [
            i.order
            for i in list(added_models) + list(remaining_models)
        ]
    )
    exc = HTTPException(
            status_code=400,
            detail=f"Invalid order provided for added/updated models {add_updated_order}",
        )
    
    # Raise exception if provided order of models is not sequential starting at 1
    if add_updated_order != list(range(min(add_updated_order), max(add_updated_order) + 1)):
        raise exc

    if add_updated_order[0] != 1:
        raise exc

def _update_model_diff(existing_model: SQLModel, new_model: dict[any, any]):
    """Update a model returned from the DB with any changes in the new model"""
    for key, val in new_model.items():
        if getattr(existing_model, key) != val:
            setattr(existing_model, key, val)

    return existing_model


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
        if screen.order < new_screen.order:
            continue
        elif screen.order >= new_screen.order:
            screen.order += 1

    return sorted_screens + [new_screen]
