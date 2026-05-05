from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel
from datetime import datetime
from .database import Base

# SQLAlchemy Model
class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    song_id = Column(String, index=True, nullable=False)
    genre = Column(String, index=True, nullable=False)
    emotion = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # 'like', 'skip', 'repeat'
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Schemas
class FeedbackCreate(BaseModel):
    user_id: int
    song_id: str
    genre: str
    emotion: str
    action: str

class FeedbackResponse(BaseModel):
    id: int
    status: str

# MoodLog Models
class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    emotion = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MoodLogCreate(BaseModel):
    user_id: int
    emotion: str

