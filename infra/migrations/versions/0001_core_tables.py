"""Initial core control-plane migration entrypoint."""
from alembic import op
import sqlalchemy as sa

revision = "0001_core_tables"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("projects", sa.Column("id", sa.String(36), primary_key=True), sa.Column("name", sa.String(200), nullable=False), sa.Column("repo", sa.String(500)), sa.Column("stack_profile", sa.String(100), nullable=False), sa.Column("accepted_commit", sa.String(100)), sa.Column("created_at", sa.DateTime(timezone=True)))

def downgrade():
    op.drop_table("projects")
