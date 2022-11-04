from fastapi import (
    FastAPI, 
    Request, 
    Body
)
from airtable_config import (
    AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID
)
from airtable_api import (
    AirtableAPI, 
    Record, 
    PartialRecord
)

TAG_METADATA = [
    {
        "name": "airtable",
        "description": "Endpoints for querying Airtable"
    }
]

app = FastAPI(
    title="Interview App API", 
    openapi_tags=TAG_METADATA
)

airtable_client = AirtableAPI(AIRTABLE_API_KEY, AIRTABLE_BASE_ID)

@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.get("/airtable-records/{table_name}", tags=["airtable"])
def get_airtable_records(table_name, request: Request) -> list[Record]:
    """
    Fetch records from an airtable table. Filtering can be performed
    by adding query parameters to the URL, keyed by column name.
    """
    query = dict(request.query_params)
    return airtable_client.search_records(table_name, query)

@app.get("/airtable-records/{table_name}/{record_id}", tags=["airtable"])
def get_airtable_record(table_name: str, record_id: str) -> Record:
    """
    Fetch record with a particular id from a table in airtable.
    """
    return airtable_client.fetch_record(table_name, record_id)

@app.post("/airtable-records/{table_name}", tags=["airtable"])
async def create_airtable_record(
    table_name: str, 
    record: Record = Body(...)
) -> Record:
    """
    Create an airtable record in a table.
    """
    return airtable_client.create_record(table_name, record)

@app.put("/airtable-records/{table_name}/{record_id}", tags=["airtable"])
async def update_airtable_record(
    table_name: str, 
    record_id: str, 
    update: PartialRecord = Body(...)
) -> Record:
    """
    Update an airtable record in a table.
    """
    return airtable_client.update_record(table_name, record_id, update)

