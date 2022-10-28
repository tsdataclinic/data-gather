import logging

from sqlalchemy import Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy_utils import create_database, database_exists

Base = declarative_base()
LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class ConditionalAction(Base):
    __tablename__ = "conditional_action"

    action_payload = Column(String)
    action_type = Column(String)
    conditional_operator = Column(String)
    id = Column(String, primary_key=True)
    response_key = Column(String)
    screen_id = Column(String, ForeignKey("interview_screen.id"))
    value = Column(String)
    order = Column(Integer)


class InterviewScreenEntry(Base):
    __tablename__ = "interview_screen_entry"

    id = Column(String, primary_key=True)
    name = Column(String)
    prompt = Column(String)
    response_key = Column(String)
    response_type = Column(String)
    screen_id = Column(String, ForeignKey("interview_screen.id"))
    order = Column(Integer)
    text = Column(String)


class InterviewScreen(Base):
    __tablename__ = "interview_screen"

    actions = relationship("ConditionalAction")
    entries = relationship("InterviewScreenEntry")
    header_text = Column(String)
    id = Column(String, primary_key=True)
    interview_id = Column(String, ForeignKey("interview.id"))
    title = Column(String)
    order = Column(Integer)


class Interview(Base):
    __tablename__ = "interview"

    created_date = Column(String)
    description = Column(String)
    id = Column(String, primary_key=True)
    name = Column(String)
    notes = Column(String)
    screens = relationship("InterviewScreen")
    startingState = relationship("InterviewScreen")


def initialize_dev_db(file_path: str):
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_engine(url)
    Base.metadata.create_all(engine)
