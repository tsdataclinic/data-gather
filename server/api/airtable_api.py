import json
import logging
import sys
from typing import Any, cast

import requests
from fastapi import HTTPException
from pyairtable import Api
from pyairtable.formulas import match

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

    def __init__(self, airtable_api_key, base_id):
        if not airtable_api_key:
            logger.warn(
                "**No AIRTABLE_API_KEY environment variable set. Airtable endpoints will not function.**"
            )
        if not base_id:
            logger.warn(
                "**No AIRTABLE_BASE_ID environment variable set. Airtable endpoints will not function.**"
            )

        self.api = Api(airtable_api_key)
        self.base_id = base_id

    @airtable_errors_wrapped
    def fetch_record(self, table_name: str, id: str) -> Record:
        """
        Fetch a record with a particular id from a table on Airtable.

        Arguments:
        - table_name: The name of the table to be queried
        - id: The id of the record to be returned

        Returns: An Airtable record
        """
        logger.debug(f"Fetching record {id} in {table_name}")
        return self.api.get(self.base_id, table_name, id)

    @airtable_errors_wrapped
    def search_records(self, table_name: str, query: PartialRecord) -> list[Record]:
        """
        Fetch all records from a table on Airtable that match a particular query. If query
        is empty, all the records in the table are returned.

        Arguments:
        - table_name: The name of the table to be queried
        - query: a dictionary from query keys to query terms

        Returns: A list of records matching that query
        """
        logger.debug(
            f"Fetching records in {table_name}" + (f"with {query = }" if query else "")
        )
        results = self.api.all(self.base_id, table_name, formula=match(query))
        return results

    @airtable_errors_wrapped
    def create_record(self, table_name: str, record: Record) -> Record:
        """
        Create a record in an airtable table

        Arguments:
        - table_name: The name of the table to insert the record into
        - record: The record to insert into the table

        Returns: The new record
        """
        logger.debug(f"Creating new record in {table_name}: {record}")
        return self.api.create(self.base_id, table_name, record, typecast=True)

    @airtable_errors_wrapped
    def update_record(self, table_name: str, id: str, update: PartialRecord) -> Record:
        """
        Update a record with a specific id in an airtable table

        Arguments:
        - table_name: The name of the table to update the record in
        - id: The id of the record to update
        - update: The fields in the record to update. All other fields will remain unmodified

        Returns:
        - The updated response
        """
        logger.debug(f"Updating record {id} in {table_name}: {update}")
        return cast(
            dict,
            self.api.update(
                base_id=self.base_id,
                table_name=table_name,
                record_id=id,
                fields=update,
                typecast=True,
            ),
        )
