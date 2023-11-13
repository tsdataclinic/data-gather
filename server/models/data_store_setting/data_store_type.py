import enum


class DataStoreType(str, enum.Enum):
    AIRTABLE = "airtable"
    GOOGLE_SHEETS = "google_sheets"
