from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LessonCompletionCreate(BaseModel):
    course_id: str
    lesson_id: str
    completed: bool = True
    quiz_score: Optional[int] = None

class LessonCompletion(BaseModel):
    id: int
    user_id: int
    course_id: str
    lesson_id: str
    completed: bool
    quiz_score: Optional[int]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
