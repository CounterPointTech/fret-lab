from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Base

_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        engine = create_engine(
            f"sqlite:///{settings.db_path}",
            connect_args={"check_same_thread": False},
        )

        @event.listens_for(engine, "connect")
        def _sqlite_pragmas(dbapi_conn, _record) -> None:
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()

        _engine = engine
    return _engine


# (table, column, DDL) added after the table already shipped — create_all does not
# alter existing tables, so patch them in explicitly (SQLite ADD COLUMN only).
_COLUMN_MIGRATIONS = (
    ("transcriptions", "source", "VARCHAR(16) NOT NULL DEFAULT 'upload'"),
    ("transcriptions", "params_json", "TEXT"),
    ("transcriptions", "meta_json", "TEXT"),
    ("songs", "key_name", "VARCHAR(32)"),
    ("songs", "bpm", "FLOAT"),
)


def init_db() -> None:
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    engine = get_engine()
    Base.metadata.create_all(engine)
    with engine.connect() as conn:
        for table, column, ddl in _COLUMN_MIGRATIONS:
            existing = {row[1] for row in conn.exec_driver_sql(f"PRAGMA table_info({table})")}
            if existing and column not in existing:
                conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")
        conn.commit()


def reset_engine() -> None:
    """Dispose the cached engine so the next use re-reads settings (tests)."""
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None


@contextmanager
def db_session() -> Iterator[Session]:
    """Short-lived session: commits on success, rolls back on any error."""
    session = Session(get_engine())
    try:
        yield session
        session.commit()
    except BaseException:
        session.rollback()
        raise
    finally:
        session.close()
