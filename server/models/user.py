import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship

from server.models_util import APIModel, update_module_forward_refs


class User(APIModel, table=True):
    """The User model as a database table."""

    __tablename__: str = "user"
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4, primary_key=True, nullable=False
    )
    email: str
    identity_provider: str
    family_name: str
    given_name: str
    created_date: Optional[datetime] = Field(
        default_factory=datetime.utcnow, nullable=False
    )

    # relationships
    interviews: list["Interview"] = Relationship(back_populates="owner")


# Handle circular imports
from server.models.interview import Interview

update_module_forward_refs(__name__)
