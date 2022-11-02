import logging
import sys
from typing import List, Optional, get_args, get_origin, get_type_hints

from pydantic import create_model
from sqlalchemy.orm import RelationshipProperty
from sqlmodel import Field, Relationship

from server.models_util import APIModel

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class Interview(APIModel, table=True):
    __tablename__: str = "interview"
    created_date: str
    description: str
    id: str = Field(primary_key=True)
    name: str
    notes: str

    # relationships
    screens: list["InterviewScreen"] = Relationship(back_populates="interview")


class InterviewScreen(APIModel, table=True):
    __tablename__: str = "interview_screen"
    order: int
    header_text: str
    id: str = Field(primary_key=True)
    interview_id: str = Field(foreign_key="interview.id")
    title: str
    is_in_starting_state: bool
    starting_state_order: Optional[int]

    # relationships
    actions: List["ConditionalAction"] = Relationship(back_populates="screen")
    entries: List["InterviewScreenEntry"] = Relationship(back_populates="screen")
    interview: Interview = Relationship(back_populates="screens")


class InterviewScreenEntry(APIModel, table=True):
    __tablename__: str = "interview_screen_entry"
    name: str
    prompt: str
    response_key: str = Field(primary_key=True)
    screen_id: str = Field(foreign_key="interview_screen.id")
    order: int
    response_type: str
    text: str

    # relationships
    screen: InterviewScreen = Relationship(back_populates="entries")


class ConditionalAction(APIModel, table=True):
    __tablename__: str = "conditional_action"
    action_payload: str
    action_type: str
    id: str = Field(primary_key=True)
    order: int
    response_key: str
    screen_id: str = Field(foreign_key="interview_screen.id")
    value: str

    # relationships
    screen: InterviewScreen = Relationship(back_populates="actions")


def prepare_relationships(Cls, relationships: Optional[list[str]] = None):
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
    python_type_hints = get_type_hints(Cls)
    model_attrs = {}

    were_relationships_mutated = False

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
                    if get_origin(python_type_hint) == list:
                        sub_model_type = get_args(python_type_hint)[0]

                        # get the actual Class from the python type hint
                        sub_model_class = getattr(sys.modules[__name__], sub_model_type)
                        ModelWithNoRelationships = prepare_relationships(
                            sub_model_class
                        )
                        model_attrs[attr] = (list[ModelWithNoRelationships], ...)

    if not were_relationships_mutated:
        # if we didn't mutate any of the relationshpis then just return the
        # original class
        return Cls

    new_model_name = None
    if relationships:
        relationships_suffix = "And".join([r.title() for r in relationships])
        new_model_name = f"{Cls.__name__}With{relationships_suffix}"
    else:
        new_model_name = f"{Cls.__name__}Base"

    NewCls = create_model(new_model_name, __base__=APIModel, **model_attrs)
    return NewCls
