from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import Schema
from pydantic_sqlalchemy import sqlalchemy_to_pydantic


from server.models import (
    ConditionalAction,
    Interview,
    InterviewScreen,
    InterviewScreenEntry,
)


PydanticInterview = sqlalchemy_to_pydantic(Interview, config=APIModel.Config)


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
