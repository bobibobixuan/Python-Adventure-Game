from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship

from server.database import Base


class AnswerRecord(Base):
    __tablename__ = "answer_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    user_answer = Column(String(500), nullable=False, default="")
    is_correct = Column(Boolean, nullable=False, index=True)
    time_spent = Column(Float, nullable=False, default=0.0)
    mode = Column(String(20), nullable=False, default="adventure")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User")
    question = relationship("Question")


class LevelProgress(Base):
    __tablename__ = "level_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    stars = Column(Integer, nullable=False, default=0)
    unlocked = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "level_id", name="uq_user_level"),
    )

    user = relationship("User")
    level = relationship("Level")


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_questions = Column(Integer, nullable=False, default=0)
    total_correct = Column(Integer, nullable=False, default=0)
    total_score = Column(Integer, nullable=False, default=0)
    max_combo = Column(Integer, nullable=False, default=0)
    practice_count = Column(Integer, nullable=False, default=0)
    extreme_passes = Column(Integer, nullable=False, default=0)
    extreme_dual_passes = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
