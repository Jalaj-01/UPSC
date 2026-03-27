from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime, timezone
import uuid

class AnswerCreate(BaseModel):
    user_id: str
    question_id: str
    answer_text: str
    is_voice_input: bool = False

class AnswerEvaluation(BaseModel):
    structure_score: float  # 0-10
    content_score: float  # 0-10
    depth_score: float  # 0-10
    keyword_score: float  # 0-10
    overall_score: float  # 0-10
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    improved_answer: Optional[str] = None

class Answer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question_id: str
    answer_text: str
    is_voice_input: bool = False
    evaluation: Optional[AnswerEvaluation] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))