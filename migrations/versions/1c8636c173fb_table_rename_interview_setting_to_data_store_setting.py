"""Table rename: interview_setting to data_store_setting

Revision ID: 1c8636c173fb
Revises: 1ee9c076141d
Create Date: 2023-10-30 16:38:18.762093

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = "1c8636c173fb"
down_revision = "1ee9c076141d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "data_store_setting",
        sa.Column("settings", sqlite.JSON(), nullable=True),
        sa.Column("type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("interview_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["interview_id"],
            ["interview.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Copy data from the old table to the new table
    op.execute(
        """
        INSERT INTO data_store_setting (settings, type, interview_id, id)
        SELECT settings, type, interview_id, id
        FROM interview_setting
        """
    )

    op.drop_table("interview_setting")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "interview_setting",
        sa.Column("settings", sqlite.JSON(), nullable=True),
        sa.Column("type", sa.VARCHAR(), nullable=False),
        sa.Column("interview_id", sa.CHAR(length=32), nullable=False),
        sa.Column("id", sa.CHAR(length=32), nullable=False),
        sa.ForeignKeyConstraint(
            ["interview_id"],
            ["interview.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Copy data back from the new table to the old table
    op.execute(
        """
        INSERT INTO interview_setting (settings, type, interview_id, id)
        SELECT settings, type, interview_id, id
        FROM data_store_setting
        """
    )

    op.drop_table("data_store_setting")
    # ### end Alembic commands ###
