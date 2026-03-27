from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class NoteCreate(BaseModel):
    user_id: str
    title: str
    content: str
    subject: Optional[str] = None
    topic: Optional[str] = None
    tags: List[str] = []
    is_voice_note: bool = False

class Note(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    subject: Optional[str] = None
    topic: Optional[str] = None
    tags: List[str] = []
    is_voice_note: bool = False
    ai_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlashcardCreate(BaseModel):
    user_id: str
    front: str
    back: str
    subject: str
    topic: Optional[str] = None

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    front: str
    back: str
    subject: str
    topic: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_reviewed: Optional[datetime] = None
    review_count: int = 0
    mastery_level: int = 0  # 0-5