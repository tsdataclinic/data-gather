from datetime import datetime
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from unittest import TestCase

from ..api.views import app, get_session, Security, get_current_user
from ..models.user import User
from ..models.interview import Interview

# regenerate fake user each time as if we were querying it from the DB
get_fake_user = lambda id: User(id=id, email="fake@fake.com", family_name="Person", given_name="Fake", identity_provider="DMV")
FAKE_INTERVIEW = {
    "description": "A fake interview",
    "name": "fake-interview",
    "published": True,
    "ownerId": "1234",
    "notes": "note1",
    "allowedLanguages": "english,spanish",
    "defaultLanguage": "english",
    "id": str(uuid4()),
    "vanityUrl": "fakeurl",
    "createdDate": datetime.now().isoformat()
}

class TestViews(TestCase):
    """Test cases for the API endpoints"""

    @classmethod
    def setUpClass(cls):
        """Test up global fixtures"""
        # create in-memory DB for testing
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool, 
        )
        SQLModel.metadata.create_all(engine)
        cls.session = Session(engine)
        
        # Prepopulate database with some dummy users and interviews
        cls.session.add(get_fake_user("1234"))
        cls.session.add(get_fake_user("5678"))
        cls.session.add(
            Interview(
                description="A fake interview",
                name="fake-interview",
                published=True,
                ownerId="5678",
                notes="note1",
                allowedLanguages="english,spanish",
                defaultLanguage="english",
                id=str(uuid4()),
                vanityUrl="otherfakeurl",
                createdDate=datetime.now().isoformat()

            )
        )
        cls.session.commit()

    def setUp(self):
        """Set up fixtures for each test"""
    
        # override session generated in app by default
        app.dependency_overrides[get_session] = lambda : self.session

        # Disable authentication during testing
        app.dependency_overrides[Security] = lambda: None
        app.dependency_overrides[get_current_user] = lambda : get_fake_user("1234")


        self.client = TestClient(app)
    
    def test_create_interview(self):
        """Assert that an interview is successfully created"""
        response = self.client.post("/api/interviews/", json=FAKE_INTERVIEW)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), FAKE_INTERVIEW)
    
    def test_create_interview_validation_fail(self):
        """Assert that validation is run on interview creation"""
        response = self.client.post("/api/interviews/", json={**FAKE_INTERVIEW, "ownerId": None})
        self.assertEqual(response.status_code, 422)

    def test_list_interviews(self):
        """Assert that all interviews the user owns are listed"""
        response = self.client.get("/api/interviews/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [FAKE_INTERVIEW])

    def test_get_interview(self):
        """Assert that interview is returned"""
        response = self.client.get(f"/api/interviews/{FAKE_INTERVIEW['id']}")
        resp_json = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(resp_json["id"], FAKE_INTERVIEW["id"])
        # Assert that default screen was created
        self.assertEqual(len(resp_json["screens"]), 1)    
    
    def tearDown(self):
        """Teardown tasks"""
        app.dependency_overrides.clear()
        self.session.close()

