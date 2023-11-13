"""This file includes the AirtableConfig models which includes
the data store schema and authentication configuration.
"""
from datetime import datetime, timedelta
from typing import Any, Literal

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, String
from sqlalchemy_utils.types.encrypted.encrypted_type import (
    AesEngine,
    StringEncryptedType,
)
from sqlmodel import Field

from server.models.data_store_setting.data_store_type import DataStoreType


class AirtableField(BaseModel):
    id: str
    name: str
    description: str | None
    type: str | None

    # Field options are here:
    # https://airtable.com/developers/web/api/field-model
    options: dict[str, Any] | None


class AirtableTable(BaseModel):
    id: str
    name: str | None
    description: str | None
    fields: list[AirtableField]


class AirtableBase(BaseModel):
    name: str | None
    id: str
    tables: list[AirtableTable]


class AirtableAuthConfig(BaseModel):
    accessToken: str = Field(
        sa_column=Column(StringEncryptedType(String(255), "key", AesEngine, "pkcs5")),
        nullable=False,
        default="access_token",
    )
    accessTokenExpires: int = Field(
        sa_column=Column(DateTime),
        default=(datetime.now() + timedelta(minutes=59)).timestamp() * 1000,
    )
    refreshToken: str = Field(
        sa_column=Column(StringEncryptedType(String(255), "key", AesEngine, "pkcs5")),
        nullable=False,
        default="refresh_token",
    )
    refreshTokenExpires: int = Field(
        sa_column=Column(DateTime),
        default=(datetime.now() + timedelta(days=59)).timestamp() * 1000,
    )
    tokenType: str | None
    scope: str | None


class AirtableConfig(BaseModel):
    """Contains authentication configurations and the data store schema."""

    type: Literal[DataStoreType.AIRTABLE]
    apiKey: str | None = None
    authSettings: AirtableAuthConfig

    # An Airtable schema is represented by a list of bases
    bases: list[AirtableBase] | None = None
