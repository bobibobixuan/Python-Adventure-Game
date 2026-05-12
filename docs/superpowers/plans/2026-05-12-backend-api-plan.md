# Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI + PostgreSQL backend for the Python-Adventure-Game with JWT auth, question bank, answer records, scores, achievements, and leaderboard.

**Architecture:** FastAPI REST API with SQLAlchemy ORM over PostgreSQL. JWT Bearer token auth. Frontend JS gets a new API layer (`40_api.js`) that wraps fetch() with token management and graceful offline fallback to localStorage.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL 15, Alembic, bcrypt, PyJWT, pytest, Docker Compose

---

## File Structure

```
server/
├── main.py              # FastAPI app, CORS, router registration
├── config.py            # Pydantic Settings (DB URL, JWT secret, etc.)
├── database.py          # SQLAlchemy engine, SessionLocal, Base
├── auth.py              # JWT encode/decode, password hashing, oauth2_scheme
├── dependencies.py      # get_db, get_current_user
├── models/
│   ├── __init__.py      # Re-export all models
│   ├── user.py
│   ├── unit.py
│   ├── question.py
│   ├── record.py
│   └── achievement.py
├── schemas/
│   ├── __init__.py      # Re-export all schemas
│   ├── auth.py
│   ├── question.py
│   └── record.py
├── routers/
│   ├── __init__.py      # Create APIRouter instances
│   ├── auth.py
│   ├── units.py
│   ├── questions.py
│   ├── records.py
│   ├── scores.py
│   ├── achievements.py
│   ├── leaderboard.py
│   └── admin.py
├── services/
│   ├── __init__.py
│   └── achievement_service.py
├── seed_data.py         # CLI script: reads dev/data/*.js, inserts into DB
├── seed/
│   ├── __init__.py
│   ├── units_and_levels.py
│   └── questions.py
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_questions.py
    └── test_records.py

docker-compose.yml
Dockerfile
requirements.txt
alembic.ini
alembic/
  env.py
  versions/
    001_initial.py

dev/game/40_api.js       # NEW: API request layer with JWT + offline fallback
dev/game/10_state.js     # MODIFY: add backend sync in saveGameState/loadGameState
dev/index.html           # MODIFY: add login screen, load 40_api.js
```

---

### Task 1: Create requirements.txt

**Files:**
- Create: `requirements.txt`

- [ ] **Step 1: Write requirements.txt**

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
alembic==1.14.1
pydantic[email]==2.10.3
pydantic-settings==2.7.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
python-multipart==0.0.18
pytest==8.3.4
httpx==0.28.1
```

- [ ] **Step 2: Commit**

```bash
git add requirements.txt && git commit -m "chore: add Python backend dependencies"
```

---

### Task 2: Create server/config.py

**Files:**
- Create: `server/config.py`
- Create: `server/__init__.py` (empty)

- [ ] **Step 1: Write server/__init__.py**

```python
```

- [ ] **Step 2: Write server/config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/python_game"
    JWT_SECRET: str = "change-me-in-production-use-a-random-64-char-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
```

- [ ] **Step 3: Commit**

```bash
git add server/__init__.py server/config.py && git commit -m "feat: add server config with Pydantic Settings"
```

---

### Task 3: Create server/database.py

**Files:**
- Create: `server/database.py`

- [ ] **Step 1: Write server/database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from server.config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: Commit**

```bash
git add server/database.py && git commit -m "feat: add database engine and session setup"
```

---

### Task 4: Create SQLAlchemy Models

**Files:**
- Create: `server/models/__init__.py`
- Create: `server/models/user.py`
- Create: `server/models/unit.py`
- Create: `server/models/question.py`
- Create: `server/models/record.py`
- Create: `server/models/achievement.py`

- [ ] **Step 1: Write server/models/user.py**

```python
from sqlalchemy import Column, Integer, String, DateTime, func

from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    nickname = Column(String(50), nullable=False)
    role = Column(String(10), nullable=False, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 2: Write server/models/unit.py**

```python
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
```

- [ ] **Step 3: Write server/models/question.py**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from server.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    type = Column(String(20), nullable=False)
    content = Column(String(2000), nullable=False)
    options = Column(JSONB, nullable=True)
    answer = Column(String(500), nullable=False)
    knowledge_meaning = Column(String(1000), nullable=False, default="")
    knowledge_rule = Column(String(1000), nullable=False, default="")
    knowledge_error = Column(String(1000), nullable=False, default="")
    knowledge_example = Column(String(1000), nullable=False, default="")
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    level = relationship("Level", back_populates="questions")
```

- [ ] **Step 4: Write server/models/record.py**

```python
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship

from server.database import Base


class AnswerRecord(Base):
    __tablename__ = "answer_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_answer = Column(String(500), nullable=False, default="")
    is_correct = Column(Boolean, nullable=False)
    time_spent = Column(Float, nullable=False, default=0.0)
    mode = Column(String(20), nullable=False, default="adventure")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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
```

- [ ] **Step 5: Write server/models/achievement.py**

```python
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
```

- [ ] **Step 6: Write server/models/__init__.py**

```python
from server.models.user import User
from server.models.unit import Unit, Level
from server.models.question import Question
from server.models.record import AnswerRecord, LevelProgress, UserStats
from server.models.achievement import Achievement, UserAchievement

__all__ = [
    "User",
    "Unit",
    "Level",
    "Question",
    "AnswerRecord",
    "LevelProgress",
    "UserStats",
    "Achievement",
    "UserAchievement",
]
```

- [ ] **Step 7: Commit**

```bash
git add server/models/ && git commit -m "feat: add all SQLAlchemy ORM models"
```

---

### Task 5: Create Pydantic Schemas

**Files:**
- Create: `server/schemas/__init__.py`
- Create: `server/schemas/auth.py`
- Create: `server/schemas/question.py`
- Create: `server/schemas/record.py`

- [ ] **Step 1: Write server/schemas/auth.py**

```python
from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=100)
    nickname: str = Field(min_length=1, max_length=50)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    username: str
    nickname: str
    role: str

    class Config:
        from_attributes = True
```

- [ ] **Step 2: Write server/schemas/question.py**

```python
from pydantic import BaseModel
from typing import Optional


class OptionOut(BaseModel):
    letter: str
    text: str


class KnowledgeOut(BaseModel):
    meaning: str
    rule: str
    error: str
    example: str


class QuestionOut(BaseModel):
    id: int
    category: str
    category_id: int
    type: str
    content: str
    options: Optional[list[OptionOut]] = None
    answer: str
    knowledge: KnowledgeOut

    class Config:
        from_attributes = True


class UnitOut(BaseModel):
    id: int
    name: str
    icon: str
    subtitle: str
    description: str
    learning_goal: str
    coach_line: str
    starter_tip: str
    color: str
    levels: int

    class Config:
        from_attributes = True


class LevelOut(BaseModel):
    name: str
    icon: str
    bg: str
    questions: int

    class Config:
        from_attributes = True


class LevelProgressOut(BaseModel):
    level_id: int
    name: str
    icon: str
    bg: str
    stars: int
    unlocked: bool

    class Config:
        from_attributes = True


class UnitProgressOut(BaseModel):
    unit_id: int
    unit_name: str
    unit_icon: str
    levels: list[LevelProgressOut]
```

- [ ] **Step 3: Write server/schemas/record.py**

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: str
    is_correct: bool
    time_spent: float = 0.0
    mode: str = "adventure"


class AnswerSubmitResponse(BaseModel):
    success: bool
    score_added: int = 0
    new_achievements: list[dict] = []


class UserSummaryOut(BaseModel):
    total_questions: int
    total_correct: int
    accuracy: float
    total_score: int
    max_combo: int
    practice_count: int
    extreme_passes: int
    extreme_dual_passes: int
    total_stars: int
    completed_levels: int
    unlocked_levels: int
    total_levels: int


class WrongQuestionOut(BaseModel):
    id: int
    question_id: int
    question_content: str
    question_type: str
    user_answer: str
    correct_answer: str
    unit_name: str
    level_name: str
    timestamp: str
    knowledge: Optional[dict] = None


class LeaderboardEntry(BaseModel):
    rank: int
    nickname: str
    total_score: int
    accuracy: float
    total_questions: int

    class Config:
        from_attributes = True
```

- [ ] **Step 4: Write server/schemas/__init__.py**

```python
from server.schemas.auth import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserOut
from server.schemas.question import (
    OptionOut, KnowledgeOut, QuestionOut, UnitOut, LevelOut,
    LevelProgressOut, UnitProgressOut,
)
from server.schemas.record import (
    AnswerSubmit, AnswerSubmitResponse, UserSummaryOut,
    WrongQuestionOut, LeaderboardEntry,
)

__all__ = [
    "UserRegister", "UserLogin", "TokenResponse", "TokenRefresh", "UserOut",
    "OptionOut", "KnowledgeOut", "QuestionOut", "UnitOut", "LevelOut",
    "LevelProgressOut", "UnitProgressOut",
    "AnswerSubmit", "AnswerSubmitResponse", "UserSummaryOut",
    "WrongQuestionOut", "LeaderboardEntry",
]
```

- [ ] **Step 5: Commit**

```bash
git add server/schemas/ && git commit -m "feat: add Pydantic request/response schemas"
```

---

### Task 6: Create Auth Utilities

**Files:**
- Create: `server/auth.py`
- Create: `server/dependencies.py`

- [ ] **Step 1: Write server/auth.py**

```python
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from server.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
```

- [ ] **Step 2: Write server/dependencies.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.auth import oauth2_scheme, decode_token
from server.models.user import User


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )

    return user


def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return current_user
```

- [ ] **Step 3: Commit**

```bash
git add server/auth.py server/dependencies.py && git commit -m "feat: add JWT auth utilities and FastAPI dependencies"
```

---

### Task 7: Create Auth Router

**Files:**
- Create: `server/routers/__init__.py`
- Create: `server/routers/auth.py`

- [ ] **Step 1: Write server/routers/__init__.py**

```python
from fastapi import APIRouter

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
units_router = APIRouter(prefix="/api/units", tags=["units"])
questions_router = APIRouter(prefix="/api/questions", tags=["questions"])
records_router = APIRouter(prefix="/api/records", tags=["records"])
scores_router = APIRouter(prefix="/api/scores", tags=["scores"])
achievements_router = APIRouter(prefix="/api/achievements", tags=["achievements"])
leaderboard_router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])
```

- [ ] **Step 2: Write server/routers/auth.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from server.models.user import User
from server.models.record import UserStats
from server.schemas.auth import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserOut
from server.routers import auth_router


@auth_router.post("/register", response_model=TokenResponse)
def register(body: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="用户名已存在")

    user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        nickname=body.nickname,
    )
    db.add(user)
    db.flush()

    stats = UserStats(user_id=user.id)
    db.add(stats)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@auth_router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@auth_router.post("/refresh", response_model=TokenResponse)
def refresh(body: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在")

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )
```

- [ ] **Step 3: Commit**

```bash
git add server/routers/__init__.py server/routers/auth.py && git commit -m "feat: add auth router (register, login, refresh)"
```

---

### Task 8: Create Units & Questions Routers

**Files:**
- Create: `server/routers/units.py`
- Create: `server/routers/questions.py`

- [ ] **Step 1: Write server/routers/units.py**

```python
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
```

- [ ] **Step 2: Write server/routers/questions.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.unit import Level
from server.models.question import Question
from server.schemas.question import QuestionOut, OptionOut, KnowledgeOut
from server.routers import questions_router


@questions_router.get("/levels/{level_id}", response_model=list[QuestionOut])
def get_level_questions(level_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    level = db.query(Level).filter(Level.id == level_id, Level.is_active == True).first()
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="关卡不存在")

    questions = (
        db.query(Question)
        .filter(Question.level_id == level_id, Question.is_active == True)
        .order_by(Question.sort_order)
        .all()
    )

    return [
        QuestionOut(
            id=q.id,
            category=level.name,
            category_id=level.sort_order,
            type=q.type,
            content=q.content,
            options=[OptionOut(**opt) for opt in (q.options or [])] if q.options else None,
            answer=q.answer,
            knowledge=KnowledgeOut(
                meaning=q.knowledge_meaning,
                rule=q.knowledge_rule,
                error=q.knowledge_error,
                example=q.knowledge_example,
            ),
        )
        for q in questions
    ]
```

- [ ] **Step 3: Commit**

```bash
git add server/routers/units.py server/routers/questions.py && git commit -m "feat: add units and questions API routers"
```

---

### Task 9: Create Records Router

**Files:**
- Create: `server/routers/records.py`

- [ ] **Step 1: Write server/routers/records.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.record import AnswerRecord, LevelProgress, UserStats
from server.models.question import Question
from server.schemas.record import AnswerSubmit, AnswerSubmitResponse, UserSummaryOut, WrongQuestionOut
from server.routers import records_router


@records_router.post("/answer", response_model=AnswerSubmitResponse)
def submit_answer(body: AnswerSubmit, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    question = db.query(Question).filter(Question.id == body.question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    record = AnswerRecord(
        user_id=user.id,
        question_id=body.question_id,
        user_answer=body.user_answer,
        is_correct=body.is_correct,
        time_spent=body.time_spent,
        mode=body.mode,
    )
    db.add(record)

    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if not stats:
        stats = UserStats(user_id=user.id)
        db.add(stats)
        db.flush()

    stats.total_questions += 1
    if body.is_correct:
        stats.total_correct += 1
        stats.total_score += 100

    if body.mode == "practice":
        stats.practice_count += 1

    db.commit()

    return AnswerSubmitResponse(success=True, score_added=100 if body.is_correct else 0, new_achievements=[])


@records_router.get("/summary", response_model=UserSummaryOut)
def get_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if not stats:
        return UserSummaryOut(
            total_questions=0, total_correct=0, accuracy=0.0,
            total_score=0, max_combo=0, practice_count=0,
            extreme_passes=0, extreme_dual_passes=0,
            total_stars=0, completed_levels=0, unlocked_levels=0, total_levels=0,
        )

    total_questions = stats.total_questions
    total_correct = stats.total_correct
    accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0.0

    level_progresses = db.query(LevelProgress).filter(LevelProgress.user_id == user.id).all()
    total_stars = sum(lp.stars for lp in level_progresses)
    completed = sum(1 for lp in level_progresses if lp.stars > 0)
    unlocked = sum(1 for lp in level_progresses if lp.unlocked)
    total_levels = len(level_progresses)

    return UserSummaryOut(
        total_questions=total_questions,
        total_correct=total_correct,
        accuracy=round(accuracy, 1),
        total_score=stats.total_score,
        max_combo=stats.max_combo,
        practice_count=stats.practice_count,
        extreme_passes=stats.extreme_passes,
        extreme_dual_passes=stats.extreme_dual_passes,
        total_stars=total_stars,
        completed_levels=completed,
        unlocked_levels=unlocked,
        total_levels=total_levels,
    )


@records_router.get("/wrong", response_model=list[WrongQuestionOut])
def get_wrong_questions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    records = (
        db.query(AnswerRecord)
        .filter(AnswerRecord.user_id == user.id, AnswerRecord.is_correct == False)
        .order_by(AnswerRecord.created_at.desc())
        .limit(200)
        .all()
    )

    result = []
    for r in records:
        q = r.question
        level = q.level if q else None
        unit = level.unit if level else None
        result.append(WrongQuestionOut(
            id=r.id,
            question_id=r.question_id,
            question_content=q.content if q else "题目已移除",
            question_type=q.type if q else "未知",
            user_answer=r.user_answer,
            correct_answer=q.answer if q else "未知",
            unit_name=unit.name if unit else "未知单元",
            level_name=level.name if level else "未知关卡",
            timestamp=r.created_at.isoformat() if r.created_at else "",
            knowledge={
                "meaning": q.knowledge_meaning,
                "rule": q.knowledge_rule,
                "error": q.knowledge_error,
                "example": q.knowledge_example,
            } if q else None,
        ))
    return result
```

- [ ] **Step 2: Commit**

```bash
git add server/routers/records.py && git commit -m "feat: add answer records router (submit, summary, wrong)"
```

---

### Task 10: Create Scores Router

**Files:**
- Create: `server/routers/scores.py`

- [ ] **Step 1: Write server/routers/scores.py**

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add server/routers/scores.py && git commit -m "feat: add scores/progress router"
```

---

### Task 11: Create Achievements Service & Router

**Files:**
- Create: `server/services/__init__.py` (empty)
- Create: `server/services/achievement_service.py`
- Create: `server/routers/achievements.py`

- [ ] **Step 1: Write server/services/achievement_service.py**

```python
from sqlalchemy.orm import Session

from server.models.record import UserStats, LevelProgress, AnswerRecord
from server.models.achievement import Achievement, UserAchievement


def check_achievements(user_id: int, db: Session) -> list[dict]:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        return []

    total_questions = stats.total_questions
    total_correct = stats.total_correct
    total_score = stats.total_score
    accuracy = total_correct / total_questions if total_questions > 0 else 0

    level_progresses = db.query(LevelProgress).filter(LevelProgress.user_id == user_id).all()
    total_stars = sum(lp.stars for lp in level_progresses)

    stat_map = {
        "total_correct": total_correct,
        "total_questions": total_questions,
        "score": total_score,
        "max_combo": stats.max_combo,
        "practice_count": stats.practice_count,
        "extreme_passes": stats.extreme_passes,
        "extreme_dual_passes": stats.extreme_dual_passes,
        "total_stars": total_stars,
        "accuracy": accuracy,
    }

    all_achievements = db.query(Achievement).all()
    unlocked = {
        ua.achievement_id
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    }

    new_achievements = []
    for ach in all_achievements:
        if ach.id in unlocked:
            continue

        condition_type = ach.condition_type
        target = ach.condition_value

        if condition_type == "accuracy":
            current = accuracy
        elif condition_type == "total_questions_threshold":
            current = total_questions
        elif condition_type == "total_correct_threshold":
            current = total_correct
        else:
            current = stat_map.get(condition_type, 0)

        if condition_type == "accuracy":
            is_complete = total_questions >= 20 and current >= target / 100
        else:
            is_complete = current >= target

        if is_complete:
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.add(ua)
            new_achievements.append({
                "id": ach.id,
                "name": ach.name,
                "icon": ach.icon,
                "description": ach.description,
                "rarity": ach.rarity,
                "category": ach.category,
            })

    if new_achievements:
        db.commit()

    return new_achievements
```

- [ ] **Step 2: Write server/routers/achievements.py**

```python
from fastapi import Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.achievement import Achievement, UserAchievement
from server.routers import achievements_router


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
```

- [ ] **Step 3: Commit**

```bash
git add server/services/ server/routers/achievements.py && git commit -m "feat: add achievement service and router"
```

---

### Task 12: Create Leaderboard Router

**Files:**
- Create: `server/routers/leaderboard.py`

- [ ] **Step 1: Write server/routers/leaderboard.py**

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add server/routers/leaderboard.py && git commit -m "feat: add leaderboard router"
```

---

### Task 13: Create Admin Router

**Files:**
- Create: `server/routers/admin.py`

- [ ] **Step 1: Write server/routers/admin.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_admin_user
from server.models.user import User
from server.models.question import Question
from server.routers import admin_router


@admin_router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    from server.models.record import UserStats, AnswerRecord
    user_count = db.query(User).count()
    question_count = db.query(Question).filter(Question.is_active == True).count()
    answer_count = db.query(AnswerRecord).count()

    return {
        "user_count": user_count,
        "question_count": question_count,
        "answer_count": answer_count,
    }


@admin_router.post("/questions")
def create_question(
    body: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = Question(
        level_id=body["level_id"],
        type=body["type"],
        content=body["content"],
        options=body.get("options"),
        answer=body["answer"],
        knowledge_meaning=body.get("knowledge_meaning", ""),
        knowledge_rule=body.get("knowledge_rule", ""),
        knowledge_error=body.get("knowledge_error", ""),
        knowledge_example=body.get("knowledge_example", ""),
        sort_order=body.get("sort_order", 0),
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return {"id": question.id, "message": "题目已创建"}


@admin_router.put("/questions/{question_id}")
def update_question(
    question_id: int,
    body: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    for field in ["level_id", "type", "content", "options", "answer",
                   "knowledge_meaning", "knowledge_rule", "knowledge_error", "knowledge_example", "sort_order"]:
        if field in body:
            setattr(question, field, body[field])

    db.commit()
    return {"id": question.id, "message": "题目已更新"}


@admin_router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    question.is_active = False
    db.commit()
    return {"id": question.id, "message": "题目已删除（软删除）"}


@admin_router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
```

- [ ] **Step 2: Commit**

```bash
git add server/routers/admin.py && git commit -m "feat: add admin router (dashboard, question CRUD, user list)"
```

---

### Task 14: Create FastAPI Main App

**Files:**
- Create: `server/main.py`

- [ ] **Step 1: Write server/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.database import engine, Base
from server.routers import (
    auth_router, units_router, questions_router, records_router,
    scores_router, achievements_router, leaderboard_router, admin_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Python Adventure Game API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(units_router)
app.include_router(questions_router)
app.include_router(records_router)
app.include_router(scores_router)
app.include_router(achievements_router)
app.include_router(leaderboard_router)
app.include_router(admin_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Commit**

```bash
git add server/main.py && git commit -m "feat: add FastAPI main app with CORS and all routers"
```

---

### Task 15: Create Seed Data Script

**Files:**
- Create: `server/seed/__init__.py` (empty)
- Create: `server/seed/units_and_levels.py`
- Create: `server/seed/questions.py`
- Create: `server/seed_data.py`

- [ ] **Step 1: Write server/seed/units_and_levels.py**

```python
UNITS = [
    {
        "id": 1, "name": "第一单元：运算符进阶", "icon": "➕", "subtitle": "各类运算符的详解",
        "description": "从最简单的算式开始，学会让电脑按顺序计算和判断。",
        "learning_goal": "先把表达式怎么计算、真假怎么判断弄明白。",
        "coach_line": "别急着背规则，先把每个符号当成"会做什么的小工具"来看。",
        "starter_tip": "第一次建议先打通前两关，再回修炼场把算式题刷顺。",
        "color": "#ffd700", "sort_order": 0,
    },
    {
        "id": 2, "name": "第二单元：If语句基础", "icon": "🚦", "subtitle": "条件判断的基础概念",
        "description": "学会先判断条件，再决定程序接下来要走哪一条路。",
        "learning_goal": "练会"先判断条件，再决定走哪条分支"的思维。",
        "coach_line": "把条件想成"要不要过关"的问题，先看真假，再看动作。",
        "starter_tip": "建议边读题边用纸笔写出条件真假和变量变化。",
        "color": "#667eea", "sort_order": 1,
    },
    {
        "id": 3, "name": "第三单元：循环入门", "icon": "🔁", "subtitle": "重复执行与流程控制",
        "description": "学会让程序把同一件事重复做好几次，建立真正的代码流程感。",
        "learning_goal": "把"执行几次、什么时候停、每次变量怎么变"看清楚。",
        "coach_line": "做循环题时不要跳着看，一轮一轮地写下来，答案就会自己出现。",
        "starter_tip": "先盯住循环次数，再一轮一轮模拟变量变化，会轻松很多。",
        "color": "#36cfc9", "sort_order": 2,
    },
]

LEVELS = [
    # Unit 1 (unit_id=1): 运算符进阶
    {"unit_id": 1, "name": "算术运算符", "icon": "➕", "bg": "🌄", "questions_count": 5, "sort_order": 0},
    {"unit_id": 1, "name": "比较运算符", "icon": "⚖️", "bg": "🏛️", "questions_count": 5, "sort_order": 1},
    {"unit_id": 1, "name": "逻辑运算符", "icon": "🧠", "bg": "⚡", "questions_count": 5, "sort_order": 2},
    {"unit_id": 1, "name": "赋值运算符", "icon": "📝", "bg": "📜", "questions_count": 5, "sort_order": 3},
    {"unit_id": 1, "name": "成员运算符", "icon": "🔍", "bg": "🔮", "questions_count": 5, "sort_order": 4},
    {"unit_id": 1, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
    # Unit 2 (unit_id=2): If语句基础
    {"unit_id": 2, "name": "基础if语句", "icon": "🚦", "bg": "🔰", "questions_count": 5, "sort_order": 0},
    {"unit_id": 2, "name": "if-else双分支", "icon": "🔀", "bg": "🛤️", "questions_count": 5, "sort_order": 1},
    {"unit_id": 2, "name": "elif多重分支", "icon": "🚥", "bg": "🌈", "questions_count": 5, "sort_order": 2},
    {"unit_id": 2, "name": "嵌套条件结构", "icon": "🪆", "bg": "🕸️", "questions_count": 5, "sort_order": 3},
    {"unit_id": 2, "name": "隐式真假值", "icon": "🎭", "bg": "☯️", "questions_count": 5, "sort_order": 4},
    {"unit_id": 2, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
    # Unit 3 (unit_id=3): 循环入门
    {"unit_id": 3, "name": "for循环入门", "icon": "🔂", "bg": "🌱", "questions_count": 5, "sort_order": 0},
    {"unit_id": 3, "name": "range与计数", "icon": "🔢", "bg": "🧮", "questions_count": 5, "sort_order": 1},
    {"unit_id": 3, "name": "while循环", "icon": "🔄", "bg": "⏳", "questions_count": 5, "sort_order": 2},
    {"unit_id": 3, "name": "break与continue", "icon": "🛑", "bg": "🚧", "questions_count": 5, "sort_order": 3},
    {"unit_id": 3, "name": "循环嵌套", "icon": "🧩", "bg": "🧱", "questions_count": 5, "sort_order": 4},
    {"unit_id": 3, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
]

ACHIEVEMENTS = [
    {"id": "first_win", "name": "初试锋芒", "icon": "🌱", "description": "首次答对题目，正式踏入闯关之路。", "hint": "先答对 1 题。", "rarity": "common", "category": "启程", "condition_type": "total_correct", "condition_value": 1},
    {"id": "rookie_pacer", "name": "起步热身", "icon": "🥾", "description": "累计完成 10 道题，熟悉游戏节奏。", "hint": "累计作答 10 题。", "rarity": "common", "category": "启程", "condition_type": "total_questions", "condition_value": 10},
    {"id": "question_hunter", "name": "百题斩", "icon": "🗡️", "description": "累计完成 100 道题，正式迈入高强度训练。", "hint": "累计作答 100 题。", "rarity": "epic", "category": "启程", "condition_type": "total_questions", "condition_value": 100},
    {"id": "score_apprentice", "name": "积分学徒", "icon": "🪙", "description": "总积分达到 1000，开始稳定积累。", "hint": "累计总积分达到 1000。", "rarity": "rare", "category": "启程", "condition_type": "score", "condition_value": 1000},
    {"id": "score_architect", "name": "积分建筑师", "icon": "🏛️", "description": "总积分达到 5000，说明你已经刷出稳定实力。", "hint": "累计总积分达到 5000。", "rarity": "legendary", "category": "启程", "condition_type": "score", "condition_value": 5000},
    {"id": "speed_demon", "name": "速算达人", "icon": "⚡", "description": "在 5 秒内答对 1 题，手速与思路同时在线。", "hint": "在 5 秒内答对 1 题。", "rarity": "rare", "category": "节奏", "condition_type": "fast_answer", "condition_value": 1},
    {"id": "combo_master", "name": "连击大师", "icon": "🔥", "description": "连续答对 5 题，把节奏稳稳接住。", "hint": "把最高连击推到 5。", "rarity": "rare", "category": "节奏", "condition_type": "max_combo", "condition_value": 5},
    {"id": "combo_emperor", "name": "连击帝王", "icon": "🌋", "description": "连续答对 10 题，进入无缝输出状态。", "hint": "把最高连击推到 10。", "rarity": "epic", "category": "节奏", "condition_type": "max_combo", "condition_value": 10},
    {"id": "speed_5", "name": "快如闪电", "icon": "💨", "description": "连续 5 题都在 5 秒内答对，节奏直接拉满。", "hint": "连续 5 题 5 秒内答对。", "rarity": "epic", "category": "节奏", "condition_type": "fast_streak", "condition_value": 5},
    {"id": "perfect_clear", "name": "零伤通关", "icon": "💎", "description": "一关不掉血通关，说明你已经完全读懂题面。", "hint": "一关内不答错任何题。", "rarity": "rare", "category": "实战", "condition_type": "perfect_level", "condition_value": 1},
    {"id": "no_mistake", "name": "一字不差", "icon": "🎯", "description": "一整关题目全部答对，交出满答卷。", "hint": "一关全部答对。", "rarity": "epic", "category": "实战", "condition_type": "perfect_streak", "condition_value": 1},
    {"id": "survivor", "name": "九死一生", "icon": "🌟", "description": "只剩 1 条命时仍然完成关卡。", "hint": "残血完成一关。", "rarity": "epic", "category": "实战", "condition_type": "one_life_win", "condition_value": 1},
    {"id": "scholar", "name": "勤学苦练", "icon": "📚", "description": "修炼场累计完成 10 题，先把基本功练稳。", "hint": "在修炼场完成 10 题。", "rarity": "common", "category": "修炼", "condition_type": "practice_count", "condition_value": 10},
    {"id": "practice_veteran", "name": "修炼老将", "icon": "🧘", "description": "修炼场累计完成 30 题，说明你真的在持续打磨。", "hint": "在修炼场完成 30 题。", "rarity": "rare", "category": "修炼", "condition_type": "practice_count", "condition_value": 30},
    {"id": "clean_sheet", "name": "纸面如新", "icon": "🧼", "description": "累计作答至少 20 题后，整体正确率仍保持在 90% 以上。", "hint": "先完成 20 题，再把正确率稳定在 90%。", "rarity": "rare", "category": "修炼", "condition_type": "accuracy", "condition_value": 90},
    {"id": "master_of_operators", "name": "单元毕业", "icon": "🎓", "description": "完成当前单元的全部关卡，拿到阶段性毕业证明。", "hint": "先把一个单元全部通关。", "rarity": "rare", "category": "探索", "condition_type": "unit_cleared", "condition_value": 1},
    {"id": "star_collector", "name": "星光收藏家", "icon": "🌠", "description": "累计获得 12 颗星星，说明你的稳定性开始成型。", "hint": "累计拿到 12 颗星。", "rarity": "rare", "category": "探索", "condition_type": "total_stars", "condition_value": 12},
    {"id": "unit_crown", "name": "单元加冕", "icon": "🏅", "description": "单个单元累计拿满 18 星，说明你已经完全吃透这一章。", "hint": "把任意一个单元刷到满星。", "rarity": "epic", "category": "探索", "condition_type": "max_unit_stars", "condition_value": 18},
    {"id": "dual_unit_clear", "name": "双线通关", "icon": "🧭", "description": "完成全部学习单元，真正打通当前内容地图。", "hint": "完成全部单元。", "rarity": "legendary", "category": "探索", "condition_type": "all_units_cleared", "condition_value": 1},
    {"id": "extreme_scout", "name": "极限侦察兵", "icon": "🛡️", "description": "完成任意一次极限测试，证明你敢进高压区。", "hint": "先通过 1 次极限测试。", "rarity": "epic", "category": "极限", "condition_type": "extreme_passes", "condition_value": 1},
    {"id": "extreme_conqueror", "name": "零失误通关", "icon": "👑", "description": "通过一次双单元综合大考，把极限模式打穿。", "hint": "通过 1 次双单元综合大考。", "rarity": "legendary", "category": "极限", "condition_type": "extreme_dual_passes", "condition_value": 1},
]
```

- [ ] **Step 2: Write server/seed/extract_questions.py**

This script reads the existing JS question files and converts them to Python-compatible dicts. It handles three JS files and maps them to database level_ids 1-18.

```python
"""Extract questions from JS data files into Python dicts for seeding."""

import json
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(PROJECT_ROOT, "dev", "data")

# Map (unit_index, local_level_index) -> DB level_id (1-based)
# DB unit 1 = JS unit 0 (运算符), DB unit 2 = JS unit 1 (If语句), DB unit 3 = JS unit 2 (循环)
# Each unit has 6 levels, DB level_id = unit_id_offset + local_level_index
# Unit 1 → levels 1-6, Unit 2 → levels 7-12, Unit 3 → levels 13-18

def extract_questions():
    js_files = [
        ("10_unit1_questions.js", "unit1Questions", 1),  # level_ids 1-6
        ("11_unit2_questions.js", "unit2Questions", 7),  # level_ids 7-12
        ("12_unit3_questions.js", "unit3Questions", 13), # level_ids 13-18
    ]

    all_questions = []

    for filename, var_name, base_level_id in js_files:
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract the array assigned to var_name
        pattern = rf"const\s+{var_name}\s*=\s*\[([\s\S]*?)\];"
        match = re.search(pattern, content)
        if not match:
            print(f"Warning: Could not extract questions from {filename}")
            continue

        array_text = match.group(1)

        # Parse individual question objects using regex
        question_blocks = re.findall(r"\{([\s\S]*?)\}\s*(?:,\s*(?=\{)|\s*$)", array_text)

        for sort_order, block in enumerate(question_blocks):
            q_dict = _parse_question_block(block, base_level_id, sort_order)
            if q_dict:
                all_questions.append(q_dict)

    return all_questions


def _parse_question_block(block, base_level_id, sort_order):
    def extract(key):
        # Extract key: value, handling nested objects/arrays
        m = re.search(rf"{key}\s*:\s*(.+?)(?:,\s*\n|,\s*$|\n\s*\}}|$)", block, re.DOTALL)
        return m.group(1).strip().rstrip(",").strip() if m else ""

    q_type = extract("type").strip("'\"")

    # Parse categoryId (local level index)
    category_id_str = extract("categoryId")
    try:
        local_level = int(category_id_str)
    except ValueError:
        local_level = 0
    level_id = base_level_id + local_level

    content = extract("content").strip("'\"")
    answer = extract("answer").strip("'\"")

    # Parse options array
    options = None
    if q_type == "选择题":
        options_match = re.search(r"options\s*:\s*\[([\s\S]*?)\]", block)
        if options_match:
            options_str = options_match.group(1)
            option_blocks = re.findall(r"\{([^}]+)\}", options_str)
            options = []
            for opt_block in option_blocks:
                letter_match = re.search(r"letter\s*:\s*'([^']+)'", opt_block)
                text_match = re.search(r"text\s*:\s*'([^']*)'", opt_block)
                if letter_match and text_match:
                    options.append({"letter": letter_match.group(1), "text": text_match.group(1)})

    # Parse knowledge object
    knowledge = {}
    for k in ["meaning", "rule", "error", "example"]:
        m = re.search(rf"{k}\s*:\s*'([^']*)'", block)
        knowledge[k] = m.group(1) if m else ""

    if not q_type or not answer:
        return None

    return {
        "level_id": level_id,
        "type": q_type,
        "content": content,
        "options": options,
        "answer": answer,
        "knowledge_meaning": knowledge.get("meaning", ""),
        "knowledge_rule": knowledge.get("rule", ""),
        "knowledge_error": knowledge.get("error", ""),
        "knowledge_example": knowledge.get("example", ""),
        "sort_order": sort_order % 5,
    }


def generate_questions_py():
    questions = extract_questions()
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "questions.py")

    lines = ["# Auto-generated question data from dev/data/*.js files", "QUESTIONS = ["]
    for q in questions:
        lines.append("    {")
        for key, val in q.items():
            lines.append(f"        {key!r}: {val!r},")
        lines.append("    },")
    lines.append("]")
    lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated {len(questions)} questions to {output_path}")


if __name__ == "__main__":
    generate_questions_py()
```

- [ ] **Step 2b: Run the extraction script to generate server/seed/questions.py**

```bash
python server/seed/extract_questions.py
```

Expected: "Generated 90 questions to server/seed/questions.py"

Verify the output:
```bash
python -c "from server.seed.questions import QUESTIONS; print(f'{len(QUESTIONS)} questions'); assert len(QUESTIONS) == 90, 'Expected 90 questions'"
```

- [ ] **Step 3: Write server/seed_data.py**

```python
"""Seed the database with units, levels, questions, and achievements from seed data files.

Usage:
    python -m server.seed_data                    # seed if empty
    python -m server.seed_data --force            # re-seed (clears existing)
"""

import sys

from server.database import SessionLocal, engine, Base
from server.models.unit import Unit, Level
from server.models.question import Question
from server.models.achievement import Achievement
from server.seed.units_and_levels import UNITS, LEVELS, ACHIEVEMENTS
from server.seed.questions import QUESTIONS


def seed(force=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(Unit).count()
        if existing > 0:
            if not force:
                print(f"Database already has {existing} units. Use --force to re-seed. Skipping.")
                return
            print("Force re-seed: clearing existing data...")
            for model in [Achievement, Question, Level, Unit]:
                db.query(model).delete()
            db.commit()

        for u in UNITS:
            db.add(Unit(**u))
        db.flush()

        for lv in LEVELS:
            db.add(Level(**lv))
        db.flush()

        for q in QUESTIONS:
            db.add(Question(**q))
        db.flush()

        for a in ACHIEVEMENTS:
            db.add(Achievement(**a))
        db.flush()

        db.commit()
        print(f"Seeded: {len(UNITS)} units, {len(LEVELS)} levels, {len(QUESTIONS)} questions, {len(ACHIEVEMENTS)} achievements")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    force = "--force" in sys.argv
    seed(force)
```

- [ ] **Step 4: Commit**

```bash
git add server/seed/ server/seed_data.py && git commit -m "feat: add seed data script with units, levels, achievements"
```

---

### Task 16: Create Docker Infrastructure

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.env.example`

- [ ] **Step 1: Write Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Write docker-compose.yml**

```yaml
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: python_game
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/python_game
      JWT_SECRET: change-me-in-production-use-a-random-64-char-string
    depends_on:
      - db
    command: >
      sh -c "python -m server.seed_data && uvicorn server.main:app --host 0.0.0.0 --port 8000"

volumes:
  pgdata:
```

- [ ] **Step 3: Write .env.example**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/python_game
JWT_SECRET=change-me-in-production-use-a-random-64-char-string
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile docker-compose.yml .env.example && git commit -m "feat: add Docker and docker-compose setup"
```

---

### Task 17: Create Frontend API Layer

**Files:**
- Create: `dev/game/40_api.js`

- [ ] **Step 1: Write dev/game/40_api.js**

```javascript
const API_BASE = 'http://localhost:8000/api';

const ApiClient = {
    _accessToken: null,
    _refreshToken: null,

    init() {
        try {
            this._accessToken = localStorage.getItem('api_access_token');
            this._refreshToken = localStorage.getItem('api_refresh_token');
        } catch (e) {
            this._accessToken = null;
            this._refreshToken = null;
        }
    },

    setTokens(access, refresh) {
        this._accessToken = access;
        this._refreshToken = refresh;
        try {
            localStorage.setItem('api_access_token', access);
            localStorage.setItem('api_refresh_token', refresh);
        } catch (e) { /* ignore */ }
    },

    clearTokens() {
        this._accessToken = null;
        this._refreshToken = null;
        try {
            localStorage.removeItem('api_access_token');
            localStorage.removeItem('api_refresh_token');
        } catch (e) { /* ignore */ }
    },

    isLoggedIn() {
        return Boolean(this._accessToken);
    },

    async _fetch(path, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (this._accessToken) {
            headers['Authorization'] = `Bearer ${this._accessToken}`;
        }

        let resp = await fetch(`${API_BASE}${path}`, { ...options, headers });

        if (resp.status === 401 && this._refreshToken) {
            const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this._refreshToken }),
            });
            if (refreshResp.ok) {
                const data = await refreshResp.json();
                this.setTokens(data.access_token, data.refresh_token);
                headers['Authorization'] = `Bearer ${this._accessToken}`;
                resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
            } else {
                this.clearTokens();
            }
        }

        return resp;
    },

    async register(username, password, nickname) {
        const resp = await this._fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, nickname }),
        });
        const data = await resp.json();
        if (resp.ok) {
            this.setTokens(data.access_token, data.refresh_token);
        }
        return { ok: resp.ok, data };
    },

    async login(username, password) {
        const resp = await this._fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        const data = await resp.json();
        if (resp.ok) {
            this.setTokens(data.access_token, data.refresh_token);
        }
        return { ok: resp.ok, data };
    },

    logout() {
        this.clearTokens();
    },

    async getUnits() {
        const resp = await this._fetch('/units/');
        return resp.ok ? await resp.json() : null;
    },

    async getLevels(unitId) {
        const resp = await this._fetch(`/units/${unitId}/levels`);
        return resp.ok ? await resp.json() : null;
    },

    async getQuestions(levelId) {
        const resp = await this._fetch(`/questions/levels/${levelId}`);
        return resp.ok ? await resp.json() : null;
    },

    async submitAnswer(questionId, userAnswer, isCorrect, timeSpent, mode) {
        const resp = await this._fetch('/records/answer', {
            method: 'POST',
            body: JSON.stringify({
                question_id: questionId,
                user_answer: userAnswer,
                is_correct: isCorrect,
                time_spent: timeSpent,
                mode: mode,
            }),
        });
        return resp.ok ? await resp.json() : null;
    },

    async getSummary() {
        const resp = await this._fetch('/records/summary');
        return resp.ok ? await resp.json() : null;
    },

    async getProgress() {
        const resp = await this._fetch('/scores/progress');
        return resp.ok ? await resp.json() : null;
    },

    async getAchievements() {
        const resp = await this._fetch('/achievements/');
        return resp.ok ? await resp.json() : null;
    },

    async getLeaderboard(limit = 50) {
        const resp = await this._fetch(`/leaderboard/?limit=${limit}`);
        return resp.ok ? await resp.json() : null;
    },

    async syncProgress(progressData) {
        const resp = await this._fetch('/scores/sync', {
            method: 'POST',
            body: JSON.stringify(progressData),
        });
        return resp.ok ? await resp.json() : null;
    },
};

ApiClient.init();
```

- [ ] **Step 2: Commit**

```bash
git add dev/game/40_api.js && git commit -m "feat: add frontend API client layer with JWT management"
```

---

### Task 18: Modify Frontend to Integrate Backend

**Files:**
- Modify: `dev/index.html` — add login/signup UI and load `40_api.js`
- Modify: `dev/game/10_state.js` — add backend sync to loadGameState/saveGameState

- [ ] **Step 1: Modify dev/index.html — add auth UI before start screen**

Insert after `<div class="screen active" id="startScreen">` opening tag, before the start-screen content:

```html
<!-- 登录/注册界面 -->
<div class="screen" id="authScreen">
    <div class="auth-card">
        <h2 class="auth-title" id="authTitle">登录 / 注册</h2>
        <p class="auth-subtitle">登录后可以保存进度到云端，跨设备同步学习记录。</p>
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="switchAuthTab('login')">登录</button>
            <button class="auth-tab" onclick="switchAuthTab('register')">注册</button>
        </div>
        <div id="loginForm" class="auth-form">
            <input type="text" id="loginUsername" class="auth-input" placeholder="用户名">
            <input type="password" id="loginPassword" class="auth-input" placeholder="密码" onkeypress="if(event.key==='Enter') doLogin()">
            <button class="continue-btn" onclick="doLogin()">登录</button>
        </div>
        <div id="registerForm" class="auth-form" style="display:none;">
            <input type="text" id="regUsername" class="auth-input" placeholder="用户名">
            <input type="text" id="regNickname" class="auth-input" placeholder="昵称">
            <input type="password" id="regPassword" class="auth-input" placeholder="密码（至少6位）">
            <button class="continue-btn" onclick="doRegister()">注册</button>
        </div>
        <div id="authError" class="auth-error" style="display:none;"></div>
        <button class="continue-btn continue-btn--ghost" onclick="skipAuth()" style="margin-top:12px;">跳过，离线使用</button>
    </div>
</div>
```

- [ ] **Step 2: Modify dev/index.html — add auth status bar item**

Insert in the status bar (after "score" item):

```html
<div class="status-item">
    <span class="status-icon" id="authStatusIcon" style="display:none; cursor:pointer;" onclick="showAuthScreen()">👤</span>
</div>
```

- [ ] **Step 3: Modify dev/index.html — add build script reference**

Replace `<!-- BUILD:GAME -->` with:
```html
<script src="game/40_api.js"></script>
<!-- BUILD:GAME -->
```

- [ ] **Step 4: Modify dev/game/10_state.js — add backend sync to saveGameState**

After the existing `saveGameState()` function, add:

```javascript
function syncToBackend() {
    if (!ApiClient.isLoggedIn()) return;

    const progressData = {
        unit_level_stars: gameState.unitLevelStars,
        unit_level_unlocked: gameState.unitLevelUnlocked,
        achievements: gameState.achievements,
        total_correct: gameState.totalCorrect,
        total_questions: gameState.totalQuestions,
        score: gameState.score,
        practice_count: gameState.practiceCount,
        extreme_passes: gameState.extremePasses,
        extreme_dual_passes: gameState.extremeDualPasses,
    };
    ApiClient.syncProgress(progressData);
}


async function loadFromBackend() {
    if (!ApiClient.isLoggedIn()) return null;
    const progress = await ApiClient.getProgress();
    return progress;
}
```

Modify `saveGameState()` to call `syncToBackend()` after localStorage:
```javascript
function saveGameState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistedGameState()));
        syncToBackend();
        return true;
    } catch (error) {
        console.warn('保存存档失败。', error);
        storageStatusMessage = '保存失败：浏览器存储不可用。';
        return false;
    }
}
```

- [ ] **Step 5: Modify dev/index.html — add auth JavaScript functions**

Add before the closing `</script>` tag (the existing game scripts):

```javascript
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('authError').style.display = 'none';
}

async function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) return;

    const { ok, data } = await ApiClient.login(username, password);
    if (ok) {
        document.getElementById('authStatusIcon').style.display = 'block';
        await loadFromBackend();
        showStartScreen();
    } else {
        const err = document.getElementById('authError');
        err.textContent = data.detail || '登录失败';
        err.style.display = 'block';
    }
}

async function doRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const nickname = document.getElementById('regNickname').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!username || !nickname || !password) return;

    const { ok, data } = await ApiClient.register(username, password, nickname);
    if (ok) {
        document.getElementById('authStatusIcon').style.display = 'block';
        showStartScreen();
    } else {
        const err = document.getElementById('authError');
        err.textContent = data.detail || '注册失败';
        err.style.display = 'block';
    }
}

function skipAuth() {
    showStartScreen();
}

function showAuthScreen() {
    if (ApiClient.isLoggedIn()) {
        if (confirm('确定要退出登录吗？')) {
            ApiClient.logout();
            document.getElementById('authStatusIcon').style.display = 'none';
        }
        return;
    }
    switchScreen('authScreen');
}
```

- [ ] **Step 6: Commit**

```bash
git add dev/index.html dev/game/10_state.js && git commit -m "feat: integrate frontend with backend API (auth UI, sync)"
```

---

### Task 19: Create Backend Tests

**Files:**
- Create: `server/tests/conftest.py`
- Create: `server/tests/test_auth.py`
- Create: `server/tests/test_questions.py`
- Create: `server/tests/test_records.py`

- [ ] **Step 1: Write server/tests/conftest.py**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.database import Base, get_db
from server.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def auth_headers():
    client.post("/api/auth/register", json={
        "username": "testuser",
        "password": "testpass123",
        "nickname": "Test User",
    })
    resp = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    from server.models.user import User
    from server.auth import hash_password

    db = TestingSessionLocal()
    user = User(
        username="admin",
        password_hash=hash_password("admin123"),
        nickname="Admin",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.close()

    resp = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

- [ ] **Step 2: Write server/tests/test_auth.py**

```python
from server.tests.conftest import client


def test_register():
    resp = client.post("/api/auth/register", json={
        "username": "newuser",
        "password": "pass123456",
        "nickname": "New User",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "newuser"


def test_register_duplicate():
    client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "pass123456",
        "nickname": "Dup",
    })
    resp = client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "pass123456",
        "nickname": "Dup2",
    })
    assert resp.status_code == 409


def test_login(auth_headers):
    assert auth_headers is not None
    assert auth_headers["Authorization"].startswith("Bearer ")


def test_login_wrong_password():
    client.post("/api/auth/register", json={
        "username": "wrongpw",
        "password": "correct123",
        "nickname": "WP",
    })
    resp = client.post("/api/auth/login", json={
        "username": "wrongpw",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_refresh_token():
    resp = client.post("/api/auth/register", json={
        "username": "refresher",
        "password": "pass123456",
        "nickname": "Ref",
    })
    refresh_token = resp.json()["refresh_token"]
    resp2 = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert resp2.status_code == 200
    assert "access_token" in resp2.json()


def test_unauthorized_access():
    resp = client.get("/api/units/")
    assert resp.status_code == 401
```

- [ ] **Step 3: Write server/tests/test_questions.py**

```python
from server.tests.conftest import client
from server.models.unit import Unit, Level
from server.models.question import Question
from server.database import Base
from server.tests.conftest import engine
from sqlalchemy.orm import Session

from server.tests.conftest import TestingSessionLocal


def _seed_unit_and_level():
    db = TestingSessionLocal()
    unit = Unit(id=1, name="Test Unit", icon="📝", sort_order=0)
    db.add(unit)
    db.flush()
    level = Level(id=1, unit_id=1, name="Test Level", icon="📝", bg="🏰", sort_order=0)
    db.add(level)
    db.flush()
    q = Question(
        level_id=1, type="选择题", content="What is 2+2?",
        options=[{"letter": "A", "text": "3"}, {"letter": "B", "text": "4"}],
        answer="B", knowledge_meaning="2+2=4", knowledge_rule="addition",
        knowledge_error="don't guess", knowledge_example="2+2=4", sort_order=0,
    )
    db.add(q)
    db.commit()
    db.close()


def test_get_questions(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/questions/levels/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["type"] == "选择题"
    assert data[0]["answer"] == "B"
    assert data[0]["knowledge"]["meaning"] == "2+2=4"


def test_get_questions_not_found(auth_headers):
    resp = client.get("/api/questions/levels/999", headers=auth_headers)
    assert resp.status_code == 404


def test_list_units(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/units/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Unit"


def test_list_levels(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/units/1/levels", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Level"
```

- [ ] **Step 4: Write server/tests/test_records.py**

```python
from server.tests.conftest import client, TestingSessionLocal
from server.models.unit import Unit, Level
from server.models.question import Question


def _seed_question():
    db = TestingSessionLocal()
    unit = Unit(id=1, name="Test Unit", icon="📝", sort_order=0)
    db.add(unit)
    db.flush()
    level = Level(id=1, unit_id=1, name="Test Level", icon="📝", bg="🏰", sort_order=0)
    db.add(level)
    db.flush()
    q = Question(
        id=1, level_id=1, type="填空题", content="2+2=?",
        answer="4", knowledge_meaning="", knowledge_rule="",
        knowledge_error="", knowledge_example="", sort_order=0,
    )
    db.add(q)
    db.commit()
    db.close()


def test_submit_answer(auth_headers):
    _seed_question()
    resp = client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1,
        "user_answer": "4",
        "is_correct": True,
        "time_spent": 3.5,
        "mode": "adventure",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_get_summary(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "4", "is_correct": True,
        "time_spent": 2.0, "mode": "adventure",
    })
    resp = client.get("/api/records/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_questions"] == 1
    assert data["total_correct"] == 1


def test_get_wrong_questions(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "3", "is_correct": False,
        "time_spent": 5.0, "mode": "adventure",
    })
    resp = client.get("/api/records/wrong", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["user_answer"] == "3"


def test_leaderboard(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "4", "is_correct": True,
        "time_spent": 1.0, "mode": "adventure",
    })
    resp = client.get("/api/leaderboard/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


def test_admin_dashboard(admin_headers):
    resp = client.get("/api/admin/dashboard", headers=admin_headers)
    assert resp.status_code == 200
    assert "user_count" in resp.json()
```

- [ ] **Step 5: Run tests and commit**

```bash
cd server && python -m pytest tests/ -v
```

Expected: all tests pass.

```bash
git add server/tests/ && git commit -m "test: add backend API tests (auth, questions, records, admin)"
```

---

### Task 20: Final Verification

- [ ] **Step 1: Install dependencies**

```bash
pip install -r requirements.txt
```

- [ ] **Step 2: Start PostgreSQL** (via Docker or local install)

```bash
docker compose up -d db
```

- [ ] **Step 3: Run seed**

```bash
python -m server.seed_data
```

Expected: "Seeded: 3 units, 18 levels, 90 questions, 22 achievements"

- [ ] **Step 4: Start API server**

```bash
uvicorn server.main:app --reload
```

- [ ] **Step 5: Verify health**

```bash
curl http://localhost:8000/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 6: Test register and login**

```bash
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"password\":\"demo123\",\"nickname\":\"Demo\"}"
```

- [ ] **Step 7: Test questions API with token**

```bash
curl http://localhost:8000/api/questions/levels/1 -H "Authorization: Bearer <token>"
```

Expected: 5 questions for level 1.

- [ ] **Step 8: Verify leaderboard**

```bash
curl http://localhost:8000/api/leaderboard/ -H "Authorization: Bearer <token>"
```

- [ ] **Step 9: Open Swagger docs**

Navigate to http://localhost:8000/docs to verify all endpoints are listed.

- [ ] **Step 10: Open the game frontend**

Open `dev/index.html` in a browser. Verify the login/register form appears, test login flow, and confirm questions load from the API.

- [ ] **Step 11: Final commit**

```bash
git add -A && git commit -m "feat: complete backend API integration with frontend"
```
