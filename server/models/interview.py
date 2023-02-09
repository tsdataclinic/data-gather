import uuid
from datetime import datetime
from typing import Optional, Union

from sqlalchemy.orm import validates
from sqlmodel import Field, Relationship, UniqueConstraint

from server.models_util import APIModel, update_module_forward_refs


class ValidationError(Exception):
    pass


class InterviewBase(APIModel):
    """The base Interview model"""

    description: str
    name: str
    notes: str
    vanity_url: Optional[str]
    published: bool
    owner_id: str = Field(foreign_key="user.id")
    default_language: str

    # store allowed languages as a semicolon-separated string
    allowed_languages: str


class Interview(InterviewBase, table=True):
    """The Interview model as a database table."""

    __tablename__: str = "interview"
    __table_args__ = (UniqueConstraint("vanity_url"),)
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    created_date: Optional[datetime] = Field(
        default_factory=datetime.utcnow, nullable=False
    )

    # relationships
    screens: list["InterviewScreen"] = Relationship(back_populates="interview")
    submission_actions: list["SubmissionAction"] = Relationship(
        back_populates="interview"
    )
    owner: "User" = Relationship(back_populates="interviews")

    @validates("published")
    def validate_publish(self, key, published):
        if published and not self.vanity_url:
            raise ValidationError(f"Published Interview must have a vanity url")


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


class InterviewReadWithScreensAndActions(InterviewRead):
    """The InterviewRead model including nested screens."""

    screens: list["InterviewScreenRead"] = []
    submission_actions: list["SubmissionActionRead"] = []


class InterviewUpdate(InterviewRead):
    """The Interview model used on update requests. This model allows updating
    the nested submissionActions.
    """

    submission_actions: list[Union["SubmissionActionRead", "SubmissionActionCreate"]]


# Handle circular imports
from server.models.interview_screen import InterviewScreen, InterviewScreenRead
from server.models.submission_action import (
    SubmissionAction,
    SubmissionActionCreate,
    SubmissionActionRead,
)
from server.models.user import User

update_module_forward_refs(__name__)
