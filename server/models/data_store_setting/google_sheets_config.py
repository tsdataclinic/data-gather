"""This file includes the GoogleSheetsConfig models which includes
the data store schema and authentication configuration.
"""
from typing import Literal

from pydantic import BaseModel

from server.models.data_store_setting.data_store_type import DataStoreType


class GoogleSheetsAuthConfig(BaseModel):
    accessToken: str | None
    accessTokenExpires: int | None
    tokenType: str | None
    scope: str | None


class GoogleSheetsConfig(BaseModel):
    """Contains authentication configurations and the data store schema."""

    type: Literal[DataStoreType.GOOGLE_SHEETS]
    authSettings: GoogleSheetsAuthConfig
    workbooks: list[str] | None
