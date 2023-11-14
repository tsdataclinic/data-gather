"""This file includes the GoogleSheetsConfig models which includes
the data store schema and authentication configuration.
"""
from datetime import datetime, timedelta
from typing import Literal

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, String
from sqlalchemy_utils.types.encrypted.encrypted_type import (
    AesEngine,
    StringEncryptedType,
)
from sqlmodel import Field

from server.models.data_store_setting.data_store_type import DataStoreType


class GoogleSheetsAuthConfig(BaseModel):
    accessToken: str | None = Field(
        sa_column=Column(StringEncryptedType(String(255), "key", AesEngine, "pkcs5")),
        nullable=False,
        default="access_token",
    )
    accessTokenExpires: int | None = Field(
        sa_column=Column(DateTime),
        default=(datetime.now() + timedelta(minutes=59)).timestamp() * 1000,
    )
    refreshToken: str | None = Field(
        sa_column=Column(StringEncryptedType(String(255), "key", AesEngine, "pkcs5")),
        nullable=False,
        default="refresh_token",
    )


class GoogleSheetsWorksheet(BaseModel):
    title: str
    columns: list[str]


class GoogleSheetsSpreadsheet(BaseModel):
    title: str
    id: str
    worksheets: list[GoogleSheetsWorksheet]


class GoogleSheetsConfig(BaseModel):
    """Contains authentication configurations and the data store schema."""

    type: Literal[DataStoreType.GOOGLE_SHEETS]
    authSettings: GoogleSheetsAuthConfig

    # A GoogleSheets schema is represented by a list of spreadsheets
    spreadsheets: list[GoogleSheetsSpreadsheet] | None = None
