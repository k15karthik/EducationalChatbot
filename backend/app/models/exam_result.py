from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, nullable=False)  # e.g., "cs141"
    exam_title = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    total_points = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Integer, nullable=False)  # 1 for pass, 0 for fail
    time_taken = Column(Integer, nullable=True)  # seconds
    answers = Column(JSON, nullable=True)  # Store user answers
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="exam_results")
