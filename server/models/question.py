from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy import JSON
from sqlalchemy.orm import relationship

from server.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    type = Column(String(20), nullable=False)
    content = Column(String(2000), nullable=False)
    options = Column(JSON, nullable=True)
    answer = Column(String(500), nullable=False)
    knowledge_meaning = Column(String(1000), nullable=False, default="")
    knowledge_rule = Column(String(1000), nullable=False, default="")
    knowledge_error = Column(String(1000), nullable=False, default="")
    knowledge_example = Column(String(1000), nullable=False, default="")
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    level = relationship("Level", back_populates="questions")
