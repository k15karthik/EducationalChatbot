from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.base import get_db
from app.models.exam_result import ExamResult
from app.models.user import User
from app.schemas.exam import ExamResultCreate, ExamResult as ExamResultSchema
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.post("/results", response_model=ExamResultSchema, status_code=status.HTTP_201_CREATED)
def submit_exam_result(
    exam_data: ExamResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create exam result
    exam_result = ExamResult(
        user_id=current_user.id,
        course_id=exam_data.course_id,
        exam_title=exam_data.exam_title,
        score=exam_data.score,
        total_points=exam_data.total_points,
        percentage=exam_data.percentage,
        passed=1 if exam_data.passed else 0,
        time_taken=exam_data.time_taken,
        answers=exam_data.answers
    )
    
    db.add(exam_result)
    db.commit()
    db.refresh(exam_result)
    
    return exam_result

@router.get("/results", response_model=List[ExamResultSchema])
def get_my_exam_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(ExamResult).filter(
        ExamResult.user_id == current_user.id
    ).order_by(ExamResult.completed_at.desc()).all()
    
    return results

@router.get("/results/{course_id}", response_model=List[ExamResultSchema])
def get_course_exam_results(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(ExamResult).filter(
        ExamResult.user_id == current_user.id,
        ExamResult.course_id == course_id
    ).order_by(ExamResult.completed_at.desc()).all()
    
    return results
