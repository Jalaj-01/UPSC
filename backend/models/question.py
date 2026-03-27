from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class QuestionType(str, Enum):
    MCQ = "mcq"
    SUBJECTIVE = "subjective"
    ESSAY = "essay"

class QuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType
    subject: str
    topic: str
    year: Optional[int] = None
    difficulty: str = "medium"  # easy, medium, hard
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: Optional[str] = None  # For MCQ
    explanation: Optional[str] = None
    marks: int = 10

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_text: str
    question_type: QuestionType
    subject: str
    topic: str
    year: Optional[int] = None
    difficulty: str = "medium"
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    marks: int = 10
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))