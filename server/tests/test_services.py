from unittest import TestCase
from unittest.mock import Mock, call, patch

from fastapi import HTTPException
from sqlmodel import SQLModel
from sqlalchemy.exc import IntegrityError, NoResultFound

from server.models.interview_screen import (
    InterviewScreen, 
    ConditionalAction, 
    InterviewScreenEntry, 
    Interview
)
from server.models.interview import InterviewCreate
from server.models.interview_setting import InterviewSetting, AirtableSettings,InterviewSettingType
from server.models.submission_action import SubmissionAction
from server.api.services import interview_service, interview_screen_service

class TestInterviewScreenService(TestCase):
    """Test cases for InterviewScreenService"""

    def setUp(self) -> None:
        self.fake_screen = InterviewScreen()
        self.fake_db = Mock(
            get=Mock(return_value=self.fake_screen)
        )
    
    def test_screen_get(self):
        """Assert that screen returns"""
        screen_service = interview_screen_service.InterviewScreenService(self.fake_db)
        self.assertEqual(self.fake_screen, screen_service.get_interview_screen_by_id("somefakeid"))

    def test_screen_get_not_found(self):
        """Assert that screen returns"""
        self.fake_db.get.return_value = None
        screen_service = interview_screen_service.InterviewScreenService(self.fake_db)
        with self.assertRaises(HTTPException):
            screen_service.get_interview_screen_by_id("somefakeid")
    
    def test_screen_delete(self):
        """Assert that screen is deleted"""
        fake_entry = InterviewScreenEntry()
        fake_action = ConditionalAction()
        self.fake_screen.entries = [fake_entry]
        self.fake_screen.actions = [fake_action]
        screen_service = interview_screen_service.InterviewScreenService(self.fake_db)
        screen_service.delete_interview_screen(self.fake_screen)
        self.fake_db.delete.assert_has_calls([call(fake_entry), call(fake_action), call(self.fake_screen)])
        self.fake_db.add.assert_not_called()



    def test_commit(self):
        """Assert that during a commit the correct calls are made"""
        class MockModel(SQLModel):
            name: str
        
        mock_add_model = MockModel(name="addmodel")
        mock_delete_model = MockModel(name="deletemodel")
        screen_service = interview_screen_service.InterviewScreenService(self.fake_db)
        screen_service.commit([mock_add_model], [mock_delete_model], True)
        self.fake_db.add.assert_called_with(mock_add_model)
        self.fake_db.add.assert_called_once()
        self.fake_db.delete.assert_called_with(mock_delete_model)
        self.fake_db.delete.assert_called_once()
        self.fake_db.commit.assert_called_once()
        self.fake_db.refresh.assert_called_with(mock_add_model)
        self.fake_db.refresh.assert_called_once()
    
    def test_commit_integrity_error(self):
        """Assert that an IntegrityError is raised during commit HTTPError is raised to caller"""
        self.fake_db.commit.side_effect = IntegrityError("what", "ev", "er")
        screen_service = interview_screen_service.InterviewScreenService(self.fake_db)
        with self.assertRaises(HTTPException):
            screen_service.commit([],[])


class TestInterviewService(TestCase):
    """Test cases for InterviewService"""

    def setUp(self) -> None:
        self.fake_db = Mock()
        self.fake_db_interview = Interview()
        self.fake_interview_service = interview_service.InterviewService(self.fake_db)


    @patch.object(Interview, "from_orm")
    def test_create_interview(self, mock_from_orm: Mock):
        """Assert an Interview is successfully created"""
        fake_interview = InterviewCreate(
            name="fakeinterview",
            description="",
            notes="",
            published=False,
            ownerId="1234",
            defaultLanguage="english",
            allowedLanguages="english;spanish"
        )
        # Since we're not really commiting to the DB we need to manually set ID
        fake_interview.id = "fakeid"
        mock_from_orm.return_value = self.fake_db_interview
        self.fake_interview_service.create_interview(fake_interview)
        self.assertListEqual(
            self.fake_db.add.call_args_list,
            [
                call(self.fake_db_interview),
                call(self.fake_db_interview)           
            ]
        )
        self.assertEqual(self.fake_db.add.call_count, 2)
    
    def test_get_interview_by_id(self):
        """Assert that an interview is returned"""
        self.fake_db.get.return_value = self.fake_db_interview
        self.assertEqual(
            self.fake_db_interview,
            self.fake_interview_service.get_interview_by_id("fakeid")
        )
    
    def test_get_interview_by_id_failed(self):
        """Assert that if interview is not returned an exception is raised"""
        self.fake_db.get.return_value = None
        with self.assertRaises(HTTPException):
            self.fake_interview_service.get_interview_by_id("fakeid")

    def test_get_interview_setting_by_interview_id_and_type(self):
        """Assert that an interview setting can be retrieved"""
        setting_type = InterviewSettingType("airtable")
        setting = InterviewSetting(type=setting_type)
        airtable_settings = AirtableSettings(apiKey="asdf")
        setting.settings = airtable_settings
        self.fake_db.get.return_value = self.fake_db_interview
        self.fake_db_interview.interview_settings = [setting]
        self.assertEqual(
            self.fake_interview_service.get_interview_setting_by_interview_id_and_type("asdf", setting_type).settings,
            airtable_settings
        )
    
    def test_get_interview_setting_by_interview_id_and_type_interview_not_found(self):
        """Assert that if an interview is not found an exception is raised"""
        self.fake_db.get.return_value = None
        with self.assertRaises(HTTPException):
            self.fake_interview_service.get_interview_setting_by_interview_id_and_type("what", "ever"),

    def test_get_interview_setting_by_interview_id_and_type_setting_not_found(self):
        """Assert that if an interview setting is not found an exception is raised"""
        setting_type = InterviewSettingType("airtable")
        setting = InterviewSetting(type=setting_type)
        airtable_settings = AirtableSettings(apiKey="asdf")
        setting.settings = airtable_settings
        self.fake_db.get.return_value = self.fake_db_interview
        self.fake_db_interview.interview_settings = [setting]
        with self.assertRaises(HTTPException):
            self.fake_interview_service.get_interview_setting_by_interview_id_and_type("what", "type_doesnt_exist"),
    
    def test_get_interview_by_vanity_url_fail(self):
        """Assert that if an interview can't be found an exception is raised"""
        self.fake_db.exec.side_effect = NoResultFound()
        with self.assertRaises(HTTPException):
            self.fake_interview_service.get_interview_by_vanity_url("vanity_url")
    

    def test_delete_interview(self):
        """Assert that an interview is deleted"""
        fake_entry = InterviewScreenEntry()
        fake_action = ConditionalAction()
        fake_screen = InterviewScreen()
        fake_submission_action = SubmissionAction()
        fake_screen.actions = [fake_action]
        fake_screen.entries = [fake_entry]
        self.fake_db_interview.screens = [fake_screen]
        self.fake_db_interview.submission_actions = [fake_submission_action]
        self.fake_interview_service.delete_interview(self.fake_db_interview)
        self.assertListEqual(
            self.fake_db.delete.call_args_list,
            [call(fake_entry), call(fake_action), call(fake_screen), call(fake_submission_action), call(self.fake_db_interview)]
        )









