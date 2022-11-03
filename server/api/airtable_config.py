import os
import sys


AIRTABLE_API_KEY='keybFtY1Wg1J90voc'
AIRTABLE_BASE_ID='app2WLZ1wbCovkn2H'

AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')

missing = []
if not AIRTABLE_API_KEY:
    missing.append('AIRTABLE_API_KEY')
if not AIRTABLE_BASE_ID:
    missing.append('AIRTABLE_BASE_ID')

if missing:
    raise EnvironmentError(f"Set required environment variables: {missing}")