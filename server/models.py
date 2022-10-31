import logging
import re
from typing import List

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import Field, Relationship, SQLModel, create_engine

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def snake_to_camel(snake_str: str) -> str:
    '''Convert a snake_case string to camelCase'''
    # upper case each part of the string.
    # str.title() handles snake case. e.g. ab_cd => Ab_Cd
    camel = snake_str.title()
    # remove underscores
    camel = re.sub("([0-9A-Za-z])_(?=[0-9A-Z])", lambda m: m.group(1), camel)
    # make the first character lowercase
    camel = re.sub("(^_*[A-Z])", lambda m: m.group(1).lower(), camel)
    return camel

class APIConfig(SQLModel.Config):
    '''This config is used for any models that are returned by our API to
    automatically convert snake_case fields to camelCase'''
    allow_population_by_field_name = True
    alias_generator = snake_to_camel


class ConditionalAction(SQLModel, table=True):
    Config = APIConfig
    action_payload: str
    action_type: str
    id: str = Field(primary_key=True)
    order: int
    response_key: str
    screen_id: str = Field(foreign_key="interviewscreen.id")
    screen: "InterviewScreen" = Relationship(back_populates="actions")
    value: str

class Interview(SQLModel, table=True):
    Config = APIConfig
    created_date: str
    description: str
    id: str = Field(primary_key=True)
    name: str
    notes: str
    screens: List["InterviewScreen"] = Relationship(back_populates="interview")
    startingState: List["InterviewScreen"] = Relationship(back_populates="interview")

class InterviewScreen(SQLModel, table=True):
    Config = APIConfig
    actions: List["ConditionalAction"] = Relationship(back_populates="screen")
    entries: List["InterviewScreenEntry"] = Relationship(back_populates="screen")
    order: int
    header_text: str
    id: str = Field(primary_key=True)
    interview_id: str = Field(foreign_key="interview.id")
    interview: "Interview" = Relationship(back_populates="screens")
    title: str


class InterviewScreenEntry(SQLModel, table=True):
    Config = APIConfig
    name: str
    prompt: str
    response_id: str = Field(primary_key=True)
    screen_id: str = Field(foreign_key="interviewscreen.id")
    order: int
    response_type: str
    screen: "InterviewScreen" = Relationship(back_populates="entries")
    text: str


def initialize_dev_db(file_path: str):
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_engine(url)
    SQLModel.metadata.create_all(engine)
