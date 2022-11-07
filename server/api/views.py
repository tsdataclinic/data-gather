from typing import Union

from airtable_api import AirtableAPI, PartialRecord, Record
from airtable_config import AIRTABLE_API_KEY, AIRTABLE_BASE_ID
from fastapi import Body, FastAPI, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from pydantic import AnyHttpUrl, BaseSettings, Field

TAG_METADATA = [{"name": "airtable", "description": "Endpoints for querying Airtable"}]

app = FastAPI(title="Interview App API", openapi_tags=TAG_METADATA)
airtable_client = AirtableAPI(AIRTABLE_API_KEY, AIRTABLE_BASE_ID)


# ============#
# Auth Setup #
# ============#


class Settings(BaseSettings):
    SECRET_KEY: str = Field("my super secret key", env="SECRET_KEY")
    BACKEND_CORS_ORIGINS: list[Union[str, AnyHttpUrl]] = ["http://localhost:8000"]
    OPENAPI_CLIENT_ID: str = Field(
        default="f2f390f7-1ace-4333-b7b9-9cf97a3d1318", env="OPENAPI_CLIENT_ID"
    )
    APP_CLIENT_ID: str = Field(
        default="f2f390f7-1ace-4333-b7b9-9cf97a3d1318", env="APP_CLIENT_ID"
    )
    TENANT_ID: str = Field(
        default="c17c2295-f643-459e-ae89-8e0b2078951e", env="TENANT_ID"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()

app = FastAPI(
    title="Interview App API",
    openapi_tags=TAG_METADATA,
    swagger_ui_oauth2_redirect_url="/",  # TODO: configure this in Azure AD
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": settings.OPENAPI_CLIENT_ID,
    },
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    tenant_id=settings.TENANT_ID,
    scopes={
        f"api://{settings.APP_CLIENT_ID}/user_impersonation": "user_impersonation",
    },
)


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.get("/auth", dependencies=[Security(azure_scheme)])
def test_auth():
    return {"message": "auth success!"}


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
async def create_airtable_record(table_name: str, record: Record = Body(...)) -> Record:
    """
    Create an airtable record in a table.
    """
    return airtable_client.create_record(table_name, record)


@app.put("/airtable-records/{table_name}/{record_id}", tags=["airtable"])
async def update_airtable_record(
    table_name: str, record_id: str, update: PartialRecord = Body(...)
) -> Record:
    """
    Update an airtable record in a table.
    """
    return airtable_client.update_record(table_name, record_id, update)
