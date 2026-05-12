from fastapi import Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.unit import Unit, Level
from server.models.record import LevelProgress
from server.schemas.question import UnitProgressOut, LevelProgressOut
from server.routers import scores_router


@scores_router.get("/progress", response_model=list[UnitProgressOut])
def get_progress(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    units = db.query(Unit).filter(Unit.is_active == True).order_by(Unit.sort_order).all()
    result = []

    for unit in units:
        levels = (
            db.query(Level)
            .filter(Level.unit_id == unit.id, Level.is_active == True)
            .order_by(Level.sort_order)
            .all()
        )
        level_progresses = {
            lp.level_id: lp
            for lp in db.query(LevelProgress)
            .filter(LevelProgress.user_id == user.id, LevelProgress.level_id.in_([l.id for l in levels]))
            .all()
        }

        result.append(UnitProgressOut(
            unit_id=unit.id,
            unit_name=unit.name,
            unit_icon=unit.icon,
            levels=[
                LevelProgressOut(
                    level_id=l.id,
                    name=l.name,
                    icon=l.icon,
                    bg=l.bg,
                    stars=level_progresses[l.id].stars if l.id in level_progresses else 0,
                    unlocked=level_progresses[l.id].unlocked if l.id in level_progresses else (l.sort_order == 0),
                )
                for l in levels
            ],
        ))

    return result
