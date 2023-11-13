from typing import Sequence, TypeVar

from sqlmodel import SQLModel

from server.models.common import OrderedModel
from server.models.conditional_action import ConditionalAction
from server.models.data_store_setting.data_store_setting import DataStoreSetting
from server.models.interview_screen_entry import InterviewScreenEntry
from server.models.submission_action import SubmissionAction

TInterviewChild = TypeVar(
    "TInterviewChild",
    ConditionalAction,
    InterviewScreenEntry,
    SubmissionAction,
    DataStoreSetting,
)


def reset_object_order(request_models: Sequence[OrderedModel]):
    """
    Resets the order attribute of objects in given iterable to their index value
    """
    for index, ordered_model in enumerate(request_models):
        ordered_model.order = index


def update_model_diff(existing_model: SQLModel, new_model: SQLModel):
    """
    Update a model returned from the DB with any changes in the new
    model.
    """
    for key in new_model.dict().keys():
        new_val = getattr(new_model, key)
        old_val = getattr(existing_model, key)
        if old_val != new_val:
            setattr(existing_model, key, new_val)
    return existing_model


def diff_model_lists(
    db_models: list[TInterviewChild],
    request_models: list[TInterviewChild],
) -> tuple[list[TInterviewChild], list[TInterviewChild]]:
    """
    Given two list of models, diff them to come up with the list of models to
    set in the db (which includes the models to update and the models to add)
    and the list of models to delete.

    The model types must have an `id` member for this to work since that is
    the field this function uses to compare them.

    NOTE: If there are 0 db_models and more than 0 request_models,
      will pass through all request_models as models_to_create.

    Args:
        db_models: The existing list of models in the db
        request_models: The list of models coming in from a request which we
            wish to write.

    Returns:
        A tuple of: list of models to set and list of models to delete
    """
    # case where db_models is empty and request_models isn't => pass through all request_models
    if len(db_models) == 0 and len(request_models) > 0:
        return (request_models, [])

    # create map of id to request_model (i.e. the models not in the db)
    db_models_dict = {model.id: model for model in db_models}
    request_model_ids = set(req_model.id for req_model in request_models)

    # figure out which models are new and which ones have to be updated
    models_to_create = []
    models_to_update = []
    for request_model in request_models:
        if request_model.id is None:
            models_to_create.append(request_model)
        else:
            db_model = db_models_dict.get(request_model.id, None)
            if db_model:
                # if the model already exists in the database, then we update the
                # db_model with the request_model data
                models_to_update.append(update_model_diff(db_model, request_model))

    # figure out which models need to be deleted from the database
    models_to_delete = []
    for db_model in db_models:
        if db_model.id not in request_model_ids:
            models_to_delete.append(db_model)

    models_to_set = models_to_create + models_to_update
    return (models_to_set, models_to_delete)
