import logging
from typing import List

from sqlmodel import SQLModel, Field, Relationship, create_engine

from sqlalchemy import create_engine
from sqlalchemy import Column, ForeignKey
from sqlalchemy import String, Integer
from sqlalchemy.orm import declarative_base, relationship

from sqlalchemy_utils import create_database, database_exists

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def to_camel(string):
    parts = string.split("_")
    head = parts[0].lower()
    tail = [i.capitalize() for i in parts[1:]]
    return f"{head}{''.join(tail)}"


class ConditionalAction(SQLModel, table=True):
    action_payload: str
    action_type: str
    id: str = Field(primary_key=True)
    order: int
    response_key: str
    screen_id: str = Field(foreign_key="interviewscreen.id")
    screen: "InterviewScreen" = Relationship(back_populates="actions")
    value: str

<<<<<<< HEAD
    id = Column(String, primary_key=True)
    name = Column(String)
    notes: Column(String)
    screens: relationship("InterviewScreen")
    startingState: relationship("InterviewScreen")
=======
>>>>>>> Converted use of sqlalchemy_pydantic to SQLModel added Post endpoint

class Interview(SQLModel, table=True):
    created_date: str
    description: str
    id: str = Field(primary_key=True)
    name: str
    notes: str
    screens: List["InterviewScreen"] = Relationship(back_populates="interview")
    startingState: List["InterviewScreen"] = Relationship(back_populates="interview")

    # class Config:
    #     alias_generator = to_camel


class InterviewScreen(SQLModel, table=True):
    actions: List["ConditionalAction"] = Relationship(back_populates="screen")
    entries: List["InterviewScreenEntry"] = Relationship(back_populates="screen")
    order: int
    header_text: str
    id: str = Field(primary_key=True)
    interview_id: str = Field(foreign_key="interview.id")
    interview: "Interview" = Relationship(back_populates="screens")
    title: str


class InterviewScreenEntry(SQLModel, table=True):
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
