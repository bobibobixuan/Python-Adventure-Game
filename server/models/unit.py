from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from server.database import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=False, default="📚")
    subtitle = Column(String(200), nullable=False, default="")
    description = Column(String(500), nullable=False, default="")
    learning_goal = Column(String(500), nullable=False, default="")
    coach_line = Column(String(500), nullable=False, default="")
    starter_tip = Column(String(500), nullable=False, default="")
    color = Column(String(20), nullable=False, default="#667eea")
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    levels = relationship("Level", back_populates="unit", order_by="Level.sort_order")


class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    name = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=False, default="📝")
    bg = Column(String(10), nullable=False, default="🏰")
    questions_count = Column(Integer, nullable=False, default=5)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unit = relationship("Unit", back_populates="levels")
    questions = relationship("Question", back_populates="level", order_by="Question.sort_order")
