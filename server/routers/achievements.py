from fastapi import Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.achievement import Achievement, UserAchievement
from server.routers import achievements_router
from server.services.achievement_service import check_achievements as _check_service


@achievements_router.get("/")
def list_achievements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    all_achievements = db.query(Achievement).all()
    unlocked = {
        ua.achievement_id
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
    }

    return [
        {
            "id": a.id,
            "name": a.name,
            "icon": a.icon,
            "description": a.description,
            "hint": a.hint,
            "rarity": a.rarity,
            "category": a.category,
            "unlocked": a.id in unlocked,
        }
        for a in all_achievements
    ]


@achievements_router.post("/check")
def check_achievements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _check_service(user.id, db)
