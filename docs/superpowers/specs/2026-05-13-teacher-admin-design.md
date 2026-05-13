# Teacher Admin Panel Design

## Overview

Add a teacher-facing admin panel to the existing Python-Adventure-Game backend. Teachers can view student quiz data, grade statistics, level analytics, and frequently-wrong questions. The panel is a standalone vanilla HTML/CSS/JS page served at `/admin`, protected by the existing admin role check. The system is packaged as a standalone .exe for offline/LAN use — zero external network dependencies.

## Tech Stack

- **Backend**: Python FastAPI (existing), no new dependencies
- **Frontend**: Vanilla HTML/CSS/JS + Chart.js (bundled locally, not CDN)
- **Auth**: Existing JWT + admin role check (`get_admin_user`)

## Architecture

```
dev/admin/
├── index.html            # Admin panel main page
├── admin.css             # Admin panel styles
├── admin.js              # Admin panel logic + charts
└── lib/
    └── chart.umd.js      # Chart.js UMD build (downloaded once, checked into repo)

Server additions:
server/routers/admin.py          # Extend with student data + analytics APIs
server/schemas/admin.py          # New: admin-specific Pydantic schemas
server/services/stats_service.py # New: statistics computation service

Routing:
/           → dev/index.html          (game frontend)
/admin      → explicit FileResponse   (see "Static Route Fix" below)
/admin/     → dev/admin/index.html    (StaticFiles directory index)
/api/admin/* → admin_router            (admin API)
```

- Frontend is a standalone SPA-style page, no framework
- Chart.js bundled as a local file in `dev/admin/lib/`, no CDN
- All admin APIs require `get_admin_user` dependency

## Static Route Fix

FastAPI `StaticFiles` mounted at `/` won't serve `/admin` (no trailing slash) correctly. An explicit route is needed:

```python
@app.get("/admin", include_in_schema=False)
def admin_panel_index():
    return FileResponse(os.path.join(_get_static_dir(), "admin", "index.html"))
```

This ensures both `/admin` and `/admin/` work.

## Admin Login Flow

Scenario: teacher opens browser, navigates to `/admin`, has no JWT token.

1. Admin JS on load checks for a valid JWT token in localStorage
2. If no token: render an in-page login form (same style as the game's login, but inside the admin shell)
3. User submits credentials → POST `/api/auth/login` → if role != "admin", show "需要管理员账号"
4. On success: store token in localStorage, re-render the admin dashboard
5. If token exists but expired: 401 response triggers re-display of login form

This keeps the admin panel self-contained — no cross-page redirects needed.

## Database Indexes

The following indexes must exist for performant real-time aggregation on SQLite:

| Table | Column | Reason |
|-------|--------|--------|
| answer_records | user_id | Already indexed |
| answer_records | question_id | Level analytics JOIN |
| answer_records | is_correct | Wrong-question filtering, accuracy calc |
| answer_records | created_at | Daily trend, "last active" queries |
| level_progress | user_id | Already indexed |

These should be verified/added in the SQLAlchemy model (`server/models/record.py`) via `index=True`.

## API Design

All endpoints under `/api/admin`, require admin role. Student list includes pagination.

### 1. Dashboard (enhance existing)

```
GET /api/admin/dashboard
Response: {
    user_count, question_count, answer_count,   // existing
    avg_accuracy,       // new: overall average accuracy %
    avg_score,          // new: overall average score
    active_today,       // new: users who answered today
    daily_trend: [{date, count}],         // new: last 7 days answer counts
    unit_accuracy: [{unit_name, accuracy}] // new: per-unit average accuracy
}
```

### 2. Student list (with pagination)

```
GET /api/admin/students?sort_by=total_score&order=desc&search=&page=1&page_size=20
Response: {
    items: [{
        user_id, username, nickname,
        total_score, accuracy, total_questions,
        completed_levels, total_stars,
        practice_count,
        last_active          // most recent answer timestamp
    }],
    total,                   // total matching students
    page, page_size,         // current pagination
}
```

### 3. Student detail

```
GET /api/admin/students/{user_id}
Response: {
    user_id, username, nickname, created_at,
    summary: { total_score, accuracy, max_combo, total_questions,
               total_correct, practice_count, extreme_passes },
    unit_progress: [{ unit_name, levels: [{level_name, stars, unlocked}] }],
    recent_answers: [{ question_content, user_answer, is_correct,
                       time_spent, created_at }],   // last 20
    wrong_questions: [{ id, question_content, correct_answer,
                        user_answer, unit_name, level_name }]  // last 20
}
```

### 4. Level analytics

```
GET /api/admin/analytics/levels
Response: [{
    unit_name, level_name,
    total_attempts,
    correct_rate,        // percentage
    avg_time_spent,      // seconds
    student_count,       // distinct users who attempted
}]
```

### 5. Wrong question stats

```
GET /api/admin/analytics/wrong-questions?limit=50
Response: [{
    question_id, question_content, question_type,
    wrong_count,          // total wrong answers
    wrong_rate,           // wrong / total attempts %
    correct_answer,
    unit_name, level_name,
}]
```

## Frontend Layout

### Shell
- Left sidebar navigation (fixed, ~200px wide) with 5 nav items
- Right content area (scrollable) that switches based on active nav
- Login state: if no valid admin token, right area shows login form instead

### Navigation Items
1. Dashboard
2. Students
3. Level Analytics
4. Wrong Questions
5. Import Questions — existing functionality moved here

### Dashboard Page
- 4 summary cards in a row: Student Count, Total Answers, Avg Accuracy, Active Today
- 2 charts side by side: 7-day answer trend (line), per-unit accuracy (bar)
- Charts rendered with local `chart.umd.js`

### Students Page
- Search input to filter by nickname
- Table: Nickname, Total Score, Accuracy, Completed Levels, Last Active
- Column headers are clickable to sort by that column
- Bottom pagination bar (page N/M, prev/next buttons)
- Click a row to navigate to student detail sub-view

### Student Detail (sub-view)
- Back button to return to student list
- Top: user info + summary stats cards
- Middle: per-unit/level progress bars
- Bottom: tab switcher between recent answer log and wrong questions list

### Level Analytics Page
- Table: Unit, Level, Participants, Correct Rate (color bar), Avg Time
- Sorted by correct rate ascending (hardest levels first)

### Wrong Questions Page
- Table: Question content, Level, Wrong Count, Wrong Rate
- Sorted by wrong count descending
- Click row to expand: show correct answer + knowledge points

## Data Flow

1. Admin navigates to `/admin` → FastAPI serves `dev/admin/index.html` via explicit route
2. Admin JS checks localStorage for JWT; if missing/expired, shows login form
3. Login via POST `/api/auth/login`; on success, verify `role == "admin"`
4. Admin JS stores JWT token, attaches `Authorization: Bearer` to all requests
5. Admin JS fetches data from `/api/admin/*` endpoints
6. Backend queries SQLite, computes aggregations in `stats_service.py`
7. Frontend renders tables and charts with local Chart.js

## Security

- All `/api/admin/*` endpoints guarded by `get_admin_user` dependency
- Frontend checks JWT `role` field on login, rejects non-admin users
- No new database tables needed — all queries are read-only analytics on existing data

## Non-Goals

- No new database tables
- No new Python dependencies
- No real-time updates (manual refresh only)
- No export-to-CSV (can be added later)
- No class/group management (single class, all users)

## Testing

- pytest for new admin API endpoints
- Test data seeded via existing `seed_data.py`
