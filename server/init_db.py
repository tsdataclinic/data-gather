import logging
import os

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import SQLModel, Session
from sqlalchemy import UniqueConstraint


# import models so that the classes get registered with SQLModel
from . import models
from .engine import create_fk_constraint_engine, SQLITE_DB_PATH


LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

FAKE_INTERVIEW = {
    "created_date": "2022-01-01",
    "description": "Super important interview",
    "id": "1234abcd",
    "name": "Interview McInterviewFace",
    "notes": "some note",
}

FAKE_SCREENS = [
    {
        "order": 1,
        "header_text": "whatever",
        "id": "5678efgh",
        "interview_id": "1234abcd",
        "title": "Screen1",
        "is_in_starting_state": True,
        "starting_state_order": 1,
    },
    {
        "order": 2,
        "header_text": "whatever2",
        "id": "8910ijkl",
        "interview_id": "1234abcd",
        "title": "Screen2",
        "is_in_starting_state": False,
    },
    {
        "order": 3,
        "header_text": "whatever3",
        "id": "1112mnop",
        "interview_id": "1234abcd",
        "title": "Screen3",
        "is_in_starting_state": True,
        "starting_state_order": 2,
    },
]

FAKE_ACTIONS = [
    {
        "actionPayload": "payload_string",
        "actionType": "re",
        "id": "action123",
        "order": 1,
        "responseKey": "rkey",
        "screenId": "{}",
        "value": "someval",
    },
    {
        "actionPayload": "payload_string",
        "actionType": "re",
        "id": "{}",
        "order": 2,
        "responseKey": "rkey",
        "screenId": "5678efgh",
        "value": "someval",
    },
    {
        "actionPayload": "payload_string",
        "actionType": "re",
        "id": "action789",
        "order": 1,
        "responseKey": "rkey",
        "screenId": "{}",
        "value": "someval",
    },
]

FAKE_ENTRIES = [
    {
        "name": "somename",
        "prompt": "hello",
        "responseKey": "asdf",
        "screenId": "5678efgh",
        "order": 1,
        "responseType": "sometype",
        "text": "sometext",
    },
    {
        "name": "somename",
        "prompt": "hello",
        "responseKey": "ghjk",
        "screenId": "5678efgh",
        "order": 2,
        "responseType": "sometype",
        "text": "sometext",
    },
    {
        "name": "somename",
        "prompt": "hello",
        "responseKey": "qwer",
        "screenId": "8910ijkl",
        "order": 1,
        "responseType": "sometype",
        "text": "sometext",
    },
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
    interview = models.Interview(**FAKE_INTERVIEW)
    screens = [models.InterviewScreen(**i) for i in FAKE_SCREENS]
    actions = [models.ConditionalAction(**i) for i in FAKE_ACTIONS]
    entries = [models.InterviewScreenEntry(**i) for i in FAKE_ENTRIES]
    with Session(autocommit=False, autoflush=False, bind=engine) as session:
        session.add(interview)
        session.add_all(screens)
        session.commit()
        all_ids = session.query(models.InterviewScreen.id).limit(100).all()
        linked_actions = []
        session.add_all(actions)
        session.add_all(entries)
        session.commit()
