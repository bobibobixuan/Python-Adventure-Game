# Teacher Admin Panel Design

## Overview

Add a teacher-facing admin panel to the existing Python-Adventure-Game backend. Teachers can view student quiz data, grade statistics, level analytics, and frequently-wrong questions. The panel is a standalone vanilla HTML/CSS/JS page served at `/admin`, protected by the existing admin role check.

## Tech Stack

- **Backend**: Python FastAPI (existing), no new dependencies
- **Frontend**: Vanilla HTML/CSS/JS + Chart.js CDN
- **Auth**: Existing JWT + admin role check (`get_admin_user`)

## Architecture

```
dev/admin/
├── index.html          # Admin panel main page
├── admin.css            # Admin panel styles
└── admin.js             # Admin panel logic + charts

Server additions:
server/routers/admin.py        # Extend with student data + analytics APIs
server/schemas/admin.py        # New: admin-specific Pydantic schemas
server/services/stats_service.py  # New: statistics computation service

Routing:
/           → dev/index.html         (game frontend)
/admin      → dev/admin/index.html   (admin panel)
/api/admin/* → admin_router           (admin API)
```

- Frontend is a standalone SPA-style page, no framework
- Charts use Chart.js loaded from CDN
- All admin APIs require `get_admin_user` dependency

## API Design

All endpoints under `/api/admin`, require admin role.

### 1. Dashboard (enhance existing)

```
GET /api/admin/dashboard
Response: {
    user_count,             // existing
    question_count,         // existing
    answer_count,           // existing
    avg_accuracy,           // new: overall average accuracy %
    avg_score,              // new: overall average score
    active_today,           // new: users who answered today
    daily_trend: [{date, count}],  // new: last 7 days answer counts
    unit_accuracy: [{unit_name, accuracy}]  // new: per-unit average accuracy
}
```

### 2. Student list

```
GET /api/admin/students?sort_by=total_score&order=desc&search=
Response: [{
    user_id, username, nickname,
    total_score, accuracy, total_questions,
    completed_levels, total_stars,
    practice_count,
    last_active          // most recent answer timestamp
}]
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

### Navigation Items
1. Dashboard (📊)
2. Students (👥)
3. Level Analytics (📈)
4. Wrong Questions (❌)
5. Import Questions (⬆️) — existing functionality moved here

### Dashboard Page
- 4 summary cards in a row: Student Count, Total Answers, Avg Accuracy, Active Today
- 2 charts side by side: 7-day answer trend (line), per-unit accuracy (bar)

### Students Page
- Search input to filter by nickname
- Table: Nickname, Total Score, Accuracy, Completed Levels, Last Active
- Column headers are clickable to sort by that column
- Click a row to expand inline (or navigate to) a student detail panel

### Student Detail (sub-view)
- Top: user info + summary stats cards
- Middle: per-unit/level progress bars
- Bottom: recent answer log table + wrong questions list (tabs)

### Level Analytics Page
- Table: Unit, Level, Participants, Correct Rate (color bar), Avg Time
- Sorted by correct rate ascending (hardest levels first)

### Wrong Questions Page
- Table: Question content, Level, Wrong Count, Wrong Rate
- Sorted by wrong count descending
- Click row to reveal correct answer + knowledge points

## Data Flow

1. Admin navigates to `/admin` → FastAPI serves `dev/admin/index.html`
2. Admin logs in with existing credentials (role=admin)
3. Admin JS stores JWT token, attaches `Authorization: Bearer` to all requests
4. Admin JS fetches data from `/api/admin/*` endpoints
5. Backend queries SQLite, computes aggregations in `stats_service.py`
6. Frontend renders tables and charts

## Security

- All `/api/admin/*` endpoints guarded by `get_admin_user` dependency
- Frontend checks JWT role on load, redirects non-admin users
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
