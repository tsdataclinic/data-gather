import logging
from typing import List, Optional

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import Field, Relationship, SQLModel, create_engine

from server.models_util import SQLITE_DB_PATH, APIModel

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class ConditionalAction(APIModel, table=True):
    __tablename__: str = "conditional_action"
    action_payload: str
    action_type: str
    id: str = Field(primary_key=True)
    order: int
    response_key: str
    screen_id: str = Field(foreign_key="interview_screen.id")
    screen: "InterviewScreen" = Relationship(back_populates="actions")
    value: str


class Interview(APIModel, table=True):
    __tablename__: str = "interview"
    created_date: str
    description: str
    id: str = Field(primary_key=True)
    name: str
    notes: str
    screens: List["InterviewScreen"] = Relationship(back_populates="interview")


class InterviewScreen(APIModel, table=True):
    __tablename__: str = "interview_screen"
    actions: List["ConditionalAction"] = Relationship(back_populates="screen")
    entries: List["InterviewScreenEntry"] = Relationship(back_populates="screen")
    order: int
    header_text: str
    id: str = Field(primary_key=True)
    interview_id: str = Field(foreign_key="interview.id")
    interview: "Interview" = Relationship(back_populates="screens")
    title: str
    is_in_starting_state: bool
    starting_state_order: Optional[int]


class InterviewScreenEntry(APIModel, table=True):
    __tablename__: str = "interview_screen_entry"
    name: str
    prompt: str
    response_key: str = Field(primary_key=True)
    screen_id: str = Field(foreign_key="interview_screen.id")
    order: int
    response_type: str
    screen: "InterviewScreen" = Relationship(back_populates="entries")
    text: str


def initialize_dev_db(file_path: str = SQLITE_DB_PATH):
    """Set up the SQLite database"""
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_engine(url)
    SQLModel.metadata.create_all(engine)
