from typing import Literal

from pydantic import BaseModel


class GoogleSheetsSettings(BaseModel):
    workbooks: list[str] | None
