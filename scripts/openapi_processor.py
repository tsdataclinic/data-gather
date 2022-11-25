"""
This script will take the JSON schema exported by `localhost:8000/openpai.json`
and renames operation IDs from things like `items-get_items` to just `get_items`
"""
import json
from pathlib import Path
from typing import Optional, TypedDict
from urllib.request import urlopen

json_url = "http://localhost:8000/openapi.json"
openapi_schema = json.loads(urlopen(json_url).read())


class Operation(TypedDict):
    tags: Optional[list[str]]
    summary: str
    operationId: str
    parameters: Optional[dict]
    requestBody: Optional[dict]
    responses: dict


for path_data in openapi_schema["paths"].values():
    operations: list[Operation] = path_data.values()
    for operation in operations:
        tags = operation.get("tags")
        if tags:
            tag = tags[0]
            operation_id = operation["operationId"]
            to_remove = f"{tag}-"
            new_operation_id = operation_id[len(to_remove) :]
            operation["operationId"] = new_operation_id

file_path = Path("./openapi.json")
file_path.write_text(json.dumps(openapi_schema))
