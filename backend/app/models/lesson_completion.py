from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class LessonCompletion(Base):
    __tablename__ = "lesson_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, nullable=False)  # e.g., "cs141"
    lesson_id = Column(String, nullable=False)  # e.g., "lesson1"
    completed = Column(Boolean, default=False)
    quiz_score = Column(Integer, nullable=True)  # If lesson has quiz
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="lesson_completions")
