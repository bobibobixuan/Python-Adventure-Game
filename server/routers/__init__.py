from fastapi import APIRouter

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
units_router = APIRouter(prefix="/api/units", tags=["units"])
questions_router = APIRouter(prefix="/api/questions", tags=["questions"])
records_router = APIRouter(prefix="/api/records", tags=["records"])
scores_router = APIRouter(prefix="/api/scores", tags=["scores"])
achievements_router = APIRouter(prefix="/api/achievements", tags=["achievements"])
leaderboard_router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

# Import router modules so @router decorators register routes
from server.routers import auth as _auth_module       # noqa: F401
from server.routers import units as _units_module     # noqa: F401
from server.routers import questions as _questions_module  # noqa: F401
from server.routers import records as _records_module  # noqa: F401
from server.routers import scores as _scores_module    # noqa: F401
from server.routers import achievements as _achievements_module  # noqa: F401
from server.routers import leaderboard as _leaderboard_module  # noqa: F401
from server.routers import admin as _admin_module      # noqa: F401
