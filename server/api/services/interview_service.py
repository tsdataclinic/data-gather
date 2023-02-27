from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, select

from server.api.services.base_service import BaseService
from server.api.services.interview_screen_service import InterviewScreenService
from server.models.interview import Interview, InterviewCreate
from server.models.interview_screen import InterviewScreen
from server.models.interview_setting import InterviewSetting, InterviewSettingType


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
                    title={"en":"Stage 1"},
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

    def get_interview_setting_by_interview_id_and_type(self, interview_id: str, interview_setting_type: InterviewSettingType) -> InterviewSetting:
        """Get an interview setting by its associated interview id"""
        interview = self.db.get(Interview, interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        output = {}
        for setting in interview.interview_settings:
            if (setting.type == interview_setting_type):
                output = setting.settings[interview_setting_type]
        if output == {}:
            raise HTTPException(status_code=404, detail="Airtable setting not found for interview {interview_id}")

        print('get_interview_setting', output)
        return output

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

        # delete all submission actions and the interview itself
        models_to_delete = interview.submission_actions + [interview]
        self.commit(delete_models=models_to_delete)
