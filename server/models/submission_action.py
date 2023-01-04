import enum
import uuid
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, Relationship

from server.models.common import OrderedModel
from server.models_util import update_module_forward_refs


class SubmissionActionType(str, enum.Enum):
    EDIT_ROW = "edit_row"
    INSERT_ROW = "insert_row"


class SubmissionActionBase(OrderedModel):
    """The base SubmissionAction model"""

    type: SubmissionActionType
    interview_id: uuid.UUID = Field(foreign_key="interview.id")
    field_mappings: dict[str, Optional[str]] = Field(sa_column=Column(JSON))

    # for an EDIT_ROW type, the `target` is an InterviewEntry id.
    # for an INSERT_ROW type, the `target` is an airtable table id
    target: str


class SubmissionAction(SubmissionActionBase, table=True):
    """The SubmissionAction model as a database table."""

    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    __tablename__: str = "submission_action"

    # relationships
    interview: "Interview" = Relationship(back_populates="submission_actions")


class SubmissionActionCreate(SubmissionActionBase):
    """The SubmissionAction model used when creating a new model.
    `id` is optional because it is set by the database.
    """

    id: Optional[uuid.UUID]


class SubmissionActionRead(SubmissionActionBase):
    """The SubmissionAction model used in HTTP responses when reading
    from the database. Any API functions that return a SubmissionAction
    should respond with a SubmissionActionRead model or one of its
    subclasses.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID


# Handle circular imports
from server.models.interview import Interview

update_module_forward_refs(__name__)