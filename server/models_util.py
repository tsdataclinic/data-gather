import inspect
import re
import sys

from sqlmodel import SQLModel


def snake_to_camel(snake_str: str) -> str:
    """Convert a snake_case string to camelCase"""
    # upper case each part of the string.
    # str.title() handles snake case. e.g. ab_cd => Ab_Cd
    camel = snake_str.title()
    # remove underscores
    camel = re.sub("([0-9A-Za-z])_(?=[0-9A-Z])", lambda m: m.group(1), camel)
    # make the first character lowercase
    camel = re.sub("(^_*[A-Z])", lambda m: m.group(1).lower(), camel)
    return camel


class APIModel(SQLModel):
    """Any models that are returned in our REST API should extend this class.
    This class handles any snake_case to camelCase conversions."""

    class Config(SQLModel.Config):
        """This config sets the correct Pydantic settings to convert
        snake_case to camelCase"""

        allow_population_by_field_name = True
        alias_generator = snake_to_camel


def update_module_forward_refs(module_name: str):
    """Iterate over all classes in a module and call `update_forward_refs()`
    on each class that has that function.

    This is used to resolve circular imports in Pydantic models across separate
    modules.
    """
    for _, obj in inspect.getmembers(sys.modules[module_name], inspect.isclass):
        if hasattr(obj, "update_forward_refs"):
            obj.update_forward_refs()
