from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.base import get_db
from app.models.lesson_completion import LessonCompletion
from app.models.user import User
from app.schemas.lesson import LessonCompletionCreate, LessonCompletion as LessonCompletionSchema
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.post("/complete", response_model=LessonCompletionSchema, status_code=status.HTTP_201_CREATED)
def mark_lesson_complete(
    lesson_data: LessonCompletionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if already completed
    existing = db.query(LessonCompletion).filter(
        LessonCompletion.user_id == current_user.id,
        LessonCompletion.course_id == lesson_data.course_id,
        LessonCompletion.lesson_id == lesson_data.lesson_id
    ).first()
    
    if existing:
        # Update existing
        existing.completed = lesson_data.completed
        existing.quiz_score = lesson_data.quiz_score
        existing.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new completion
    completion = LessonCompletion(
        user_id=current_user.id,
        course_id=lesson_data.course_id,
        lesson_id=lesson_data.lesson_id,
        completed=lesson_data.completed,
        quiz_score=lesson_data.quiz_score,
        completed_at=datetime.utcnow()
    )
    
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return completion

@router.get("/progress/{course_id}", response_model=List[LessonCompletionSchema])
def get_course_progress(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    completions = db.query(LessonCompletion).filter(
        LessonCompletion.user_id == current_user.id,
        LessonCompletion.course_id == course_id
    ).all()
    
    return completions
