import importlib
import re
from inspect import isclass
from typing import Optional, Type, TypeVar, Union, get_args, get_origin, get_type_hints

from pydantic import BaseModel, create_model
from sqlalchemy.orm import RelationshipProperty
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


def _get_model_class_from_type_hint(class_type: Union[str, TypeVar]):
    """This is a helper function used in `prepare_relationships` to get the
    SQLModel Class from a python type hint"""
    if isinstance(class_type, str):
        models_module = importlib.import_module("server.models")
        return getattr(models_module, class_type)
    elif get_origin(class_type) == list:
        sub_type = get_args(class_type)[0]
        return _get_model_class_from_type_hint(sub_type)
    elif isclass(class_type) and issubclass(class_type, SQLModel):
        return class_type
    else:
        return None


MODELS_DIRECTORY = {}


def prepare_relationships(
    Cls: Type[BaseModel], relationships: Optional[list[str]] = None
) -> Type[BaseModel]:
    """This function lets you include a model's relationships in the
    response_modelto a FastAPI route. By default, this function will remove
    all relationships from a model and then only include the ones you specify
    in `relationships`.

    By default, FastAPI does not include a model's relationships (their nested
    models) in a response because it can lead to bloated responses and infinite
    recursion. The correct way to include relationships is verbose and is
    outlined here: https://sqlmodel.tiangolo.com/tutorial/fastapi/relationships/

    This helper function makes it easier to include relationships in a response.
    Usage:
        @app.get(
            "/api/interviews/{interview_id}",
            response_model=prepare_relationships(Interview, ["screens"])
        )
        def get_interview(interview_id: str):
            pass

    Args:
        Cls (Class): The model we want to return
        relationships (Optional[list[str]]): The list of relationships we want
            to include.
    """
    new_model_name = None
    if relationships:
        relationships_suffix = "And".join([r.title() for r in relationships])
        new_model_name = f"{Cls.__name__}With{relationships_suffix}"
    else:
        new_model_name = f"{Cls.__name__}Base"
    if new_model_name in MODELS_DIRECTORY:
        return MODELS_DIRECTORY[new_model_name]

    were_relationships_mutated = False
    python_type_hints = get_type_hints(Cls)
    model_attrs = {}
    for attr, python_type_hint in python_type_hints.items():
        # only process attributes that don't start with __
        if not attr.startswith("__"):
            member_val = getattr(Cls, attr)
            property_type = (
                member_val.property if hasattr(member_val, "property") else None
            )
            if not isinstance(property_type, RelationshipProperty):
                # if its not a RelationshipProperty then just add it to the
                # model attributes
                model_attrs[attr] = (python_type_hint, ...)
            else:
                # this is a RelationshipProperty so we're either going to
                # exclude it entirely or we're going to clean it up if its
                # in our `relationships` dict
                were_relationships_mutated = True
                if relationships and attr in relationships:
                    # we now have to go into the related class and remove any
                    # SQLAlchemy relationships to prevent infinite recursion
                    # when fetching data
                    related_model_class = _get_model_class_from_type_hint(
                        python_type_hint
                    )
                    if related_model_class:
                        ModelWithNoRelationships = prepare_relationships(
                            related_model_class
                        )
                        if get_origin(python_type_hint) == list:
                            model_attrs[attr] = (list[ModelWithNoRelationships], ...)
                        else:
                            model_attrs[attr] = (ModelWithNoRelationships, ...)

    if not were_relationships_mutated:
        # if we didn't mutate any of the relationshpis then just return the
        # original class
        return Cls

    NewCls = create_model(new_model_name, __base__=APIModel, **model_attrs)
    MODELS_DIRECTORY[new_model_name] = NewCls
    return NewCls
