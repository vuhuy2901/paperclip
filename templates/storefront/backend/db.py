from pathlib import Path
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

Path("data").mkdir(exist_ok=True)
database_url = os.getenv("STOREFRONT_DATABASE_URL", "sqlite:///./data/storefront.db")
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase): pass

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
