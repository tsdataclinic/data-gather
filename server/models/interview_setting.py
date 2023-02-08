import enum
import uuid

from typing import Optional, Union, List

from sqlmodel import Field, Relationship, UniqueConstraint
from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from pydantic import BaseModel

from server.models_util import APIModel, update_module_forward_refs

class AirtableField(BaseModel):
    description: Optional[str]
    id: str
    name: str
    type: Optional[str]

class AirtableTable(BaseModel):
    id: str
    name: str
    description: Optional[str]
    fields: list[AirtableField]
    
class AirtableSettings(BaseModel):
    access_token: str
    base_id: Optional[str]
    tables: Optional[list[AirtableTable]]

class InterviewSettingType(str, enum.Enum):
    AIRTABLE = "airtable"

class InterviewSettingBase(APIModel):
    """The base Interview Setting model"""
    type: InterviewSettingType
    # Union[] for further expansion
    settings: dict[str, Union[AirtableSettings, None]] = Field(sa_column=Column(JSON))
    interview_id: uuid.UUID = Field(foreign_key="interview.id")

class InterviewSetting(InterviewSettingBase, table=True):
    """The InterviewSetting model as a database table. """
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    __tablename__: str = "interview_setting"

    # relationships
    interview: "Interview" = Relationship(back_populates="interview_settings")

class InterviewSettingCreate(InterviewSettingBase):
    """The InterviewSetting model used when creating a new model.
    `id` is optional because it is set by the database.
    """

    id: Optional[uuid.UUID]


class InterviewSettingRead(InterviewSettingBase):
    """The InterviewSetting model used in HTTP responses when reading
    from the database. Any API functions that return a InterviewSetting
    should respond with a InterviewSettingRead model or one of its
    subclasses.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID

# Handle circular imports
from server.models.interview import Interview

update_module_forward_refs(__name__)
