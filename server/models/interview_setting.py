import enum
import uuid

from typing import Optional, Union, List

from sqlmodel import Field, Relationship, UniqueConstraint
from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from pydantic import BaseModel, validator

from server.models_util import APIModel, update_module_forward_refs

class AirtableField(BaseModel):
    id: str
    name: str
    description: Optional[str]
    type: Optional[str]

    # TODO: model this type according to the Airtable API Reference for
    # field types
    options: Optional[dict]

class AirtableTable(BaseModel):
    id: str
    name: Optional[str]
    description: Optional[str]
    fields: Optional[list[AirtableField]]

class AirtableBase(BaseModel):
    name: Optional[str]
    id: str
    tables: Optional[list[AirtableTable]]
    
class AirtableSettings(BaseModel):
    apiKey: str
    bases: Optional[list[AirtableBase]]    

class InterviewSettingType(str, enum.Enum):
    AIRTABLE = "airtable"

class InterviewSettingBase(APIModel):
    """The base Interview Setting model"""
    type: InterviewSettingType

    # TODO: Union[] for further expansion when we add more settings types
    settings: AirtableSettings = Field(sa_column=Column(JSON))
    interview_id: uuid.UUID = Field(foreign_key="interview.id")

    @validator('settings')
    def validate_settings(cls, value: AirtableSettings) -> dict:
        # hacky use of validator to allow Pydantic models to be stored as JSON
        # dicts in the DB: https://github.com/tiangolo/sqlmodel/issues/63
        return value.dict(exclude_none=True)

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
