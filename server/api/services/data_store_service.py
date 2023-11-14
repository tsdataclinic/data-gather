from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from server.api.airtable_api import AirtableAPI
from server.api.google_sheets_api import GoogleSheetsAPI
from server.api.services.base_service import BaseService
from server.api.services.interview_service import InterviewService
from server.models.data_store_setting.data_store_type import DataStoreType
from server.models.interview import Interview


class GoogleSheetsUpdateSchemaOptions(BaseModel):
    spreadsheetIds: list[str]


class DataStoreService(BaseService):
    def __init__(self, db: Session):
        super(DataStoreService, self).__init__(db)
        self.interview_service = InterviewService(db)

    def update_schema(
        self,
        data_store_type: DataStoreType,
        interview_id: str,
        options: GoogleSheetsUpdateSchemaOptions | None = None,
    ) -> Interview:
        """
        Fetch the updated data store schema for a given data store type (e.g.
        airtable or google sheets) and store the updated schema for the given
        interview id.
        """
        if data_store_type == DataStoreType.AIRTABLE:
            airtable_config = self.interview_service.get_airtable_config(interview_id)
            airtable_config.bases = AirtableAPI(airtable_config).fetch_schema()
            return self.interview_service.update_data_store_config(
                interview_id, airtable_config
            )
        elif data_store_type == DataStoreType.GOOGLE_SHEETS and options:
            gsheets_config = self.interview_service.get_google_sheets_config(
                interview_id
            )
            gsheets_config.spreadsheets = GoogleSheetsAPI(gsheets_config).fetch_schema(
                options.spreadsheetIds
            )
            print("config to write")
            print(gsheets_config)
            print("as dict")
            print(gsheets_config.dict(exclude_none=True))
            return self.interview_service.update_data_store_config(
                interview_id, gsheets_config
            )
        raise HTTPException(500, detail="Invalid data store type received")
