import logging

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import Session, SQLModel

# import all models so that the classes get registered with SQLModel
from . import models
from .engine import SQLITE_DB_PATH, create_fk_constraint_engine

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

FAKE_INTERVIEW = models.interview.Interview(
    description="Super important interview",
    name="Interview McInterviewFace",
    notes="some note",
)


def generate_fake_screens(
    interview: models.interview.Interview,
) -> models.interview.Interview:
    if interview.id:
        interview.screens = [
            models.interview_screen.InterviewScreen(
                order=1,
                header_text="whatever",
                interview_id=interview.id,
                title="Screen1",
                is_in_starting_state=True,
                starting_state_order=1,
            ),
            models.interview_screen.InterviewScreen(
                order=2,
                header_text="whatever2",
                interview_id=interview.id,
                title="Screen2",
                is_in_starting_state=False,
                starting_state_order=None,
            ),
            models.interview_screen.InterviewScreen(
                order=3,
                header_text="whatever3",
                interview_id=interview.id,
                title="Screen3",
                is_in_starting_state=True,
                starting_state_order=2,
            ),
        ]
    return interview


def generate_fake_actions(
    screen1: models.interview_screen.InterviewScreen,
    screen2: models.interview_screen.InterviewScreen,
    screen3: models.interview_screen.InterviewScreen,
) -> None:
    if screen1.id:
        screen1.actions = [
            models.conditional_action.ConditionalAction(
                action_payload=f"{screen2.id};{screen3.id}",
                action_type=models.conditional_action.ActionType.PUSH,
                order=1,
                response_key="rkey",
                screen_id=screen1.id,
                value=None,
                conditional_operator=models.conditional_action.ConditionalOperator.ALWAYS_EXECUTE,
            ),
        ]

    if screen2.id:
        screen2.actions = [
            models.conditional_action.ConditionalAction(
                action_payload=f"{screen3.id}",
                action_type=models.conditional_action.ActionType.PUSH,
                order=1,
                response_key="rkey",
                screen_id=screen2.id,
                value=None,
                conditional_operator=models.conditional_action.ConditionalOperator.ALWAYS_EXECUTE,
            ),
        ]


def generate_fake_entries(
    screen1: models.interview_screen.InterviewScreen,
    screen2: models.interview_screen.InterviewScreen,
) -> None:
    # TODO: change this once we have a different expected response_type_options
    # depending on the response type
    default_response_type_options = {
        "selectedBase": "",
        "selectedTable": "",
        "selectedFields": [],
    }
    if screen1.id:
        screen1.entries = [
            models.interview_screen_entry.InterviewScreenEntry(
                name="First Entry",
                prompt="hello",
                response_key="asdf",
                order=1,
                response_type=models.interview_screen_entry.ResponseType.TEXT,
                text="sometext",
                screen_id=screen1.id,
                response_type_options=default_response_type_options,
            ),
            models.interview_screen_entry.InterviewScreenEntry(
                name="Second Entry",
                prompt="hello",
                response_key="ghjk",
                screen_id=screen1.id,
                order=2,
                response_type=models.interview_screen_entry.ResponseType.NUMBER,
                text="sometext",
                response_type_options=default_response_type_options,
            ),
        ]

    if screen2.id:
        screen2.entries = [
            models.interview_screen_entry.InterviewScreenEntry(
                name="First Entry",
                prompt="hello",
                response_key="qwer",
                screen_id=screen2.id,
                order=1,
                response_type=models.interview_screen_entry.ResponseType.BOOLEAN,
                text="sometext",
                response_type_options=default_response_type_options,
            ),
        ]


def initialize_dev_db(file_path: str = SQLITE_DB_PATH):
    """Set up the SQLite database"""
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_fk_constraint_engine(file_path)
    SQLModel.metadata.create_all(engine)


def populate_dev_db(file_path: str = SQLITE_DB_PATH):
    """Populate the dev database with dummy data"""
    LOG.info("Populating DB with dummy data")
    engine = create_fk_constraint_engine(file_path)

    interview = generate_fake_screens(FAKE_INTERVIEW)

    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        screens = interview.screens

        session.add(interview)

        # commit changes and refresh so we pull in ID's assigned to interview
        # and screens
        session.commit()

        for screen in screens:
            session.refresh(screen)

        generate_fake_actions(screens[0], screens[1], screens[2])
        generate_fake_entries(screens[0], screens[1])

        session.commit()
