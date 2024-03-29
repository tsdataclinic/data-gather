from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship

from server.models_util import APIModel, update_module_forward_refs


class UserBase(APIModel):
    """The base User model"""

    email: str
    identity_provider: str
    family_name: str
    given_name: str
    created_date: Optional[datetime] = Field(
        default_factory=datetime.utcnow, nullable=False
    )


class User(UserBase, table=True):
    """The User model as a database table."""

    __tablename__: str = "user"
    id: Optional[str] = Field(primary_key=True, nullable=False)

    # relationships
    interviews: list["Interview"] = Relationship(back_populates="owner")


class UserRead(UserBase):
    id: str
    created_date: datetime


# Handle circular imports
from server.models.interview import Interview

update_module_forward_refs(__name__)
