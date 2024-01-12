"""
This script will take the JSON schema exported by `localhost:8000/openpai.json`
and perform the following changes:

1. Rename operation IDs from things like `items-get_items` to just `get_items`
2. Prepend a 'Serialized' suffix to model names (e.g. 'Interview' to
    'SerializedInterview')
"""
import json
from collections import deque
from pathlib import Path
from typing import Any, Literal, Optional, TypedDict, Union
from urllib.request import urlopen

json_url = "http://localhost:8000/openapi.json"
openapi_json: dict[str, Any] = json.loads(urlopen(json_url).read())


class Operation(TypedDict):
    tags: Optional[list[str]]
    summary: str
    operationId: str
    parameters: Optional[dict]
    requestBody: Optional[dict]
    responses: dict


class ModelSchema(TypedDict):
    title: str
    enum: Optional[list[str]]
    type: Literal["string", "object"]
    description: str
    properties: Optional[dict[str, dict[str, str]]]


# Change API operation names
for path_data in openapi_json["paths"].values():
    operations: list[Operation] = path_data.values()
    for operation in operations:
        tags = operation.get("tags")
        if tags:
            tag = tags[0]
            operation_id = operation["operationId"]
            to_remove = f"{tag}-"
            new_operation_id = operation_id[len(to_remove) :]
            operation["operationId"] = new_operation_id

# Change model names
schema_dict: dict[str, ModelSchema] = openapi_json["components"]["schemas"]
schemas = list(schema_dict.values())
updated_model_names: dict[str, str] = {}
for schema in schemas:
    if schema["type"] == "object":
        model_name = schema["title"]
        # ignore any models with "Error" in the name
        if "Error" not in model_name:
            # update model name
            new_model_name = f"Serialized{model_name}"
            schema["title"] = new_model_name

            # update the schema dict
            del schema_dict[model_name]
            schema_dict[new_model_name] = schema

            # map the old model name to the new name
            updated_model_names[model_name] = new_model_name


def update_refs():
    # perform a dfs to go through entire OpenAPI JSON and
    # find every object whose key is "$ref" and update it
    stack: deque[tuple[Union[str, int], Any, Any]] = deque(
        [(key, val, openapi_json) for key, val in openapi_json.items()]
    )

    while len(stack) > 0:
        (key, val, parent_obj) = stack.popleft()
        if key == "$ref":
            ref_parts = val.split("/")
            model_name = ref_parts[-1]
            if model_name in updated_model_names:
                ref_parts[-1] = updated_model_names[model_name]
                parent_obj[key] = "/".join(ref_parts)
        else:
            if isinstance(val, dict):
                stack.extend([(key, child, val) for key, child in val.items()])
            elif isinstance(val, list):
                stack.extend([(key, child, val) for key, child in enumerate(val)])


update_refs()

file_path = Path("./openapi.json")
file_path.write_text(json.dumps(openapi_json))
