# Migrations

Alembic is configured under `infra/migrations`. The first explicit revision establishes the control-plane migration path; development startup still uses `create_all` for zero-config SQLite tests. PostgreSQL deployment should run `alembic upgrade head` before starting API/worker. Backup includes PostgreSQL metadata plus artifact/repository volumes.
