import json
import logging
import sys
from typing import Any, Literal, TypedDict, cast

import requests
from fastapi import HTTPException
from pyairtable import Api  # type: ignore
from pyairtable.formulas import FIND, LOWER, OR, STR_VALUE

from server.models.data_store_setting.airtable_config import (
    AirtableBase,
    AirtableConfig,
    AirtableField,
    AirtableTable,
)

# https://pyairtable.readthedocs.io/en/latest/api.html

Record = dict[str, Any]
PartialRecord = dict[str, Any]

logger = logging.getLogger("airtable_api")
logger.setLevel(logging.INFO)

f = logging.Formatter("%(levelname)s:\t  %(filename)s [L%(lineno)d]: %(message)s")
h = logging.StreamHandler(sys.stdout)
h.setFormatter(f)

logger.addHandler(h)


class AirtableAPI_BaseModel(TypedDict):
    id: str
    name: str
    permissionLevel: Literal["none", "read", "comment", "edit", "create"]


class AirtableAPI_FieldModel(TypedDict):
    id: str
    type: Literal[
        "singleLineText",
        "email",
        "url",
        "multilineText",
        "number",
        "percent",
        "currency",
        "singleSelect",
        "multipleSelects",
        "singleCollaborator",
        "multipleCollaborators",
        "multipleRecordLinks",
        "date",
        "dateTime",
        "phoneNumber",
        "multipleAttachments",
        "checkbox",
        "formula",
        "createdTime",
        "rollup",
        "count",
        "lookup",
        "multipleLookupValues",
        "autoNumber",
        "barcode",
        "rating",
        "richText",
        "duration",
        "lastModifiedTime",
        "button",
        "createdBy",
        "lastModifiedBy",
        "externalSyncSource",
        "aiText",
    ]
    name: str
    description: str | None
    # `options` holds the field model specific to the `type`
    # Details are here: https://airtable.com/developers/web/api/field-model
    options: dict


class AirtableAPI_ViewModel(TypedDict):
    id: str
    type: Literal["grid", "form", "calendar", "gallery", "kanban", "timeline", "block"]
    name: str
    visibleFieldIds: list[str] | None


class AirtableAPI_TableModel(TypedDict):
    id: str
    primaryFieldId: str
    name: str
    description: str | None
    fields: list[AirtableAPI_FieldModel]
    views: list[AirtableAPI_ViewModel]


class ListBasesResponse(TypedDict):
    bases: list[AirtableAPI_BaseModel]
    offset: str | None


class GetBaseSchemaResponse(TypedDict):
    tables: list[AirtableAPI_TableModel]


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
                "Received error from Airtable when calling %s(args=%s, kwargs=%s): %s",
                func.__name__,
                args,
                kwargs,
                e,
            )

            if e.response:
                if e.response.status_code == 404:
                    url = e.request.url if e.request else "url"
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Resource at {url} not found",
                    ) from e
                if e.response.status_code == 400:
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Bad Request: {e.response.reason}",
                    ) from e
                if e.response.status_code == 422:
                    airtable_error = json.loads(e.response.content)["error"]
                    error_message = (
                        f"{airtable_error['type']}: {airtable_error['message']}"
                    )
                    raise HTTPException(
                        status_code=e.response.status_code, detail=error_message
                    ) from e
            raise

    return wrapped


class AirtableAPI:
    """
    A client to query an Airtable base.
    """

    def __init__(self, airtable_config: AirtableConfig):
        if airtable_config.authSettings.accessToken:
            self.access_token = airtable_config.authSettings.accessToken

            # use the access token to authenticate with the Airtable API
            self.api = Api(airtable_config.authSettings.accessToken)
        else:
            logger.warning(
                "**No Airtable access token set. Airtable endpoints will not function.**"
            )

    @airtable_errors_wrapped
    def fetch_record(self, base_id: str, table_name: str, id: str) -> Record:
        """
        Fetch a record with a particular id from a table on Airtable.

        Arguments:
        - table_name: The name of the table to be queried
        - id: The id of the record to be returned

        Returns: An Airtable record
        """
        logger.debug("Fetching record %s in %s", id, table_name)
        return self.api.get(base_id, table_name, id)

    @airtable_errors_wrapped
    def search_records(
        self, base_id: str, table_name: str, query: PartialRecord
    ) -> list[Record]:
        """
        Fetch all records from a table on Airtable that partially match a
        particular query. If query is empty, all the records in the table are
        returned.

        Arguments:
        - table_name: The name of the table to be queried
        - query: a dictionary from query keys to query terms
            - expects any quotes in field_names to be properly escaped

        Returns: A list of records matching that query
        """
        logger.debug(
            "Fetching records in base: %s table: %s",
            base_id,
            table_name,
        )
        if query:
            logger.debug("With %s", query)

        # we do NOT use pyairtable.FIELD (which is : "{%s}" % escape_quotes(name) )
        # because it re-escaped single quotes that were already escaped
        find_statements = [
            FIND(LOWER(STR_VALUE(query_val)), LOWER("{%s}" % field_name))
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
        logger.debug(
            "Creating new record in base: %s table: %s: %s",
            base_id,
            table_name,
            record,
        )
        return self.api.create(base_id, table_name, record, typecast=True)

    @airtable_errors_wrapped
    def update_record(
        self, base_id: str, table_name: str, id: str, update: PartialRecord
    ) -> Record:
        """
        Update a record with a specific id in an airtable table

        Arguments:
        - table_name: The name of the table to update the record in
        - id: The id of the record to update
        - update: The fields in the record to update. All other fields will remain unmodified

        Returns:
        - The updated response
        """
        logger.debug(
            "Updating record %s in base: %s table: %s: %s",
            id,
            base_id,
            table_name,
            update,
        )
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

    def fetch_schema(self) -> list[AirtableBase]:
        """Fetch the airtable schema using the `authSettings` from an existing
        config.
        An airtable schema is just a list of AirtableBase models.
        """
        basesResponse = self._fetch_bases_list()

        airtable_bases = []
        for base in basesResponse["bases"]:
            base_schema = self._fetch_base_schema(base["id"])
            # convert the JSON schema we get from the backend into an
            # AirtableBase model
            airtable_bases.append(
                AirtableBase(
                    id=base.get("id", ""),
                    name=base.get("name", ""),
                    tables=[
                        AirtableTable(
                            id=table["id"],
                            name=table["name"],
                            description=(
                                table["description"] if "description" in table else ""
                            ),
                            fields=[
                                AirtableField(
                                    id=field.get("id", ""),
                                    name=field.get("name", ""),
                                    description=(field.get("description", "")),
                                    options=field.get("options", None),
                                    type=field.get("type", ""),
                                )
                                for field in table["fields"]
                            ],
                        )
                        for table in base_schema["tables"]
                    ],
                )
            )
        return airtable_bases

    def _fetch_bases_list(self) -> ListBasesResponse:
        """
        Fetch the list of bases.
        curl "https://api.airtable.com/v0/meta/bases" \
        -H "Authorization: Bearer YOUR_TOKEN"
        """
        r = requests.get(
            "https://api.airtable.com/v0/meta/bases",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.reason)
        bases_response = r.json()
        return bases_response

    def _fetch_base_schema(self, base_id: str) -> GetBaseSchemaResponse:
        """
        Fetch the schema of a single base (i.e. the schema for all its
        underlying tables)
        curl "https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        -H "Authorization: Bearer YOUR_TOKEN
        """
        r = requests.get(
            f"https://api.airtable.com/v0/meta/bases/{base_id}/tables",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.reason)
        tables_response = r.json()
        return tables_response
