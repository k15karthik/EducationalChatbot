from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class ExamResultCreate(BaseModel):
    course_id: str
    exam_title: str
    score: float
    total_points: float
    percentage: float
    passed: bool
    time_taken: Optional[int] = None
    answers: Optional[Dict] = None

class ExamResult(BaseModel):
    id: int
    user_id: int
    course_id: str
    exam_title: str
    score: float
    total_points: float
    percentage: float
    passed: bool
    completed_at: datetime

    class Config:
        from_attributes = True
