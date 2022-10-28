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
    id = Column(String, primary_key=True)
    interview_id = Column(String, ForeignKey("interview.id"))
    order = Column(Integer)
    response_key = Column(String)
    screen_id = Column(String)
    value = Column(String)


class Interview(Base):
    __tablename__ = "interview"

    created_date = Column(String)
    description = Column(String)
    id = Column(String, primary_key=True)
    name = Column(String)
    notes = Column(String)
    screens = relationship("InterviewScreen")
    startingState = relationship("InterviewScreen")


class InterviewScreen(Base):
    __tablename__ = "interview_screen"

    actions = relationship("ConditionalAction")
    entries = relationship("InterviewScreenEntry")
    order = Column(Integer)
    header_text = Column(String)
    id = Column(String, primary_key=True)
    interview_id = Column(String, ForeignKey("interview.id"))
    title = Column(String)


class InterviewScreenEntry(Base):
    __tablename__ = "interview_screen_entry"

    name = Column(String)
    prompt = Column(String)
    response_id = Column(String, primary_key=True)
    interview_id = Column(String, ForeignKey("interview.id"))
    order = Column(Integer)
    response_type = Column(String)
    screen_id = Column(String)
    text = Column(String)


def initialize_dev_db(file_path: str):
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_engine(url)
    Base.metadata.create_all(engine)
