from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Replace with your actual PostgreSQL connection string
# Format: postgresql://user:password@host:port/dbname
# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/moodmuse"
SQLALCHEMY_DATABASE_URL = "sqlite:///./moodmuse.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
