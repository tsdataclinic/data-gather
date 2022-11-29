# from __future__ import annotations  # this is important to have at the top

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship

from server.models_util import APIModel, update_module_forward_refs


class InterviewBase(APIModel):
    """The base Interview model"""

    description: str
    name: str
    notes: str


class Interview(InterviewBase, table=True):
    """The Interview model as a database table."""

    __tablename__: str = "interview"
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    created_date: Optional[datetime] = Field(
        default_factory=datetime.utcnow, nullable=False
    )

    # relationships
    screens: list["InterviewScreen"] = Relationship(back_populates="interview")


class InterviewCreate(InterviewBase):
    """The Interview model used when creating a new model.
    `id` and `created_date` are optional because these are set by the database.
    """

    id: Optional[uuid.UUID]
    created_date: Optional[datetime]


class InterviewRead(InterviewBase):
    """The Interview model used as in HTTP responses when reading from the
    database. Any API functions that return an Interview should respond
    with an InterviewRead model or one of its subclasses.

    `id` and `created_date` are not optional because they must exist already
    if they are in the database.
    """

    id: uuid.UUID
    created_date: datetime


class InterviewReadWithScreens(InterviewRead):
    """The InterviewRead model including nested screens."""

    screens: list["InterviewScreenRead"] = []


class InterviewUpdate(InterviewRead):
    """The Interview model used on update requests."""

    pass


# Handle circular imports
from server.models.interview_screen import InterviewScreen, InterviewScreenRead

update_module_forward_refs(__name__)
