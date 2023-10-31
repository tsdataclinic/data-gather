from datetime import datetime, timedelta

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, String
from sqlalchemy_utils import StringEncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
from sqlmodel import Field


class AirtableField(BaseModel):
    id: str
    name: str
    description: str | None
    type: str | None

    # TODO: model this type according to the Airtable API Reference for
    # field types
    options: dict | None


class AirtableTable(BaseModel):
    id: str
    name: str | None
    description: str | None
    fields: list[AirtableField] | None


class AirtableBase(BaseModel):
    name: str | None
    id: str
    tables: list[AirtableTable] | None


class AirtableAuthSettings(BaseModel):
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


class AirtableSettings(BaseModel):
    apiKey: str | None
    authSettings: AirtableAuthSettings | None
    bases: list[AirtableBase] | None
