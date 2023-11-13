"""This file includes the GoogleSheetsConfig models which includes
the data store schema and authentication configuration.
"""
from typing import Literal

from pydantic import BaseModel

from server.models.data_store_setting.data_store_type import DataStoreType


class GoogleSheetsConfig(BaseModel):
    """Contains authentication configurations and the data store schema."""

    type: Literal[DataStoreType.GOOGLE_SHEETS]
    workbooks: list[str] | None
