import enum
import uuid
from typing import Optional

from sqlmodel import Field, Relationship

from server.models.common import OrderedModel
from server.models_util import update_module_forward_refs


class ConditionalOperator(str, enum.Enum):
    """The different types of conditional operator that can be used for a
    ConditionalAction"""

    # date operators
    AFTER_OR_EQUAL = "after_or_equal"
    AFTER = "after"
    EQUALS_DATE = "equals_date"
    BEFORE = "before"
    BEFORE_OR_EQUAL = "before_or_equal"

    # numeric operators
    ALWAYS_EXECUTE = "always_execute"
    EQUALS = "eq"
    GREATER_THAN = "gt"
    GREATER_THAN_OR_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_THAN_OR_EQUAL = "lte"

    # generic operators
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"


class ActionType(str, enum.Enum):
    """The different action types a ConditionalAction can be"""

    CHECKPOINT = "checkpoint"
    MILESTONE = "milestone"
    PUSH = "push"
    RESTORE = "restore"
    SKIP = "skip"
    END_INTERVIEW = "end_interview"


class ConditionalActionBase(OrderedModel):
    """The base ConditionalAction model"""

    # TODO: change the payload to be an optional JSON blob
    action_payload: Optional[str]
    action_type: ActionType
    conditional_operator: ConditionalOperator
    response_key: Optional[str]
    response_key_field: Optional[str]
    screen_id: uuid.UUID = Field(foreign_key="interview_screen.id")
    value: Optional[str]


class ConditionalAction(ConditionalActionBase, table=True):
    """The ConditionalAction model as a database table."""

    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    __tablename__: str = "conditional_action"

    # relationships
    screen: "InterviewScreen" = Relationship(back_populates="actions")


class ConditionalActionCreate(ConditionalActionBase):
    """The ConditionalAction model used when creating a new model.
    `id` is optional because it is set by the database.
    """

    id: Optional[uuid.UUID]


class ConditionalActionRead(ConditionalActionBase):
    """The ConditionalAction model used in HTTP responses when reading
    from the database. Any API functions that return a ConditionalAction
    should respond with a ConditionalActionRead model or one of its
    subclasses.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID


# Handle circular imports
from server.models.interview_screen import InterviewScreen

update_module_forward_refs(__name__)
