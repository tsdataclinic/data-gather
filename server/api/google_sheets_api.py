import logging
from datetime import datetime

import gspread
import pandas as pd
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from gspread.utils import ValueRenderOption

from server.env import get_env
from server.models.data_store_setting.google_sheets_config import (
    GoogleSheetsConfig, GoogleSheetsSpreadsheet, GoogleSheetsWorksheet)

logger = logging.getLogger("google_sheets_api")
logger.setLevel(logging.INFO)

CREDENTIALS = {
    "client_id": get_env("REACT_APP_GOOGLE_SHEETS_CLIENT_ID"),
    "project_id": get_env("GOOGLE_SHEETS_PROJECT_ID"),
    "auth_uri": get_env("GOOGLE_SHEETS_AUTH_URI"),
    "token_uri": get_env("GOOGLE_SHEETS_TOKEN_URI"),
    "auth_provider_x509_cert_url": get_env("GOOGLE_SHEETS_AUTH_PROVIDER_CERT_URL"),
    "client_secret": get_env("GOOGLE_SHEETS_CLIENT_SECRET"),
    "redirect_uris": (get_env("GOOGLE_SHEETS_REDIRECT_URIS") or "").split(","),
    "javascript_origins": (get_env("GOOGLE_SHEETS_JS_ORIGINS") or "").split(","),
}

SCOPES = [get_env("REACT_APP_GOOGLE_SHEETS_SCOPE") or ""]


class GoogleSheetsAPI:
    """
    A client to query Google Sheets
    """

    def __init__(self, gsheets_config: GoogleSheetsConfig):
        if gsheets_config.authSettings.accessToken:
            oauth = gsheets_config.authSettings
            api, _ = gspread.oauth_from_dict(
                credentials={"web": CREDENTIALS},
                authorized_user_info={
                    "token": oauth.accessToken,
                    "refresh_token": oauth.refreshToken,
                    "auth_uri": CREDENTIALS["auth_uri"],
                    "token_uri": CREDENTIALS["token_uri"],
                    "client_id": CREDENTIALS["client_id"],
                    "client_secret": CREDENTIALS["client_secret"],
                    "expiry": datetime.fromtimestamp(
                        oauth.accessTokenExpires / 1000
                    ).isoformat()
                    if oauth.accessTokenExpires
                    else None,
                },
                scopes=SCOPES,
            )
            self.api = api
        else:
            logger.warning(
                "**No Google Sheets access token set. Google Sheets endpoints will not function.**"
            )

    def fetch_schema(self, spreadsheet_ids: list[str]) -> list[GoogleSheetsSpreadsheet]:
        spreadsheet_models = []

        for spreadsheet_id in spreadsheet_ids:
            spreadsheet = self.api.open_by_key(spreadsheet_id)

            worksheet_models = []
            for worksheet in spreadsheet.worksheets():
                # get the first row to extract the header
                # TODO: this assumes that the sheet is formatted appropriately, like
                # a CSV. We need to add validation for this.
                header_row = [
                    str(val)
                    for val in worksheet.get_values(
                        "1:1", value_render_option=ValueRenderOption.unformatted
                    )[0]
                ]
                worksheet_models.append(
                    GoogleSheetsWorksheet(title=worksheet.title, columns=header_row)
                )

            spreadsheet_models.append(
                GoogleSheetsSpreadsheet(
                    title=spreadsheet.title,
                    id=spreadsheet.id,
                    worksheets=worksheet_models,
                )
            )
        return spreadsheet_models
