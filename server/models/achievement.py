from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship

from server.database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=False, default="🏆")
    description = Column(String(500), nullable=False, default="")
    hint = Column(String(500), nullable=False, default="")
    rarity = Column(String(20), nullable=False, default="common")
    category = Column(String(50), nullable=False, default="启程")
    condition_type = Column(String(50), nullable=False)
    condition_value = Column(Integer, nullable=False, default=1)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(String(50), ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    user = relationship("User")
    achievement = relationship("Achievement")
