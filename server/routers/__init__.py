from fastapi import APIRouter

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
units_router = APIRouter(prefix="/api/units", tags=["units"])
questions_router = APIRouter(prefix="/api/questions", tags=["questions"])
records_router = APIRouter(prefix="/api/records", tags=["records"])
scores_router = APIRouter(prefix="/api/scores", tags=["scores"])
achievements_router = APIRouter(prefix="/api/achievements", tags=["achievements"])
leaderboard_router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])
