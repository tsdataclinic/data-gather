import enum
import uuid
from typing import Optional, Union

from pydantic import BaseModel
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Column, Field, Relationship

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
    EQUALS = "eq"
    GREATER_THAN = "gt"
    GREATER_THAN_OR_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_THAN_OR_EQUAL = "lte"

    # generic operators
    ALWAYS_EXECUTE = "always_execute"
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"


class ActionType(str, enum.Enum):
    """The different action types a ConditionalAction can be"""

    CHECKPOINT = "checkpoint"
    DO_NOTHING = "do_nothing"
    MILESTONE = "milestone"
    PUSH = "push"
    RESTORE = "restore"
    SKIP = "skip"
    END_INTERVIEW = "end_interview"


class SingleCondition(BaseModel):
    conditionalOperator: ConditionalOperator
    responseKey: Optional[str]
    responseKeyLookupField: Optional[str]
    value: Optional[str]
    id: str


class ConditionGroupType(str, enum.Enum):
    AND = "and"
    OR = "or"


class ConditionGroup(BaseModel):
    type: ConditionGroupType
    conditions: list[Union["ConditionGroup", SingleCondition]]
    id: str


class ActionConfig(BaseModel):
    # TODO: change the payload to be an optional JSON blob
    payload: Optional[str]
    type: ActionType
    id: str


class IfClause(BaseModel):
    """An IfClause represents the following logic:
    if (condition) then `action`
    else `action`

    The else clause could nest another IfClause in it
    recursively.

    In other words, every IfClause executes an action if true, otherwise
    it executes a different action or it evaluates another IfClause.
    """

    action: ActionConfig
    conditionGroup: ConditionGroup
    elseClause: Union[ActionConfig, "IfClause"]
    id: str


class ConditionalActionBase(OrderedModel):
    """The base ConditionalAction model"""

    if_clause: IfClause = Field(sa_column=Column(JSON))
    screen_id: uuid.UUID = Field(foreign_key="interview_screen.id")


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
