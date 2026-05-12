from fastapi import Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.record import UserStats
from server.schemas.record import LeaderboardEntry
from server.routers import leaderboard_router


@leaderboard_router.get("/", response_model=list[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    rows = (
        db.query(UserStats, User.nickname)
        .join(User, UserStats.user_id == User.id)
        .order_by(desc(UserStats.total_score))
        .limit(limit)
        .all()
    )

    result = []
    for rank, (stats, nickname) in enumerate(rows, start=1):
        accuracy = (stats.total_correct / stats.total_questions * 100) if stats.total_questions > 0 else 0.0
        result.append(LeaderboardEntry(
            rank=rank,
            nickname=nickname,
            total_score=stats.total_score,
            accuracy=round(accuracy, 1),
            total_questions=stats.total_questions,
        ))

    return result
