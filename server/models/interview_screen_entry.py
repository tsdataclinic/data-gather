import enum
import uuid
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, Relationship

from server.models.common import OrderedModel
from server.models_util import update_module_forward_refs


class ResponseType(str, enum.Enum):
    """The different types of responses that can be used in a screen entry"""

    AIRTABLE = "airtable"
    BOOLEAN = "boolean"
    EMAIL = "email"
    NUMBER = "number"
    PHONE_NUMBER = "phone_number"
    TEXT = "text"


class InterviewScreenEntryBase(OrderedModel):
    """The base InterviewScreenEntry model"""

    name: str
    prompt: str
    response_key: str
    response_type: ResponseType
    response_type_options: dict = Field(sa_column=Column(JSON))
    screen_id: uuid.UUID = Field(foreign_key="interview_screen.id")
    text: str


class InterviewScreenEntry(InterviewScreenEntryBase, table=True):
    """The InterviewScreenEntry model as a database table."""

    __tablename__: str = "interview_screen_entry"
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )

    # relationships
    screen: "InterviewScreen" = Relationship(back_populates="entries")


class InterviewScreenEntryCreate(InterviewScreenEntryBase):
    """The InterviewScreenEntry model used when creating a new model.
    `id` is optional because it is set by the database.
    """

    id: Optional[uuid.UUID]


class InterviewScreenEntryRead(InterviewScreenEntryBase):
    """The InterviewScreenEntry model used in HTTP responses when reading
    from the database.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID


# Handle circular imports
from server.models.interview_screen import InterviewScreen

update_module_forward_refs(__name__)
