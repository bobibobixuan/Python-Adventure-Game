from fastapi import Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.unit import Unit, Level
from server.schemas.question import UnitOut, LevelOut
from server.routers import units_router


@units_router.get("/", response_model=list[UnitOut])
def list_units(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    units = db.query(Unit).filter(Unit.is_active == True).order_by(Unit.sort_order).all()
    return [
        UnitOut(
            id=u.id,
            name=u.name,
            icon=u.icon,
            subtitle=u.subtitle,
            description=u.description,
            learning_goal=u.learning_goal,
            coach_line=u.coach_line,
            starter_tip=u.starter_tip,
            color=u.color,
            levels=len(u.levels),
        )
        for u in units
    ]


@units_router.get("/{unit_id}/levels", response_model=list[LevelOut])
def list_levels(unit_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    levels = (
        db.query(Level)
        .filter(Level.unit_id == unit_id, Level.is_active == True)
        .order_by(Level.sort_order)
        .all()
    )
    return [
        LevelOut(
            name=l.name,
            icon=l.icon,
            bg=l.bg,
            questions=l.questions_count,
        )
        for l in levels
    ]
