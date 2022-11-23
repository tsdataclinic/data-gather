import enum
import logging
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func
from sqlmodel import Enum, Field, Relationship

from server.models_util import APIModel

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class Interview(APIModel, table=True):
    """This model represents an Interview's metadata"""

    __tablename__: str = "interview"
    created_date: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    description: str
    id: str = Field(primary_key=True)
    name: str
    notes: str

    # relationships
    screens: list["InterviewScreen"] = Relationship(back_populates="interview")

# class PublishedInterview(APIModel, table=True):
#     __tablename__: str = "published_interview"
#     interview_id: str = Field(foreign_key="interview.id")
#     vanity_url: str



class OrderedModel(APIModel):
    order: int


class InterviewScreen(OrderedModel, table=True):
    __tablename__: str = "interview_screen"
    order: int = 0
    header_text: str
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    interview_id: str = Field(foreign_key="interview.id")
    title: str
    starting_state_order: int = 0

    # relationships
    actions: list["ConditionalAction"] = Relationship(back_populates="screen")
    entries: list["InterviewScreenEntry"] = Relationship(back_populates="screen")
    interview: Interview = Relationship(back_populates="screens")


class InterviewScreenEntry(OrderedModel, table=True):
    __tablename__: str = "interview_screen_entry"
    name: str
    prompt: str
    response_key: str = Field(primary_key=True)
    screen_id: uuid.UUID = Field(foreign_key="interview_screen.id")
    response_type: str
    text: str

    # relationships
    screen: InterviewScreen = Relationship(back_populates="entries")

    def getId(self):
        return self.response_key


class ConditionalOperator(str, enum.Enum):
    """The different types of conditional operator that can be used for a
    ConditionalAction"""

    ALWAYS_EXECUTE = "ALWAYS_EXECUTE"
    EQUALS = "eq"
    GREATER_THAN = "gt"
    GREATER_THAN_OR_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_THAN_OR_EQUAL = "lte"


class ActionType(str, enum.Enum):
    """The different action types a ConditionalAction can be"""

    CHECKPOINT = "checkpoint"
    MILESTONE = "milestone"
    PUSH = "push"
    RESTORE = "restore"
    SKIP = "skip"


class ConditionalAction(OrderedModel, table=True):
    __tablename__: str = "conditional_action"
    action_payload: str
    action_type: ActionType = Field(sa_column=Column(Enum(ActionType)))
    conditional_operator: ConditionalOperator = Field(
        sa_column=Column(Enum(ConditionalOperator))
    )
    id: str = Field(primary_key=True)
    order: int
    response_key: str
    screen_id: uuid.UUID = Field(foreign_key="interview_screen.id")
    value: str

    # relationships
    screen: InterviewScreen = Relationship(back_populates="actions")

    def getId(self):
        return self.id
