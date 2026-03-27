from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone
import uuid

class TestCreate(BaseModel):
    user_id: str
    test_name: str
    question_ids: List[str]
    duration_minutes: int
    test_type: str = "practice"  # practice, mock, revision

class TestSubmission(BaseModel):
    test_id: str
    user_id: str
    answers: Dict[str, str]  # question_id: answer
    time_taken_minutes: int

class Test(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    test_name: str
    question_ids: List[str]
    duration_minutes: int
    test_type: str = "practice"
    answers: Optional[Dict[str, str]] = None
    score: Optional[float] = None
    time_taken_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None