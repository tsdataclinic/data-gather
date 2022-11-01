from typing import List, Optional

from sqlmodel import Field, Relationship

from server.models_util import APIModel


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
    response_id: str = Field(primary_key=True)
    screen_id: str = Field(foreign_key="interview_screen.id")
    order: int
    response_type: str
    screen: "InterviewScreen" = Relationship(back_populates="entries")
    text: str
