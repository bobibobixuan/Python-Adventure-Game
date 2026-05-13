# Teacher Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone teacher admin panel at `/admin` with dashboard charts, student list/detail, level analytics, and wrong-question stats.

**Architecture:** Extend existing FastAPI backend with read-only analytics endpoints querying SQLite; serve a vanilla HTML/CSS/JS admin SPA from `dev/admin/` with locally-bundled Chart.js. All admin APIs guarded by existing `get_admin_user` dependency.

**Tech Stack:** Python FastAPI, SQLAlchemy ORM, SQLite, vanilla JS, Chart.js (local UMD build)

---

### Task 1: Database indexes on answer_records

**Files:**
- Modify: `server/models/record.py` (lines 7-20, `AnswerRecord` class)

- [ ] **Step 1: Add missing indexes to AnswerRecord model**

```python
class AnswerRecord(Base):
    __tablename__ = "answer_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    user_answer = Column(String(500), nullable=False, default="")
    is_correct = Column(Boolean, nullable=False, index=True)
    time_spent = Column(Float, nullable=False, default=0.0)
    mode = Column(String(20), nullable=False, default="adventure")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User")
    question = relationship("Question")
```

Add `index=True` to `question_id`, `is_correct`, and `created_at` columns. The `user_id` column already has it.

- [ ] **Step 2: Rebuild test database**

Run: `pytest server/tests/test_auth.py::test_register -v`
Expected: PASS (verifies tables rebuild with new indexes)

- [ ] **Step 3: Commit**

```bash
git add server/models/record.py
git commit -m "fix: add indexes to answer_records for analytics query performance"
```

---

### Task 2: Create admin Pydantic schemas

**Files:**
- Create: `server/schemas/admin.py`
- Modify: `server/schemas/__init__.py`

- [ ] **Step 1: Write admin schemas**

```python
from pydantic import BaseModel
from typing import Optional


class StudentListItem(BaseModel):
    user_id: int
    username: str
    nickname: str
    total_score: int
    accuracy: float
    total_questions: int
    completed_levels: int
    total_stars: int
    practice_count: int
    last_active: Optional[str] = None


class StudentListResponse(BaseModel):
    items: list[StudentListItem]
    total: int
    page: int
    page_size: int


class StudentSummary(BaseModel):
    total_score: int
    accuracy: float
    max_combo: int
    total_questions: int
    total_correct: int
    practice_count: int
    extreme_passes: int


class LevelProgressItem(BaseModel):
    level_name: str
    stars: int
    unlocked: bool


class UnitProgressItem(BaseModel):
    unit_name: str
    levels: list[LevelProgressItem]


class RecentAnswerItem(BaseModel):
    question_content: str
    user_answer: str
    is_correct: bool
    time_spent: float
    created_at: str


class WrongQuestionItem(BaseModel):
    id: int
    question_content: str
    correct_answer: str
    user_answer: str
    unit_name: str
    level_name: str


class StudentDetailOut(BaseModel):
    user_id: int
    username: str
    nickname: str
    created_at: Optional[str]
    summary: StudentSummary
    unit_progress: list[UnitProgressItem]
    recent_answers: list[RecentAnswerItem]
    wrong_questions: list[WrongQuestionItem]


class LevelAnalyticsOut(BaseModel):
    unit_name: str
    level_name: str
    total_attempts: int
    correct_rate: float
    avg_time_spent: float
    student_count: int


class WrongQuestionStatsOut(BaseModel):
    question_id: int
    question_content: str
    question_type: str
    wrong_count: int
    wrong_rate: float
    correct_answer: str
    unit_name: str
    level_name: str


class DailyTrendItem(BaseModel):
    date: str
    count: int


class UnitAccuracyItem(BaseModel):
    unit_name: str
    accuracy: float


class DashboardOut(BaseModel):
    user_count: int
    question_count: int
    answer_count: int
    avg_accuracy: float
    avg_score: float
    active_today: int
    daily_trend: list[DailyTrendItem]
    unit_accuracy: list[UnitAccuracyItem]
```

- [ ] **Step 2: Register schemas in __init__.py**

Add to `server/schemas/__init__.py`:

```python
from server.schemas.admin import (
    StudentListItem, StudentListResponse, StudentDetailOut,
    StudentSummary, LevelProgressItem, UnitProgressItem,
    RecentAnswerItem, WrongQuestionItem,
    LevelAnalyticsOut, WrongQuestionStatsOut,
    DashboardOut, DailyTrendItem, UnitAccuracyItem,
)
```

Add all new names to `__all__`.

- [ ] **Step 3: Verify imports**

Run: `python -c "from server.schemas.admin import DashboardOut, StudentListResponse, StudentDetailOut, LevelAnalyticsOut, WrongQuestionStatsOut; print('OK')"`
Expected: prints "OK"

- [ ] **Step 4: Commit**

```bash
git add server/schemas/admin.py server/schemas/__init__.py
git commit -m "feat: add admin Pydantic schemas for teacher analytics"
```

---

### Task 3: Create stats service

**Files:**
- Create: `server/services/stats_service.py`

- [ ] **Step 1: Write stats_service.py**

```python
from datetime import datetime, date, timedelta, timezone

from sqlalchemy import func, case, desc
from sqlalchemy.orm import Session

from server.models.user import User
from server.models.unit import Unit, Level
from server.models.question import Question
from server.models.record import AnswerRecord, LevelProgress, UserStats


def get_enhanced_dashboard(db: Session) -> dict:
    user_count = db.query(User).count()
    question_count = db.query(Question).filter(Question.is_active == True).count()
    answer_count = db.query(AnswerRecord).count()

    total_questions = db.query(UserStats.total_questions).all()
    total_q = sum(s[0] for s in total_questions)
    total_correct = db.query(UserStats.total_correct).all()
    total_c = sum(s[0] for s in total_correct)
    avg_accuracy = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

    all_scores = db.query(UserStats.total_score).all()
    user_with_scores = [s[0] for s in all_scores if s[0] > 0]
    avg_score = round(sum(user_with_scores) / len(user_with_scores), 1) if user_with_scores else 0.0

    today_start = datetime.combine(date.today(), datetime.min.time())
    active_today = (
        db.query(func.count(func.distinct(AnswerRecord.user_id)))
        .filter(AnswerRecord.created_at >= today_start)
        .scalar()
    )

    seven_days_ago = datetime.combine(date.today() - timedelta(days=6), datetime.min.time())
    daily_rows = (
        db.query(
            func.date(AnswerRecord.created_at).label("d"),
            func.count().label("c"),
        )
        .filter(AnswerRecord.created_at >= seven_days_ago)
        .group_by("d")
        .order_by("d")
        .all()
    )
    daily_trend = [{"date": str(row.d), "count": row.c} for row in daily_rows]

    unit_rows = (
        db.query(
            Unit.name,
            func.coalesce(
                func.sum(case((AnswerRecord.is_correct == True, 1), else_=0)) * 100.0 /
                func.nullif(func.count(AnswerRecord.id), 0), 0
            ).label("acc"),
        )
        .join(Level, Level.unit_id == Unit.id)
        .join(Question, Question.level_id == Level.id)
        .join(AnswerRecord, AnswerRecord.question_id == Question.id)
        .group_by(Unit.name)
        .order_by(Unit.sort_order)
        .all()
    )
    unit_accuracy = [{"unit_name": row.name, "accuracy": round(row.acc, 1)} for row in unit_rows]

    return {
        "user_count": user_count,
        "question_count": question_count,
        "answer_count": answer_count,
        "avg_accuracy": avg_accuracy,
        "avg_score": avg_score,
        "active_today": active_today,
        "daily_trend": daily_trend,
        "unit_accuracy": unit_accuracy,
    }


def get_students(
    db: Session,
    sort_by: str = "total_score",
    order: str = "desc",
    search: str = "",
    page: int = 1,
    page_size: int = 20,
) -> dict:
    base_q = (
        db.query(User, UserStats, func.max(AnswerRecord.created_at).label("last_active"))
        .outerjoin(UserStats, UserStats.user_id == User.id)
        .outerjoin(AnswerRecord, AnswerRecord.user_id == User.id)
        .filter(User.role == "user")
        .group_by(User.id)
    )
    if search:
        base_q = base_q.filter(User.nickname.contains(search))

    total = base_q.count()

    order_col = {
        "total_score": UserStats.total_score,
        "accuracy": func.coalesce(
            UserStats.total_correct * 100.0 / func.nullif(UserStats.total_questions, 0), 0
        ),
        "total_questions": UserStats.total_questions,
        "completed_levels": func.coalesce(
            db.query(LevelProgress)
            .filter(LevelProgress.user_id == User.id, LevelProgress.stars > 0)
            .correlate(User)
            .with_entities(func.count())
            .as_scalar(), 0
        ),
    }
    col = order_col.get(sort_by, UserStats.total_score)
    if order == "asc":
        col = col.asc()
    else:
        col = col.desc()

    rows = base_q.order_by(col).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for user, stats, last_active in rows:
        total_q = stats.total_questions if stats else 0
        total_c = stats.total_correct if stats else 0
        acc = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

        completed = (
            db.query(LevelProgress)
            .filter(LevelProgress.user_id == user.id, LevelProgress.stars > 0)
            .count()
        )
        total_stars_q = (
            db.query(func.coalesce(func.sum(LevelProgress.stars), 0))
            .filter(LevelProgress.user_id == user.id)
            .scalar()
        )

        items.append({
            "user_id": user.id,
            "username": user.username,
            "nickname": user.nickname,
            "total_score": stats.total_score if stats else 0,
            "accuracy": acc,
            "total_questions": total_q,
            "completed_levels": completed,
            "total_stars": total_stars_q,
            "practice_count": stats.practice_count if stats else 0,
            "last_active": last_active.isoformat() if last_active else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_student_detail(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    total_q = stats.total_questions if stats else 0
    total_c = stats.total_correct if stats else 0
    acc = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

    summary = {
        "total_score": stats.total_score if stats else 0,
        "accuracy": acc,
        "max_combo": stats.max_combo if stats else 0,
        "total_questions": total_q,
        "total_correct": total_c,
        "practice_count": stats.practice_count if stats else 0,
        "extreme_passes": stats.extreme_passes if stats else 0,
    }

    units = db.query(Unit).filter(Unit.is_active == True).order_by(Unit.sort_order).all()
    unit_progress = []
    all_level_ids = []
    for unit in units:
        levels = (
            db.query(Level)
            .filter(Level.unit_id == unit.id, Level.is_active == True)
            .order_by(Level.sort_order)
            .all()
        )
        all_level_ids.extend([l.id for l in levels])
        progresses = {
            lp.level_id: lp
            for lp in db.query(LevelProgress)
            .filter(LevelProgress.user_id == user_id, LevelProgress.level_id.in_([l.id for l in levels]))
            .all()
        }
        unit_progress.append({
            "unit_name": unit.name,
            "levels": [
                {
                    "level_name": l.name,
                    "stars": progresses[l.id].stars if l.id in progresses else 0,
                    "unlocked": progresses[l.id].unlocked if l.id in progresses else (l.sort_order == 0),
                }
                for l in levels
            ],
        })

    recent_answers = (
        db.query(AnswerRecord, Question.content)
        .join(Question, Question.id == AnswerRecord.question_id)
        .filter(AnswerRecord.user_id == user_id)
        .order_by(AnswerRecord.created_at.desc())
        .limit(20)
        .all()
    )
    recent_list = [
        {
            "question_content": content,
            "user_answer": rec.user_answer,
            "is_correct": rec.is_correct,
            "time_spent": rec.time_spent,
            "created_at": rec.created_at.isoformat() if rec.created_at else "",
        }
        for rec, content in recent_answers
    ]

    wrong_records = (
        db.query(AnswerRecord, Question.content, Question.answer, Unit.name, Level.name)
        .join(Question, Question.id == AnswerRecord.question_id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(AnswerRecord.user_id == user_id, AnswerRecord.is_correct == False)
        .order_by(AnswerRecord.created_at.desc())
        .limit(20)
        .all()
    )
    wrong_list = [
        {
            "id": rec.id,
            "question_content": content,
            "correct_answer": ans,
            "user_answer": rec.user_answer,
            "unit_name": unit_name,
            "level_name": level_name,
        }
        for rec, content, ans, unit_name, level_name in wrong_records
    ]

    return {
        "user_id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "summary": summary,
        "unit_progress": unit_progress,
        "recent_answers": recent_list,
        "wrong_questions": wrong_list,
    }


def get_level_analytics(db: Session) -> list:
    rows = (
        db.query(
            Unit.name.label("unit_name"),
            Level.name.label("level_name"),
            func.count(AnswerRecord.id).label("total_attempts"),
            func.coalesce(
                func.sum(case((AnswerRecord.is_correct == True, 1), else_=0)) * 100.0 /
                func.nullif(func.count(AnswerRecord.id), 0), 0
            ).label("correct_rate"),
            func.coalesce(func.avg(AnswerRecord.time_spent), 0).label("avg_time_spent"),
            func.count(func.distinct(AnswerRecord.user_id)).label("student_count"),
        )
        .join(Question, Question.id == AnswerRecord.question_id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(Level.is_active == True)
        .group_by(Unit.name, Level.name, Unit.sort_order, Level.sort_order)
        .order_by("correct_rate")
        .all()
    )
    return [
        {
            "unit_name": row.unit_name,
            "level_name": row.level_name,
            "total_attempts": row.total_attempts,
            "correct_rate": round(row.correct_rate, 1),
            "avg_time_spent": round(row.avg_time_spent, 1),
            "student_count": row.student_count,
        }
        for row in rows
    ]


def get_wrong_question_stats(db: Session, limit: int = 50) -> list:
    rows = (
        db.query(
            Question.id.label("question_id"),
            Question.content.label("question_content"),
            Question.type.label("question_type"),
            Question.answer.label("correct_answer"),
            func.count(AnswerRecord.id).label("wrong_count"),
            (
                func.count(AnswerRecord.id) * 100.0 /
                func.nullif(
                    db.query(func.count(AnswerRecord.id))
                    .filter(AnswerRecord.question_id == Question.id)
                    .correlate(Question)
                    .as_scalar(), 0
                )
            ).label("wrong_rate"),
            Unit.name.label("unit_name"),
            Level.name.label("level_name"),
        )
        .select_from(Question)
        .join(AnswerRecord, AnswerRecord.question_id == Question.id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(AnswerRecord.is_correct == False)
        .group_by(Question.id)
        .order_by(desc("wrong_count"))
        .limit(limit)
        .all()
    )
    return [
        {
            "question_id": row.question_id,
            "question_content": row.question_content,
            "question_type": row.question_type,
            "wrong_count": row.wrong_count,
            "wrong_rate": round(row.wrong_rate, 1),
            "correct_answer": row.correct_answer,
            "unit_name": row.unit_name,
            "level_name": row.level_name,
        }
        for row in rows
    ]
```

- [ ] **Step 2: Verify imports**

Run: `python -c "from server.services.stats_service import get_enhanced_dashboard, get_students, get_student_detail, get_level_analytics, get_wrong_question_stats; print('OK')"`
Expected: prints "OK"

- [ ] **Step 3: Commit**

```bash
git add server/services/stats_service.py
git commit -m "feat: add stats service for teacher analytics queries"
```

---

### Task 4: Extend admin router with analytics endpoints

**Files:**
- Modify: `server/routers/admin.py`

- [ ] **Step 1: Add new import block at top of admin.py**

Replace the existing imports with:

```python
from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_admin_user
from server.models.user import User
from server.models.question import Question
from server.routers import admin_router
from server.services.stats_service import (
    get_enhanced_dashboard,
    get_students,
    get_student_detail,
    get_level_analytics,
    get_wrong_question_stats,
)
from server.schemas.admin import (
    DashboardOut,
    StudentListResponse,
    StudentDetailOut,
    LevelAnalyticsOut,
    WrongQuestionStatsOut,
)
```

- [ ] **Step 2: Replace the existing dashboard endpoint**

```python
@admin_router.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return get_enhanced_dashboard(db)
```

- [ ] **Step 3: Add student list endpoint**

```python
@admin_router.get("/students", response_model=StudentListResponse)
def list_students(
    sort_by: str = Query("total_score"),
    order: str = Query("desc"),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_students(db, sort_by=sort_by, order=order, search=search, page=page, page_size=page_size)
```

- [ ] **Step 4: Add student detail endpoint**

```python
@admin_router.get("/students/{user_id}", response_model=StudentDetailOut)
def student_detail(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = get_student_detail(db, user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    return result
```

- [ ] **Step 5: Add level analytics endpoint**

```python
@admin_router.get("/analytics/levels", response_model=list[LevelAnalyticsOut])
def level_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_level_analytics(db)
```

- [ ] **Step 6: Add wrong question stats endpoint**

```python
@admin_router.get("/analytics/wrong-questions", response_model=list[WrongQuestionStatsOut])
def wrong_question_stats(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_wrong_question_stats(db, limit=limit)
```

- [ ] **Step 7: Verify endpoints import cleanly**

Run: `python -c "from server.routers.admin import dashboard, list_students, student_detail, level_analytics, wrong_question_stats; print('OK')"`
Expected: prints "OK"

- [ ] **Step 8: Commit**

```bash
git add server/routers/admin.py
git commit -m "feat: add teacher analytics API endpoints to admin router"
```

---

### Task 5: Fix /admin static route in main.py

**Files:**
- Modify: `server/main.py`

- [ ] **Step 1: Add FileResponse import**

Add this import near the top of `server/main.py`:

```python
from fastapi.responses import FileResponse
import os
```

- [ ] **Step 2: Add explicit /admin route**

Add this right after the health endpoint:

```python
@app.get("/admin", include_in_schema=False)
def admin_panel_index():
    admin_html = _get_static_dir() / "admin" / "index.html"
    if admin_html.exists():
        return FileResponse(str(admin_html))
    return FileResponse(str(_get_static_dir() / "index.html"))
```

- [ ] **Step 3: Verify imports**

Run: `python -c "from server.main import app; print('OK')"`
Expected: prints "OK"

- [ ] **Step 4: Commit**

```bash
git add server/main.py
git commit -m "fix: add explicit /admin route for admin panel without trailing slash"
```

---

### Task 6: Write tests for admin APIs

**Files:**
- Create: `server/tests/test_admin.py`

- [ ] **Step 1: Write test_admin.py**

```python
from server.tests.conftest import client


def test_dashboard_requires_admin(auth_headers):
    resp = client.get("/api/admin/dashboard", headers=auth_headers)
    assert resp.status_code == 403


def test_dashboard_as_admin(admin_headers):
    resp = client.get("/api/admin/dashboard", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "user_count" in data
    assert "avg_accuracy" in data
    assert "daily_trend" in data
    assert "unit_accuracy" in data


def test_student_list_pagination(admin_headers):
    resp = client.get(
        "/api/admin/students?page=1&page_size=10", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert data["page"] == 1
    assert data["page_size"] == 10


def test_student_list_search(admin_headers):
    resp = client.get(
        "/api/admin/students?search=nonexistent_xyz", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0


def test_student_detail_not_found(admin_headers):
    resp = client.get("/api/admin/students/99999", headers=admin_headers)
    assert resp.status_code == 404


def test_student_detail_exists(admin_headers, auth_headers):
    user_resp = client.get("/api/records/summary", headers=auth_headers)
    assert user_resp.status_code == 200

    list_resp = client.get(
        "/api/admin/students?page_size=100", headers=admin_headers
    )
    users = list_resp.json()["items"]
    test_user = next((u for u in users if u["username"] == "testuser"), None)
    assert test_user is not None, "testuser not found in student list"
    user_id = test_user["user_id"]

    resp = client.get(f"/api/admin/students/{user_id}", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == user_id
    assert "summary" in data
    assert "unit_progress" in data
    assert "recent_answers" in data
    assert "wrong_questions" in data


def test_level_analytics(admin_headers):
    resp = client.get("/api/admin/analytics/levels", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_wrong_question_stats(admin_headers):
    resp = client.get(
        "/api/admin/analytics/wrong-questions?limit=10", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) <= 10
```

- [ ] **Step 2: Run tests to verify**

Run: `pytest server/tests/test_admin.py -v`
Expected: All 8 tests PASS

- [ ] **Step 3: Commit**

```bash
git add server/tests/test_admin.py
git commit -m "test: add admin analytics API tests"
```

---

### Task 7: Download Chart.js locally

**Files:**
- Create: `dev/admin/lib/chart.umd.js`

- [ ] **Step 1: Create directory and download Chart.js**

```bash
mkdir -p dev/admin/lib
curl -L -o dev/admin/lib/chart.umd.js https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js
```

Note: If curl is not available, use PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path dev/admin/lib
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js" -OutFile "dev/admin/lib/chart.umd.js"
```

- [ ] **Step 2: Verify file exists and is reasonable size**

Run: `wc -l dev/admin/lib/chart.umd.js`
Expected: a single long line of JavaScript (~200K+ bytes)

- [ ] **Step 3: Commit**

```bash
git add dev/admin/lib/chart.umd.js
git commit -m "chore: add Chart.js v4.4.0 UMD build for offline admin panel"
```

---

### Task 8: Create admin panel frontend - HTML shell

**Files:**
- Create: `dev/admin/index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>教师管理后台 - Python Adventure Game</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="admin-layout" id="adminLayout">
        <!-- Sidebar -->
        <nav class="admin-sidebar" id="adminSidebar">
            <div class="sidebar-brand">🐍 教师后台</div>
            <div class="sidebar-nav" id="sidebarNav">
                <button class="nav-item active" data-page="dashboard">📊 仪表盘</button>
                <button class="nav-item" data-page="students">👥 学生列表</button>
                <button class="nav-item" data-page="level-analytics">📈 关卡分析</button>
                <button class="nav-item" data-page="wrong-questions">❌ 错题统计</button>
                <button class="nav-item" data-page="import">⬆️ 题库导入</button>
            </div>
            <div class="sidebar-footer">
                <span id="adminUserDisplay"></span>
                <button class="logout-btn" onclick="doLogout()">退出</button>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="admin-main" id="adminMain">
            <!-- Login form (shown when not authenticated) -->
            <div class="login-container" id="loginContainer">
                <div class="login-card">
                    <h2>🔐 管理员登录</h2>
                    <p class="login-subtitle">请输入管理员账号和密码</p>
                    <input type="text" id="loginUsername" placeholder="用户名" class="admin-input"
                           onkeypress="if(event.key==='Enter') document.getElementById('loginPassword').focus()">
                    <input type="password" id="loginPassword" placeholder="密码" class="admin-input"
                           onkeypress="if(event.key==='Enter') doAdminLogin()">
                    <button class="login-btn" onclick="doAdminLogin()">登录</button>
                    <div class="login-error" id="loginError"></div>
                </div>
            </div>

            <!-- Content area (shown when authenticated) -->
            <div class="admin-content" id="adminContent" style="display:none;">
                <!-- Dashboard -->
                <div class="page-section" id="page-dashboard">
                    <h2 class="page-title">📊 仪表盘</h2>
                    <div class="summary-cards" id="dashboardCards"></div>
                    <div class="charts-row">
                        <div class="chart-container">
                            <h3 class="chart-title">最近7天答题趋势</h3>
                            <canvas id="dailyTrendChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3 class="chart-title">各单元平均正确率</h3>
                            <canvas id="unitAccuracyChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Students -->
                <div class="page-section" id="page-students" style="display:none;">
                    <h2 class="page-title">👥 学生列表</h2>
                    <div class="students-toolbar">
                        <input type="text" id="studentSearch" placeholder="按昵称搜索..."
                               class="admin-input" style="max-width:300px;"
                               oninput="loadStudentList()">
                    </div>
                    <div class="table-wrapper">
                        <table class="admin-table" id="studentTable">
                            <thead>
                                <tr>
                                    <th data-sort="nickname" class="sortable" onclick="setSort('nickname')">昵称</th>
                                    <th data-sort="total_score" class="sortable" onclick="setSort('total_score')">总分</th>
                                    <th data-sort="accuracy" class="sortable" onclick="setSort('accuracy')">正确率</th>
                                    <th data-sort="completed_levels" class="sortable" onclick="setSort('completed_levels')">完成关卡</th>
                                    <th>最近活跃</th>
                                </tr>
                            </thead>
                            <tbody id="studentTableBody"></tbody>
                        </table>
                    </div>
                    <div class="pagination" id="studentPagination"></div>
                    <div class="student-detail" id="studentDetail" style="display:none;"></div>
                </div>

                <!-- Level Analytics -->
                <div class="page-section" id="page-level-analytics" style="display:none;">
                    <h2 class="page-title">📈 关卡分析</h2>
                    <div class="table-wrapper">
                        <table class="admin-table" id="levelAnalyticsTable">
                            <thead>
                                <tr>
                                    <th>单元</th>
                                    <th>关卡</th>
                                    <th>参与人数</th>
                                    <th>正确率</th>
                                    <th>平均耗时(s)</th>
                                </tr>
                            </thead>
                            <tbody id="levelAnalyticsTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Wrong Questions -->
                <div class="page-section" id="page-wrong-questions" style="display:none;">
                    <h2 class="page-title">❌ 错题统计</h2>
                    <div class="table-wrapper">
                        <table class="admin-table" id="wrongQuestionsTable">
                            <thead>
                                <tr>
                                    <th>题目内容</th>
                                    <th>关卡</th>
                                    <th>错误次数</th>
                                    <th>错误率</th>
                                </tr>
                            </thead>
                            <tbody id="wrongQuestionsTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Import -->
                <div class="page-section" id="page-import" style="display:none;">
                    <h2 class="page-title">⬆️ 题库导入</h2>
                    <div class="import-zone" id="importZone">
                        <div class="import-drop" id="importDrop" onclick="document.getElementById('importFileInput').click()">
                            <div class="import-drop-icon">📁</div>
                            <div class="import-drop-text" id="importDropText">点击选择文件或拖拽到此处</div>
                        </div>
                        <input type="file" id="importFileInput" accept=".json" style="display:none;"
                               onchange="handleAdminImportFile(this.files[0])">
                        <div class="import-preview" id="importPreview" style="display:none;">
                            <div class="import-preview-header">
                                <strong id="importPreviewUnit"></strong>
                                <span id="importPreviewCount"></span>
                            </div>
                            <div id="importPreviewQuestions"></div>
                        </div>
                        <div class="import-result" id="importResult" style="display:none;"></div>
                        <button class="login-btn" id="importSubmitBtn" onclick="doAdminImport()" disabled
                                style="margin-top:15px;">开始导入</button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="lib/chart.umd.js"></script>
    <script src="admin.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add dev/admin/index.html
git commit -m "feat: add admin panel HTML shell"
```

---

### Task 9: Create admin panel frontend - CSS

**Files:**
- Create: `dev/admin/admin.css`

- [ ] **Step 1: Write admin.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; }

.admin-layout { display: flex; min-height: 100vh; }

/* Sidebar */
.admin-sidebar { width: 220px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
.sidebar-brand { padding: 24px 20px; font-size: 1.15em; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar-nav { flex: 1; padding: 12px 0; }
.nav-item { display: block; width: 100%; padding: 12px 20px; border: none; background: transparent; color: rgba(255,255,255,0.65); font-size: 0.95em; text-align: left; cursor: pointer; transition: all 0.15s; }
.nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
.nav-item.active { color: #fff; background: rgba(255,255,255,0.1); border-right: 3px solid #667eea; }
.sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.85em; color: rgba(255,255,255,0.5); display: flex; justify-content: space-between; align-items: center; }
.logout-btn { padding: 6px 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; background: transparent; color: rgba(255,255,255,0.65); cursor: pointer; font-size: 0.85em; }
.logout-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* Main */
.admin-main { margin-left: 220px; flex: 1; padding: 0; }

/* Login */
.login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f2f5; }
.login-card { width: 380px; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.login-card h2 { text-align: center; margin-bottom: 8px; font-size: 1.4em; }
.login-subtitle { text-align: center; color: #999; margin-bottom: 24px; font-size: 0.9em; }
.admin-input { width: 100%; padding: 10px 14px; border: 1px solid #d9d9d9; border-radius: 8px; font-size: 0.95em; margin-bottom: 12px; outline: none; transition: border-color 0.15s; }
.admin-input:focus { border-color: #667eea; }
.login-btn { width: 100%; padding: 11px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 1em; cursor: pointer; font-weight: 600; }
.login-btn:hover { opacity: 0.9; }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.login-error { color: #e74c3c; font-size: 0.85em; text-align: center; margin-top: 12px; }

/* Content */
.admin-content { padding: 32px; }
.page-section { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.page-title { font-size: 1.6em; margin-bottom: 24px; }

/* Summary Cards */
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.summary-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.summary-card .card-label { font-size: 0.85em; color: #999; margin-bottom: 8px; }
.summary-card .card-value { font-size: 2em; font-weight: 700; }

/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-container { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.chart-title { font-size: 1em; font-weight: 600; margin-bottom: 16px; color: #555; }
.chart-container canvas { max-height: 280px; }

/* Tables */
.table-wrapper { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
.admin-table th { text-align: left; padding: 12px 16px; background: #fafafa; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666; white-space: nowrap; }
.admin-table th.sortable { cursor: pointer; user-select: none; }
.admin-table th.sortable:hover { color: #667eea; }
.admin-table th.sortable::after { content: ' ↕'; font-size: 0.8em; color: #ccc; }
.admin-table td { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; }
.admin-table tbody tr:hover { background: #fafbff; }
.admin-table tbody tr { cursor: pointer; }

/* Correct Rate Bar */
.rate-bar { display: inline-flex; align-items: center; gap: 8px; }
.rate-bar-fill { height: 8px; border-radius: 4px; min-width: 4px; }
.rate-bar.rate-low .rate-bar-fill { background: #e74c3c; }
.rate-bar.rate-mid .rate-bar-fill { background: #f39c12; }
.rate-bar.rate-high .rate-bar-fill { background: #27ae60; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 0.9em; }
.pagination button { padding: 6px 14px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; }
.pagination button:hover { border-color: #667eea; color: #667eea; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination .page-info { color: #999; }

/* Student Detail */
.student-detail { background: #fff; border-radius: 12px; padding: 24px; margin-top: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); animation: fadeIn 0.2s; }
.student-detail .back-btn { background: none; border: 1px solid #d9d9d9; border-radius: 6px; padding: 6px 14px; cursor: pointer; margin-bottom: 16px; font-size: 0.9em; }
.student-detail .back-btn:hover { border-color: #667eea; color: #667eea; }
.student-detail-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.student-detail-card { background: #f8f9fb; border-radius: 8px; padding: 14px; text-align: center; }
.student-detail-card .card-label { font-size: 0.8em; color: #999; margin-bottom: 4px; }
.student-detail-card .card-value { font-size: 1.3em; font-weight: 700; }
.unit-progress-list { margin-bottom: 20px; }
.unit-progress-item { margin-bottom: 12px; }
.unit-progress-item .unit-label { font-weight: 600; color: #444; margin-bottom: 6px; }
.level-bars { display: flex; gap: 8px; flex-wrap: wrap; }
.level-bar { flex: 1; min-width: 80px; background: #f0f0f0; border-radius: 6px; padding: 8px; text-align: center; font-size: 0.8em; }
.level-bar .lb-name { color: #666; margin-bottom: 4px; }
.level-bar .lb-stars { color: #f39c12; font-weight: 600; }
.level-bar.locked { opacity: 0.4; }

/* Tab Switcher */
.tab-switcher { display: flex; gap: 0; margin-bottom: 12px; border-bottom: 2px solid #f0f0f0; }
.tab-btn { padding: 8px 20px; border: none; background: transparent; cursor: pointer; font-size: 0.9em; color: #999; }
.tab-btn.active { color: #667eea; border-bottom: 2px solid #667eea; margin-bottom: -2px; font-weight: 600; }

/* Import Zone */
.import-zone { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.import-drop { border: 2px dashed #d9d9d9; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: border-color 0.15s; }
.import-drop:hover { border-color: #667eea; }
.import-drop-icon { font-size: 2.5em; margin-bottom: 8px; }
.import-drop-text { color: #999; }
.import-preview { background: #f0f7ff; border-radius: 8px; padding: 14px; margin-top: 16px; }
.import-preview-header { margin-bottom: 8px; }
.import-preview-header strong { color: #333; }
.import-preview-header span { color: #999; margin-left: 8px; font-size: 0.85em; }
.import-result { margin-top: 12px; padding: 12px; border-radius: 8px; }

/* Students toolbar */
.students-toolbar { margin-bottom: 16px; }

/* Responsive */
@media (max-width: 768px) {
    .admin-sidebar { width: 60px; }
    .sidebar-brand { font-size: 0; padding: 16px 8px; text-align: center; }
    .sidebar-brand::before { content: '🐍'; font-size: 1.3em; }
    .nav-item { font-size: 0; padding: 14px 8px; text-align: center; }
    .nav-item::before { font-size: 1.1em; }
    .nav-item[data-page="dashboard"]::before { content: '📊'; }
    .nav-item[data-page="students"]::before { content: '👥'; }
    .nav-item[data-page="level-analytics"]::before { content: '📈'; }
    .nav-item[data-page="wrong-questions"]::before { content: '❌'; }
    .nav-item[data-page="import"]::before { content: '⬆️'; }
    .admin-main { margin-left: 60px; }
    .summary-cards { grid-template-columns: repeat(2, 1fr); }
    .charts-row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Commit**

```bash
git add dev/admin/admin.css
git commit -m "feat: add admin panel CSS styles"
```

---

### Task 10: Create admin panel frontend - JavaScript

**Files:**
- Create: `dev/admin/admin.js`

- [ ] **Step 1: Write admin.js**

```javascript
// ---- Auth & State ----
const ADMIN_TOKEN_KEY = 'admin_jwt_token';
const ADMIN_USER_KEY = 'admin_user';

let currentPage = 'dashboard';
let currentSort = 'total_score';
let currentSortOrder = 'desc';
let currentStudentPage = 1;

function getToken() { return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem('jwt_token'); }
function setToken(t) { localStorage.setItem(ADMIN_TOKEN_KEY, t); localStorage.setItem('jwt_token', t); }
function clearToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); localStorage.removeItem('jwt_token'); localStorage.removeItem(ADMIN_USER_KEY); localStorage.removeItem('current_user'); }

async function fetchAdmin(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(path, { ...options, headers });
    if (resp.status === 401) {
        clearToken();
        showLogin();
        throw new Error('登录已过期');
    }
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: '请求失败' }));
        throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    return resp.json();
}

// ---- Login ----
function showLogin() {
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('loginContainer').style.display = '';
    document.getElementById('adminUserDisplay').textContent = '';
}

function showContent(user) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContent').style.display = '';
    document.getElementById('adminUserDisplay').textContent = user.nickname || user.username;
    switchPage('dashboard');
}

async function doAdminLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    if (!username || !password) { errEl.textContent = '请输入用户名和密码'; return; }

    try {
        const data = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.detail || '登录失败'); });
            return r.json();
        });

        if (data.user.role !== 'admin') {
            errEl.textContent = '需要管理员账号';
            return;
        }

        setToken(data.access_token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        document.getElementById('loginError').textContent = '';
        showContent(data.user);
    } catch (e) {
        errEl.textContent = e.message;
    }
}

function doLogout() {
    clearToken();
    showLogin();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// ---- Init ----
(function init() {
    const token = getToken();
    const userJson = localStorage.getItem(ADMIN_USER_KEY) || localStorage.getItem('current_user');
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user.role === 'admin') {
                showContent(user);
                return;
            }
        } catch (e) {}
    }
    showLogin();

    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
})();

// ---- Navigation ----
function switchPage(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = '';

    if (page === 'dashboard') loadDashboard();
    else if (page === 'students') loadStudentList();
    else if (page === 'level-analytics') loadLevelAnalytics();
    else if (page === 'wrong-questions') loadWrongQuestions();

    document.getElementById('studentDetail').style.display = 'none';
}

// ---- Dashboard ----
async function loadDashboard() {
    try {
        const data = await fetchAdmin('/api/admin/dashboard');
        document.getElementById('dashboardCards').innerHTML =
            `<div class="summary-card"><div class="card-label">学生总数</div><div class="card-value" style="color:#667eea;">${data.user_count}</div></div>
             <div class="summary-card"><div class="card-label">答题总数</div><div class="card-value" style="color:#27ae60;">${data.answer_count}</div></div>
             <div class="summary-card"><div class="card-label">平均正确率</div><div class="card-value" style="color:#f39c12;">${data.avg_accuracy}%</div></div>
             <div class="summary-card"><div class="card-label">今日活跃</div><div class="card-value" style="color:#e74c3c;">${data.active_today}</div></div>`;

        renderDailyTrend(data.daily_trend);
        renderUnitAccuracy(data.unit_accuracy);
    } catch (e) {
        console.error('Dashboard load failed:', e);
    }
}

let dailyTrendChartInst = null, unitAccuracyChartInst = null;

function renderDailyTrend(trend) {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    if (dailyTrendChartInst) dailyTrendChartInst.destroy();
    const labels = trend.map(t => t.date);
    const values = trend.map(t => t.count);
    dailyTrendChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '答题数',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102,126,234,0.08)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
            },
        },
    });
}

function renderUnitAccuracy(data) {
    const ctx = document.getElementById('unitAccuracyChart').getContext('2d');
    if (unitAccuracyChartInst) unitAccuracyChartInst.destroy();
    unitAccuracyChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.unit_name),
            datasets: [{
                label: '正确率 %',
                data: data.map(d => d.accuracy),
                backgroundColor: data.map(d => {
                    if (d.accuracy >= 80) return 'rgba(39,174,96,0.6)';
                    if (d.accuracy >= 60) return 'rgba(243,156,18,0.6)';
                    return 'rgba(231,76,60,0.6)';
                }),
                borderColor: data.map(d => {
                    if (d.accuracy >= 80) return '#27ae60';
                    if (d.accuracy >= 60) return '#f39c12';
                    return '#e74c3c';
                }),
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } },
        },
    });
}

// ---- Student List ----
function setSort(field) {
    if (currentSort === field) {
        currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        currentSort = field;
        currentSortOrder = 'desc';
    }
    currentStudentPage = 1;
    loadStudentList();
}

async function loadStudentList() {
    const search = document.getElementById('studentSearch').value || '';
    const params = new URLSearchParams({
        sort_by: currentSort, order: currentSortOrder,
        search: search, page: currentStudentPage, page_size: 20,
    });
    try {
        const data = await fetchAdmin('/api/admin/students?' + params);
        const tbody = document.getElementById('studentTableBody');
        tbody.innerHTML = data.items.map(s =>
            `<tr onclick="fetchAndRenderStudentDetail(${s.user_id})">
                <td><strong>${escapeHtml(s.nickname)}</strong><br><span style="color:#999;font-size:0.8em;">@${escapeHtml(s.username)}</span></td>
                <td>${s.total_score}</td>
                <td>${s.accuracy}%</td>
                <td>${s.completed_levels}</td>
                <td>${s.last_active ? s.last_active.substring(0, 16) : '-'}</td>
            </tr>`
        ).join('');

        const totalPages = Math.ceil(data.total / data.page_size);
        document.getElementById('studentPagination').innerHTML =
            `<button ${currentStudentPage <= 1 ? 'disabled' : ''} onclick="currentStudentPage--;loadStudentList()">上一页</button>
             <span class="page-info">第 ${data.page} / ${totalPages} 页 (共 ${data.total} 人)</span>
             <button ${currentStudentPage >= totalPages ? 'disabled' : ''} onclick="currentStudentPage++;loadStudentList()">下一页</button>`;
    } catch (e) {
        console.error('Student list load failed:', e);
    }
}

// ---- Student Detail ----
function renderStudentDetail(data) {
    const detail = document.getElementById('studentDetail');
        detail.style.display = '';

        let progressHTML = data.unit_progress.map(u =>
            `<div class="unit-progress-item">
                <div class="unit-label">${escapeHtml(u.unit_name)}</div>
                <div class="level-bars">${u.levels.map(l =>
                    `<div class="level-bar${l.unlocked ? '' : ' locked'}">
                        <div class="lb-name">${escapeHtml(l.level_name)}</div>
                        <div class="lb-stars">${'⭐'.repeat(l.stars) || '—'}</div>
                    </div>`
                ).join('')}</div>
            </div>`
        ).join('');

        detail.innerHTML = `
            <button class="back-btn" onclick="closeStudentDetail()">← 返回列表</button>
            <h3 style="margin-bottom:12px;">${escapeHtml(data.nickname)} <span style="color:#999;font-size:0.7em;font-weight:400;">@${escapeHtml(data.username)}</span></h3>
            <div class="student-detail-cards">
                <div class="student-detail-card"><div class="card-label">总分</div><div class="card-value" style="color:#667eea;">${data.summary.total_score}</div></div>
                <div class="student-detail-card"><div class="card-label">正确率</div><div class="card-value" style="color:#27ae60;">${data.summary.accuracy}%</div></div>
                <div class="student-detail-card"><div class="card-label">答题数</div><div class="card-value">${data.summary.total_questions}</div></div>
                <div class="student-detail-card"><div class="card-label">最高连击</div><div class="card-value" style="color:#f39c12;">${data.summary.max_combo}</div></div>
            </div>
            <div class="unit-progress-list">${progressHTML}</div>
            <div class="tab-switcher">
                <button class="tab-btn active" onclick="switchDetailTab('recent', this, ${userId})">最近答题</button>
                <button class="tab-btn" onclick="switchDetailTab('wrong', this, ${userId})">错题记录</button>
            </div>
            <div id="detailTabContent"></div>
        `;

        switchDetailTab('recent', detail.querySelector('.tab-btn.active'), data.user_id);
        detail.scrollIntoView({ behavior: 'smooth' });
}

function closeStudentDetail() {
    document.getElementById('studentDetail').style.display = 'none';
}

function switchDetailTab(tab, btn, userId) {
    btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const container = document.getElementById('detailTabContent');
    if (tab === 'recent') {
        const items = window._studentDetail.recent_answers;
        container.innerHTML = items.length === 0
            ? '<p style="color:#999;padding:16px;">暂无答题记录</p>'
            : `<table class="admin-table"><thead><tr><th>题目</th><th>回答</th><th>结果</th><th>用时(s)</th><th>时间</th></tr></thead><tbody>
                ${items.map(a => `<tr>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.question_content)}</td>
                    <td>${escapeHtml(a.user_answer)}</td>
                    <td style="color:${a.is_correct ? '#27ae60' : '#e74c3c'};">${a.is_correct ? '✓' : '✗'}</td>
                    <td>${a.time_spent.toFixed(1)}</td>
                    <td>${a.created_at.substring(0, 16)}</td>
                </tr>`).join('')}</tbody></table>`;
    } else {
        const items = window._studentDetail.wrong_questions;
        container.innerHTML = items.length === 0
            ? '<p style="color:#999;padding:16px;">暂无错题记录</p>'
            : `<table class="admin-table"><thead><tr><th>题目</th><th>学生回答</th><th>正确答案</th><th>单元</th><th>关卡</th></tr></thead><tbody>
                ${items.map(w => `<tr>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(w.question_content)}</td>
                    <td style="color:#e74c3c;">${escapeHtml(w.user_answer)}</td>
                    <td style="color:#27ae60;">${escapeHtml(w.correct_answer)}</td>
                    <td>${escapeHtml(w.unit_name)}</td>
                    <td>${escapeHtml(w.level_name)}</td>
                </tr>`).join('')}</tbody></table>`;
    }
}

// Fetch data first, then render (avoids circular reference)
async function fetchAndRenderStudentDetail(userId) {
    try {
        const data = await fetchAdmin(`/api/admin/students/${userId}`);
        window._studentDetail = data;
        renderStudentDetail(data);
    } catch (e) { console.error(e); }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Level Analytics ----
async function loadLevelAnalytics() {
    try {
        const data = await fetchAdmin('/api/admin/analytics/levels');
        const tbody = document.getElementById('levelAnalyticsTableBody');
        tbody.innerHTML = data.map(l => {
            let cssClass = l.correct_rate >= 80 ? 'rate-high' : (l.correct_rate >= 60 ? 'rate-mid' : 'rate-low');
            return `<tr>
                <td>${escapeHtml(l.unit_name)}</td>
                <td>${escapeHtml(l.level_name)}</td>
                <td>${l.student_count}</td>
                <td><div class="rate-bar ${cssClass}"><div class="rate-bar-fill" style="width:${l.correct_rate}px;"></div>${l.correct_rate}%</div></td>
                <td>${l.avg_time_spent}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Level analytics load failed:', e);
    }
}

// ---- Wrong Questions ----
async function loadWrongQuestions() {
    try {
        const data = await fetchAdmin('/api/admin/analytics/wrong-questions?limit=50');
        const tbody = document.getElementById('wrongQuestionsTableBody');
        tbody.innerHTML = data.map(w =>
            `<tr onclick="toggleWrongDetail(this)" data-answer="${escapeHtml(w.correct_answer)}" data-knowledge="${escapeHtml(w.unit_name + ' / ' + w.level_name)}">
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(w.question_content)}</td>
                <td>${escapeHtml(w.level_name)}</td>
                <td style="color:#e74c3c;font-weight:600;">${w.wrong_count}</td>
                <td style="color:#e74c3c;">${w.wrong_rate}%</td>
            </tr>`
        ).join('');
    } catch (e) {
        console.error('Wrong questions load failed:', e);
    }
}

function toggleWrongDetail(row) {
    const existing = row.nextElementSibling;
    if (existing && existing.classList.contains('wrong-detail-row')) {
        existing.remove();
        return;
    }
    const answer = row.dataset.answer;
    const knowledge = row.dataset.knowledge;
    const tr = document.createElement('tr');
    tr.className = 'wrong-detail-row';
    tr.innerHTML = `<td colspan="4" style="background:#fffbe6;padding:12px 16px;">
        <strong>正确答案：</strong><span style="color:#27ae60;">${escapeHtml(answer)}</span>
        <span style="margin-left:16px;"><strong>所属：</strong>${escapeHtml(knowledge)}</span>
    </td>`;
    row.parentNode.insertBefore(tr, row.nextSibling);
}

// ---- Import ----
let pendingAdminImportData = null;

function handleAdminImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.version || !data.unit || !Array.isArray(data.questions)) {
                throw new Error('格式不符合规范：需要 version, unit, questions 字段');
            }
            pendingAdminImportData = data;
            document.getElementById('importDropText').textContent = file.name;
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('importPreviewUnit').textContent = '📚 ' + data.unit;
            document.getElementById('importPreviewCount').textContent = data.questions.length + ' 题';
            const preview = document.getElementById('importPreviewQuestions');
            preview.innerHTML = data.questions.slice(0, 5).map((q, i) =>
                `<div style="padding:6px 0;border-bottom:1px solid #eee;">${i+1}. [${q.type}] ${escapeHtml(q.content.substring(0, 50))}${q.content.length > 50 ? '...' : ''}</div>`
            ).join('') + (data.questions.length > 5 ? `<div style="color:#999;padding:6px 0;">... 还有 ${data.questions.length - 5} 题</div>` : '');
            document.getElementById('importSubmitBtn').disabled = false;
        } catch (err) {
            alert('文件解析失败：' + err.message);
        }
    };
    reader.readAsText(file);
}

async function doAdminImport() {
    if (!pendingAdminImportData) return;
    const btn = document.getElementById('importSubmitBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';
    const resultDiv = document.getElementById('importResult');
    try {
        const result = await fetchAdmin('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify(pendingAdminImportData),
        });
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#e8f5e9;color:#2e7d32;padding:12px;border-radius:8px;">✅ ${result.message}</div>`;
        pendingAdminImportData = null;
        btn.style.display = 'none';
    } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#ffebee;color:#c62828;padding:12px;border-radius:8px;">❌ ${err.message}</div>`;
        btn.disabled = false;
        btn.textContent = '重试导入';
    }
}

// Drag-and-drop for import
(function setupImportDnD() {
    const dropZone = document.getElementById('importDrop');
    if (!dropZone) return;
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#667eea'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#d9d9d9'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d9d9d9';
        const file = e.dataTransfer.files[0];
        if (file) handleAdminImportFile(file);
    });
})();
```

- [ ] **Step 2: Commit**

```bash
git add dev/admin/admin.js
git commit -m "feat: add admin panel JavaScript logic"
```

---

### Task 11: Integration test — run full test suite

- [ ] **Step 1: Remove old test.db and run all tests**

```bash
Remove-Item test.db -Force -ErrorAction SilentlyContinue
pytest server/tests/ -v
```
Expected: All tests PASS

- [ ] **Step 2: Verify full import chain**

```bash
python -c "from server.main import app; routes = [r.path for r in app.routes]; print('OK' if '/api/admin/analytics/levels' in str(routes) else 'MISSING')"
```
Expected: prints "OK"

- [ ] **Step 3: Commit any remaining changes**

```bash
git status
```

If clean, no commit needed. If any uncommitted changes, review and commit.

---

### Task 12: Manual smoke test — start server and verify

- [ ] **Step 1: Start server**

```bash
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

- [ ] **Step 2: Verify routes**
  - Open `http://localhost:8000/admin` — should show admin login page
  - Login with admin credentials — should show dashboard
  - Click through all 5 nav items — pages should render
  - Dashboard charts should render (Chart.js loaded locally)
  - Student list should show paginated results
  - Click student row — detail view should render
  - Level analytics table should show data
  - Wrong questions should show expandable rows
  - Import should accept a JSON file

- [ ] **Step 3: Stop server**

End-to-end manual verification complete.
```

- [ ] **Step 13: Final commit if needed**

Check for any lint issues or missed files.
