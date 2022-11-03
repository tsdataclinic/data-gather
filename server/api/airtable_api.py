import json
import logging
import requests

from fastapi import HTTPException
from typing import Any, Dict, List, Set
from pyairtable import Api
from pyairtable.formulas import match
# https://pyairtable.readthedocs.io/en/latest/api.html

Record = Dict[str, Any]
PartialRecord = Dict[str, Any]

logger = logging.getLogger("airtable_api")
logger.setLevel(logging.DEBUG)

def airtable_errors_wrapped(func):
    """
    Decorates a function that queries airtable. 
    
    Ordinarily, an error thrown by the Airtable API would cause an error 
    500 returned by this API. This decorator forwards the error 
    from Airtable instead.
    """
    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise HTTPException(
                    status_code=e.response.status_code, 
                    detail=f"Resource at {e.request.url} not found"
                )
            if e.response.status_code == 400:
                raise HTTPException(
                    status_code=e.response.status_code, 
                    detail=f"Bad Request: {e.response.reason}"
                )
            if e.response.status_code == 422:
                airtable_error = json.loads(e.response.content)['error']
                error_message = f"{airtable_error['type']}: {airtable_error['message']}"
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=error_message
                )
            raise

    return wrapped
class AirtableAPI: 
    def __init__(self, airtable_api_key, base_id):
        self.api = Api(airtable_api_key)
        self.base_id = base_id

    @airtable_errors_wrapped
    def fetch_record(self, table_name: str, id: str) ->  Record:
        """
        Fetch a record with a particular id from a table on Airtable.

        Arguments: 
        - table_name: The name of the table to be queried
        - id: The id of the record to be returned

        Returns: An Airtable record
        """
        return self.api.get(self.base_id, table_name, id) 

    @airtable_errors_wrapped
    def search_records(self, table_name: str, query: PartialRecord) -> List[Record]:
        """
        Fetch all records from a table on Airtable that match a particular query. If query
        is empty, all the records in the table are returned. 

        Arguments:
        - table_name: The name of the table to be queried
        - query: a dictionary from query keys to query terms

        Returns: A list of records matching that query
        """
        val = self.api.all(self.base_id, table_name, formula=match(query))
        return val

    @airtable_errors_wrapped
    def create_record(self, table_name: str, record: Record):
        """
        Create a record in an airtable table

        Arguments:
        - table_name: The name of the table to insert the record into
        - record: The record to insert into the table

        Returns: The new record
        """
        # AirtableAPI._validate_fields(table_name, record)
        print(record)
        return self.api.create(self.base_id, table_name, record, typecast=True)

    @airtable_errors_wrapped
    def update_record(self, table_name: str, id: str, update: PartialRecord):
        """
        Update a record with a specific id in an airtable table

        Arguments:
        - table_name: The name of the table to update the record in
        - id: The id of the record to update
        - body: The fields in the record to update. All other fields will remain unmodified

        Returns:
        - The updated response
        """
        return self.api.update(table_name, id, update, typecast=True)

    # @staticmethod
    # def _validate_fields(cls, table_name: str, field_names: Set[str]):
    #     table_fields = AIRTABLE_FIELD_IDS[table_name].keys()

    #     if not(field_names <= table_fields):
    #         invalid_fields = table_fields - field_names

    #         raise HTTPException(
    #             status_code=400,
    #             detail=f"Invalid field names {invalid_fields}. Allowed fields are {table_fields}"
    #         )  