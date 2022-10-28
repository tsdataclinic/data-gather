from functools import partial
from pydantic import BaseConfig
from pydantic_sqlalchemy import sqlalchemy_to_pydantic
from fastapi_utils.camelcase import snake2camel
from server.models import (
    ConditionalAction,
    Interview,
    InterviewScreen,
    InterviewScreenEntry,
)


class APIModelConfig(BaseConfig):
    orm_mode = True
    allow_population_by_field_name = True
    alias_generator = partial(snake2camel, start_lower=True)


PydanticInterview = sqlalchemy_to_pydantic(Interview, config=APIModelConfig)


# class CamelCaseSchema(Schema):

#     def on_bind_field(self, field_name, field_obj):
#         field_obj.data_key = camelcase(field_obj.data_key or field_name)


# class ConditionalActionSchema(SQLAlchemyAutoSchema, CamelCaseSchema):
#     class Meta:
#         model = ConditionalAction
#         include_fk = True
#         load_instance = True


# class InterviewSchema(SQLAlchemyAutoSchema, CamelCaseSchema):
#     class Meta:
#         model = Interview
#         include_fk = True
#         load_instance = True


# class InterviewScreenSchema(SQLAlchemyAutoSchema, CamelCaseSchema):
#     class Meta:
#         model = InterviewScreen
#         include_fk = True
#         load_instance = True


# class InterviewScreenEntry(SQLAlchemyAutoSchema):
#     class Meta:
#         model = InterviewScreenEntry
#         include_fk = True
#         load_instance = True
