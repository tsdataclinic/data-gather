import copy
import logging
import uuid
from typing import Optional, Sequence, TypeVar

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlmodel import Session, SQLModel, select

from server.api.exceptions import InvalidOrder
from server.engine import create_fk_constraint_engine
from server.init_db import SQLITE_DB_PATH
from server.models.common import OrderedModel
from server.models.conditional_action import ConditionalAction
from server.models.interview import (
    Interview,
    InterviewCreate,
    InterviewRead,
    InterviewReadWithScreens,
    InterviewUpdate,
)
from server.models.interview_screen import (
    InterviewScreen,
    InterviewScreenCreate,
    InterviewScreenRead,
    InterviewScreenReadWithChildren,
    InterviewScreenUpdate,
)
from server.models.interview_screen_entry import InterviewScreenEntry

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def custom_generate_unique_id(route: APIRoute) -> str:
    """Change the unique id that FastAPI gives each function so it's formatted
    as [apiTag]-[routeName]. This makes our autogenerated TypeScript functions
    a lot cleaner.
    """
    if len(route.tags) > 0:
        return f"{route.tags[0]}-{route.name}"
    else:
        return f"{route.name}"


app = FastAPI(
    title="Interview App API", generate_unique_id_function=custom_generate_unique_id
)

# allow access from create-react-app
origins = ["http://localhost:3000"]

app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", response_model=InterviewRead, tags=["Interviews"])
def create_interview(interview: InterviewCreate) -> Interview:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        db_interview = Interview.from_orm(interview)
        session.add(db_interview)
        try:
            session.commit()
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e.orig),
            )
        session.refresh(db_interview)
        return db_interview


@app.get(
    "/api/interviews/{interview_id}",
    response_model=InterviewReadWithScreens,
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
    response_model=InterviewRead,
    tags=["Interviews"],
)
def update_interview(interview_id: str, interview: InterviewUpdate) -> Interview:
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
    response_model=list[InterviewRead],
    tags=["Interviews"],
)
def get_interviews() -> list[Interview]:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interviews = session.exec(select(Interview).limit(100)).all()
    return interviews


@app.get(
    "/api/interview_screens/{screen_id}",
    response_model=InterviewScreenReadWithChildren,
    tags=["InterviewScreens"],
)
def get_interview_screen(screen_id: str) -> InterviewScreen:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    session = Session(autocommit=False, autoflush=False, bind=engine)
    screen = session.get(InterviewScreen, screen_id)
    if not screen:
        raise HTTPException(status_code=404, detail="InterviewScreen not found")
    return screen


@app.post(
    "/api/interview_screens/",
    response_model=InterviewScreenRead,
    tags=["InterviewScreens"],
)
def create_interview_screen(screen: InterviewScreenCreate) -> InterviewScreenCreate:
    engine = create_fk_constraint_engine(SQLITE_DB_PATH)
    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        db_screen = InterviewScreen.from_orm(screen)
        existing_screens = (
            session.query(InterviewScreen)
            .where(InterviewScreen.interview_id == screen.interview_id)
            .all()
        )
        if not existing_screens:
            db_screen.order = 1
            session.add(db_screen)
        else:
            try:
                ordered_screens = _adjust_screen_order(existing_screens, db_screen)
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
    "/api/interview_screens/{screen_id}",
    response_model=InterviewScreenReadWithChildren,
    tags=["InterviewScreens"],
)
def update_interview_screen(
    screen_id: str,
    screen: InterviewScreenUpdate,
) -> InterviewScreen:
    """
    Update an Interview Screen. This API function updates the values
    of an InterviewScreen as well as its nested Conditional Actions
    and Entries.
    """
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

        # update the top-level InterviewScreen model values
        _update_model_diff(db_screen, screen.copy(exclude={"actions", "entries"}))

        # validate that actions and entries have valid orders
        _validate_sequential_order(screen.actions)
        _validate_sequential_order(screen.entries)

        # update the InterviewScreen relationships (actions and entries)
        actions_to_set, actions_to_delete = _update_db_screen_relationships(
            db_screen.actions,
            [ConditionalAction.from_orm(action) for action in screen.actions],
        )
        entries_to_set, entries_to_delete = _update_db_screen_relationships(
            db_screen.entries,
            [InterviewScreenEntry.from_orm(entry) for entry in screen.entries],
        )

        # set the updated relationships
        db_screen.actions = actions_to_set
        db_screen.entries = entries_to_set

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
        db_models: The existing list of ConditionalAction or
            InterviewScreenEntry models from the db
        request_models: The list of ConditionalAction or InterviewScreenEntry
            models to update or create

    Returns:
        A tuple of: list of models to set and list of models to delete
    """
    # create map of id to request_model (i.e. the models not in the db)
    request_models_dict: dict[Optional[uuid.UUID], SQLModel] = {
        model.id: model for model in request_models
    }
    db_model_ids = set(db_model.id for db_model in db_models)

    models_to_set = []
    models_to_delete = []
    for db_model in db_models:
        request_model = request_models_dict.get(db_model.id)

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


def _validate_sequential_order(request_models: Sequence[OrderedModel]):
    """Validate that the provided ordered models are in sequential order starting at 1"""
    sorted_models = sorted([i.order for i in request_models])
    exc = HTTPException(
        status_code=400,
        detail=f"Invalid order provided for added/updated models {sorted_models}",
    )

    if len(request_models) > 0:
        if sorted_models != list(range(min(sorted_models), max(sorted_models) + 1)):
            raise exc

        if sorted_models[0] != 1:
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
