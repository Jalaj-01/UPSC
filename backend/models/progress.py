from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone, date
import uuid

class PerformanceMetrics(BaseModel):
    structure_avg: float = 0.0
    content_avg: float = 0.0
    depth_avg: float = 0.0
    keyword_avg: float = 0.0
    overall_avg: float = 0.0

class ProgressUpdate(BaseModel):
    user_id: str
    date: date
    answers_written: int = 0
    mcqs_attempted: int = 0
    mcqs_correct: int = 0
    time_spent_minutes: int = 0

class Progress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: date
    answers_written: int = 0
    mcqs_attempted: int = 0
    mcqs_correct: int = 0
    time_spent_minutes: int = 0
    performance_metrics: Optional[PerformanceMetrics] = None
    weak_areas: List[str] = []
    strong_areas: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))