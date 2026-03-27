from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class UserCreate(BaseModel):
    name: str
    email: str
    language_preference: str = "english"  # english, hindi, mixed

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    language_preference: str = "english"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    streak_days: int = 0
    mentor_level: int = 1
    total_answers_written: int = 0
    total_mcqs_attempted: int = 0