from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlmodel import Session, select

from server.api.services.base_service import BaseService
from server.api.services.interview_screen_service import InterviewScreenService
from server.api.services.util import (diff_model_lists, reset_object_order,
                                      update_model_diff)
from server.models.data_store_setting.airtable_config import AirtableConfig
from server.models.data_store_setting.data_store_setting import (
    DataStoreConfig, DataStoreSetting, DataStoreType)
from server.models.interview import (Interview, InterviewCreate,
                                     InterviewUpdate, ValidationError)
from server.models.interview_screen import InterviewScreen
from server.models.submission_action import SubmissionAction


class InterviewService(BaseService):
    def __init__(self, db: Session):
        super(InterviewService, self).__init__(db)
        self.interview_screen_service = InterviewScreenService(db)

    def create_interview(self, interview: InterviewCreate) -> Interview:
        """Create an interview given an InterviewCreate model.
        An interview is created with a default Screen to start with.
        """
        db_interview = Interview.from_orm(interview)
        self.commit(
            add_models=[db_interview],
            refresh_models=True,
        )

        # Now that we committed, the db_interview should have an id
        if db_interview.id:
            db_interview.screens = [
                InterviewScreen(
                    order=1,
                    header_text={"en": ""},
                    title={"en": "Stage 1"},
                    is_in_starting_state=True,
                    starting_state_order=1,
                    interview_id=db_interview.id,
                )
            ]
            # commit the interview with the new screen
            self.commit(
                add_models=[db_interview],
                refresh_models=True,
            )
        return db_interview

    def get_interview_by_id(self, interview_id: str) -> Interview:
        """Get an interview by its id"""
        interview = self.db.get(Interview, interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        return interview

    def _get_interview_setting_by_interview_id_and_type(
        self,
        interview_id: str,
        data_store_type: DataStoreType,
    ) -> DataStoreSetting:
        """Get an interview setting by its associated interview id"""
        interview = self.db.get(Interview, interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        output: DataStoreSetting | None = None

        for data_store_setting in interview.data_store_settings:
            if data_store_setting.type == data_store_type:
                output = data_store_setting

        if output is None:
            raise HTTPException(
                status_code=404,
                detail="Airtable setting not found for interview {interview_id}",
            )

        return output

    def update_data_store_config(
        self, interview_id: str, new_data_store_config: DataStoreConfig
    ) -> Interview:
        new_interview = self.get_interview_by_id(interview_id)
        # find the setting for this data store type and update it
        for idx, data_store_setting in enumerate(new_interview.data_store_settings):
            if data_store_setting.type == new_data_store_config.type:
                data_store_setting.config = new_data_store_config
                new_interview.data_store_settings[idx] = data_store_setting
                break

        # now actually update the interview in the db
        return self.update_interview(interview_id, new_interview)

    def get_airtable_config(self, interview_id: str) -> AirtableConfig:
        data_store_setting = self._get_interview_setting_by_interview_id_and_type(
            interview_id, DataStoreType.AIRTABLE
        )
        airtable_settings = AirtableConfig.parse_obj(data_store_setting.config)

        if isinstance(airtable_settings, AirtableConfig):
            return airtable_settings

        raise HTTPException(
            status_code=500,
            detail="Data store settings were found that were not a valid airtable settings type",
        )

    def get_interview_by_vanity_url(self, vanity_url: str) -> Interview:
        """Get an interview by its vanity url"""
        try:
            interview = self.db.exec(
                select(Interview)
                .where(Interview.vanity_url == vanity_url)
                .where(Interview.published)
            ).one()
        except NoResultFound as e:
            raise HTTPException(
                status_code=404,
                detail=f"Interview not found with {vanity_url} vanity url",
            ) from e
        return interview

    def delete_interview(self, interview: Interview) -> None:
        # delete all screens
        for screen in interview.screens:
            self.interview_screen_service.delete_interview_screen(screen)

        # delete all submission actions, interview settings and the interview itself
        models_to_delete = (
            interview.submission_actions + interview.data_store_settings + [interview]
        )
        self.commit(delete_models=models_to_delete)

    def update_interview(self, interview_id: str, interview: Interview) -> Interview:
        db_interview = self.get_interview_by_id(interview_id)

        # update the nested submission actions
        reset_object_order(interview.submission_actions)
        actions_to_set, actions_to_delete = diff_model_lists(
            db_interview.submission_actions,
            [
                SubmissionAction.from_orm(action)
                for action in interview.submission_actions
            ],
        )

        # delete the necessary actions
        for action in actions_to_delete:
            self.db.delete(action)

        # set the updated actions
        db_interview.submission_actions = actions_to_set

        # get settings to update and delete
        settings_to_set, settings_to_delete = diff_model_lists(
            db_interview.data_store_settings,
            [
                DataStoreSetting.from_orm(setting)
                for setting in interview.data_store_settings
            ],
        )

        # delete the necessary settings
        for setting in settings_to_delete:
            self.db.delete(setting)

        # set the updated settings
        db_interview.data_store_settings = settings_to_set

        # now update the top-level db_interview values
        update_model_diff(
            db_interview,
            interview.copy(exclude={"submission_actions", "data_store_settings"}),
        )

        self.db.add(db_interview)

        try:
            self.db.commit()
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=str(e.orig)) from e
        except ValidationError as e:
            raise HTTPException(
                status_code=400, detail="Error validating interview"
            ) from e
        return db_interview
