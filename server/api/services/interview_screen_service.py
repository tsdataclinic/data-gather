from fastapi import HTTPException

from server.api.services.base_service import BaseService
from server.models.interview_screen import InterviewScreen


class InterviewScreenService(BaseService):
    def get_interview_screen_by_id(self, screen_id: str) -> InterviewScreen:
        """Get an interview screen by id"""
        screen = self.db.get(InterviewScreen, screen_id)
        if not screen:
            raise HTTPException(status_code=404, detail="InterviewScreen not found")
        return screen

    def delete_interview_screen(self, screen: InterviewScreen) -> None:
        """Delete an interview screen"""
        models_to_delete = screen.entries + screen.actions + [screen]
        self.commit(delete_models=models_to_delete)

    def delete_interview_screen_by_id(self, screen_id: str) -> None:
        """Delete an interview by id"""
        screen = self.get_interview_screen_by_id(screen_id)
        self.delete_interview_screen(screen)
