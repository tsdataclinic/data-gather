from typing import Literal

from pydantic import BaseModel

# TODO:
# 1. Finish modeling the GoogleSheetsSettings classes
# 2. Update the frontend model to expect this union
# 3. Add the ability to authenticate with Google Sheets
# 4. Load the schema
# 5. Update the lookup config
# 6. Update the submission actions config


class GoogleSheetsSettings(BaseModel):
    workbooks: list[str] | None
