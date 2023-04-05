from datetime import datetime
import json
import logging
import sys
from typing import Any, cast

import requests
from fastapi import HTTPException
from pyairtable import Api
from pyairtable.formulas import FIELD, FIND, LOWER, OR, STR_VALUE

from server.models.interview_setting import AirtableBase, AirtableField, AirtableSettings, AirtableTable

# https://pyairtable.readthedocs.io/en/latest/api.html

Record = dict[str, Any]
PartialRecord = dict[str, Any]

logger = logging.getLogger("airtable_api")
logger.setLevel(logging.INFO)

f = logging.Formatter("%(levelname)s:\t  %(filename)s [L%(lineno)d]: %(message)s")
h = logging.StreamHandler(sys.stdout)
h.setFormatter(f)

logger.addHandler(h)


def airtable_errors_wrapped(func):
    """
    Decorates a function that queries airtable.

    Ordinarily, an error thrown by the Airtable API would cause an error
    500 returned by this API. This decorator forwards the error
    from Airtable instead, complete with proper error codes and helpful
    explanatory messages.
    """

    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.HTTPError as e:
            logger.error(
                f"Receieved error from Airtable when calling {func.__name__}(args={args}, kwargs={kwargs}): {e}"
            )
            if e.response.status_code == 404:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Resource at {e.request.url} not found",
                )
            if e.response.status_code == 400:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Bad Request: {e.response.reason}",
                )
            if e.response.status_code == 422:
                airtable_error = json.loads(e.response.content)["error"]
                error_message = f"{airtable_error['type']}: {airtable_error['message']}"
                raise HTTPException(
                    status_code=e.response.status_code, detail=error_message
                )
            raise

    return wrapped


class AirtableAPI:
    """
    A client to query an Airtable base.
    """

    def __init__(self, airtableSettings: AirtableSettings):
        if not airtableSettings['authSettings']['accessToken']:
            logger.warn(
                "**No Airtable API key set. Airtable endpoints will not function.**"
            )

        self.api = Api(airtableSettings['authSettings']['accessToken'])

    @airtable_errors_wrapped
    def fetch_record(self, base_id: str, table_name: str, id: str) -> Record:
        """
        Fetch a record with a particular id from a table on Airtable.

        Arguments:
        - table_name: The name of the table to be queried
        - id: The id of the record to be returned

        Returns: An Airtable record
        """
        logger.debug(f"Fetching record {id} in {table_name}")
        return self.api.get(base_id, table_name, id)

    @airtable_errors_wrapped
    def search_records(self, base_id: str, table_name: str, query: PartialRecord) -> list[Record]:
        """
        Fetch all records from a table on Airtable that partially match a
        particular query. If query is empty, all the records in the table are
        returned.

        Arguments:
        - table_name: The name of the table to be queried
        - query: a dictionary from query keys to query terms

        Returns: A list of records matching that query
        """
        logger.debug(
            f"Fetching records in base: {base_id} table: {table_name}" + (f"with {query = }" if query else "")
        )
        find_statements = [
            FIND(LOWER(STR_VALUE(query_val)), LOWER(FIELD(field_name)))
            for field_name, query_val in query.items()
        ]
        find_formula = OR(*find_statements)
        results = self.api.all(base_id, table_name, formula=find_formula)
        return results

    @airtable_errors_wrapped
    def create_record(self, base_id: str, table_name: str, record: Record) -> Record:
        """
        Create a record in an airtable table

        Arguments:
        - table_name: The name of the table to insert the record into
        - record: The record to insert into the table

        Returns: The new record
        """
        logger.debug(f"Creating new record in base: {base_id} table: {table_name}: {record}")
        return self.api.create(base_id, table_name, record, typecast=True)

    @airtable_errors_wrapped
    def update_record(self, base_id: str, table_name: str, id: str, update: PartialRecord) -> Record:
        """
        Update a record with a specific id in an airtable table

        Arguments:
        - table_name: The name of the table to update the record in
        - id: The id of the record to update
        - update: The fields in the record to update. All other fields will remain unmodified

        Returns:
        - The updated response
        """
        logger.debug(f"Updating record {id} in base: {base_id} table: {table_name}: {update}")
        return cast(
            dict,
            self.api.update(
                base_id=base_id,
                table_name=table_name,
                record_id=id,
                fields=update,
                typecast=True,
            ),
        )

    def fetch_schema(self, airtableSettings: AirtableSettings):
        new_airtable_settings = {}
        new_airtable_settings['bases'] = []

        basesResponse = self.fetch_bases(airtableSettings)
        for base in basesResponse['bases']:
            base_to_append = {}
            base_to_append['id'] = base['id']
            base_to_append['name'] = base['name']
            base_to_append['tables'] = []

            baseSchema = self.fetch_base_schema(airtableSettings, base['id'])
            for table in baseSchema['tables']:
                table_to_append = {}
                table_to_append['id'] = table['id']
                table_to_append['name'] = table['name']
                table_to_append['description'] = table['description'] if 'description' in table  else ''
                table_to_append['fields'] = []

                for field in table['fields']:
                    field_to_append = {}
                    field_to_append['id'] = field['id']
                    field_to_append['name'] = field['name']
                    field_to_append['description'] = field['description'] if "description" in field  else ''
                    field_to_append['options'] = field['options'] if "options" in field   else []
                    field_to_append['type'] = field['type'] if "type" in field  else ''
                    
                    table_to_append['fields'].append(field_to_append)
                base_to_append['tables'].append(table_to_append)
            new_airtable_settings['bases'].append(base_to_append)
        return new_airtable_settings

    def fetch_bases(self, airtableSettings: AirtableSettings):
        """
        curl "https://api.airtable.com/v0/meta/bases" \
        -H "Authorization: Bearer YOUR_TOKEN"
        """
        r = requests.get('https://api.airtable.com/v0/meta/bases', headers={'Authorization' : f'Bearer {airtableSettings["authSettings"]["accessToken"]}'})
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.reason)
        o = r.json()
        return o


    def fetch_base_schema(self, airtableSettings: AirtableSettings, baseId: str):
        """
        curl "https://api.airtable.com/v0/meta/bases/{baseId}/tables"
        -H "Authorization: Bearer YOUR_TOKEN
        """
        r = requests.get(f'https://api.airtable.com/v0/meta/bases/{baseId}/tables', headers={'Authorization' : f'Bearer {airtableSettings["authSettings"]["accessToken"]}'})
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.reason)
        o = r.json()
        return o
