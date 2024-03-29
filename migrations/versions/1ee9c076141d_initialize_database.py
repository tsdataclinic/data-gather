"""Initialize database

Revision ID: 1ee9c076141d
Revises: 
Create Date: 2023-10-30 13:43:07.959908

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '1ee9c076141d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('identity_provider', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('family_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('given_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('interview',
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('vanity_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('published', sa.Boolean(), nullable=False),
    sa.Column('owner_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('default_language', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('allowed_languages', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('vanity_url')
    )
    op.create_table('interview_screen',
    sa.Column('header_text', sqlite.JSON(), nullable=True),
    sa.Column('title', sqlite.JSON(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('is_in_starting_state', sa.Boolean(), nullable=False),
    sa.Column('starting_state_order', sa.Integer(), nullable=True),
    sa.Column('interview_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['interview_id'], ['interview.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('interview_setting',
    sa.Column('settings', sqlite.JSON(), nullable=True),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('interview_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['interview_id'], ['interview.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('submission_action',
    sa.Column('field_mappings', sqlite.JSON(), nullable=True),
    sa.Column('payload', sqlite.JSON(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('interview_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['interview_id'], ['interview.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('conditional_action',
    sa.Column('if_clause', sqlite.JSON(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('screen_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['screen_id'], ['interview_screen.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('interview_screen_entry',
    sa.Column('prompt', sqlite.JSON(), nullable=True),
    sa.Column('response_type_options', sqlite.JSON(), nullable=True),
    sa.Column('text', sqlite.JSON(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('required', sa.Boolean(), nullable=False),
    sa.Column('response_key', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('response_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('screen_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['screen_id'], ['interview_screen.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('interview_screen_entry')
    op.drop_table('conditional_action')
    op.drop_table('submission_action')
    op.drop_table('interview_setting')
    op.drop_table('interview_screen')
    op.drop_table('interview')
    op.drop_table('user')
    # ### end Alembic commands ###
