import uuid
from typing import Optional, Union

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, Relationship

from server.models.common import OrderedModel
from server.models_util import update_module_forward_refs


class InterviewScreenBase(OrderedModel):
    """The base InterviewScreen model"""

    header_text: dict = Field(sa_column=Column(JSON))
    title: dict = Field(sa_column=Column(JSON))
    is_in_starting_state: bool
    starting_state_order: Optional[int]
    interview_id: uuid.UUID = Field(foreign_key="interview.id")


class InterviewScreen(InterviewScreenBase, table=True):
    """The InterviewScreen model as a database table."""

    __tablename__: str = "interview_screen"
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )

    # relationships
    actions: list["ConditionalAction"] = Relationship(back_populates="screen")
    entries: list["InterviewScreenEntry"] = Relationship(back_populates="screen")
    interview: "Interview" = Relationship(back_populates="screens")


class InterviewScreenCreate(InterviewScreenBase):
    """The InterviewScreen model used when creating a new model.
    `id` and `order` are optional because these are set by the database.
    """

    id: Optional[uuid.UUID]
    order: Optional[int]


class InterviewScreenRead(InterviewScreenBase):
    """The InterviewScreen model used in HTTP responses when reading from the
    database.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID


class InterviewScreenReadWithChildren(InterviewScreenRead):
    """The InterviewScreenRead model including any nested children
    (actions and entries)"""

    actions: list["ConditionalActionRead"] = []
    entries: list["InterviewScreenEntryRead"] = []


class InterviewScreenUpdate(InterviewScreenRead):
    """The InterviewScreen model used on update requests.
    We allow nested updates (passing the nested actions and entries) and we also
    allow creating new actions and entries with this update.
    """

    actions: list[Union["ConditionalActionRead", "ConditionalActionCreate"]]
    entries: list[Union["InterviewScreenEntryRead", "InterviewScreenEntryCreate"]]


# Handle circular imports
from server.models.conditional_action import (
    ConditionalAction,
    ConditionalActionCreate,
    ConditionalActionRead,
)
from server.models.interview import Interview
from server.models.interview_screen_entry import (
    InterviewScreenEntry,
    InterviewScreenEntryCreate,
    InterviewScreenEntryRead,
)

update_module_forward_refs(__name__)
