from server.env import get_env

# TODO: rename this file because we have an AirtableConfig model
# that refers to the user-specific config.
# Perhaps `airtable_env.py`?
REACT_APP_CLIENT_URI = get_env("REACT_APP_CLIENT_URI")
REACT_APP_SERVER_URI = get_env("REACT_APP_SERVER_URI")
AIRTABLE_API_KEY = get_env("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = get_env("AIRTABLE_BASE_ID")
AIRTABLE_CLIENT_ID = get_env("AIRTABLE_CLIENT_ID")
AIRTABLE_CLIENT_SECRET = get_env("AIRTABLE_CLIENT_SECRET")
AIRTABLE_AUTH_URL = get_env("AIRTABLE_AUTH_URL")
AIRTABLE_SCOPE = get_env("AIRTABLE_SCOPE")
AIRTABLE_TOKEN_URL = get_env("AIRTABLE_TOKEN_URL")
