from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, select

from server.api.services.base_service import BaseService
from server.api.services.interview_screen_service import InterviewScreenService
from server.models.airtable_settings import AirtableSettings
from server.models.data_store_setting import DataStoreSetting, DataStoreType
from server.models.interview import Interview, InterviewCreate
from server.models.interview_screen import InterviewScreen


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

        for data_store_setting in interview.interview_settings:
            if data_store_setting.type == data_store_type:
                output = data_store_setting

        if output is None:
            raise HTTPException(
                status_code=404,
                detail="Airtable setting not found for interview {interview_id}",
            )

        return output

    def get_airtable_settings(self, interview_id: str) -> AirtableSettings:
        data_store_setting = self._get_interview_setting_by_interview_id_and_type(
            interview_id, DataStoreType.AIRTABLE
        )
        airtable_settings = AirtableSettings.parse_obj(data_store_setting.settings)

        if isinstance(airtable_settings, AirtableSettings):
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
        except NoResultFound:
            raise HTTPException(
                status_code=404,
                detail=f"Interview not found with {vanity_url} vanity url",
            )
        return interview

    def delete_interview(self, interview: Interview) -> None:
        # delete all screens
        for screen in interview.screens:
            self.interview_screen_service.delete_interview_screen(screen)

        # delete all submission actions, interview settings and the interview itself
        models_to_delete = (
            interview.submission_actions + interview.interview_settings + [interview]
        )
        self.commit(delete_models=models_to_delete)
