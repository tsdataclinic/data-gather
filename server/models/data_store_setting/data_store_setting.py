import uuid
from typing import Optional

from pydantic import validator
from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy_json import mutable_json_type  # pylint: disable=import-error
from sqlmodel import Field, Relationship

from server.models.data_store_setting.airtable_config import AirtableConfig
from server.models.data_store_setting.data_store_type import DataStoreType
from server.models.data_store_setting.google_sheets_config import GoogleSheetsConfig
from server.models_util import APIModel, update_module_forward_refs

DataStoreConfig = AirtableConfig | GoogleSheetsConfig


class DataStoreSettingBase(APIModel):
    """The base Interview Setting model"""

    type: DataStoreType

    # mutable_json_type => for mutation tracking of JSON objects
    # https://amercader.net/blog/beware-of-json-fields-in-sqlalchemy/
    config: DataStoreConfig = Field(
        sa_column=Column(mutable_json_type(dbtype=JSON, nested=True))
    )

    interview_id: uuid.UUID = Field(foreign_key="interview.id")

    @validator("config")
    def validate_settings(  # pylint: disable=no-self-argument
        cls, value: DataStoreConfig
    ) -> dict:
        # hacky use of validator to allow Pydantic models to be stored as JSON
        # dicts in the DB: https://github.com/tiangolo/sqlmodel/issues/63
        return value.dict(exclude_none=True)


class DataStoreSetting(DataStoreSettingBase, table=True):
    """The DataStoreSetting model as a database table."""

    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    __tablename__: str = "data_store_setting"

    # relationships
    interview: "Interview" = Relationship(back_populates="interview_settings")


class DataStoreSettingCreate(DataStoreSettingBase):
    """The DataStoreSetting model used when creating a new model.
    `id` is optional because it is set by the database.
    """

    id: Optional[uuid.UUID]


class DataStoreSettingRead(DataStoreSettingBase):
    """The DataStoreSetting model used in HTTP responses when reading
    from the database. Any API functions that return a DataStoreSetting
    should respond with a DataStoreSettingRead model or one of its
    subclasses.

    `id` is not optional because it must exist already if it's in the database.
    """

    id: uuid.UUID


# Handle circular imports
# pylint: disable-next=unused-import,wrong-import-position
from server.models.interview import Interview

update_module_forward_refs(__name__)
