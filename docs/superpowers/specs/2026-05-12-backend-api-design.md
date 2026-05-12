# Backend API Design

## Overview

Add a FastAPI + PostgreSQL backend to the existing Python-Adventure-Game frontend. The backend serves as the data authority for question bank, user authentication, answer records, scores, achievements, and leaderboard. The frontend retains localStorage as offline fallback and fast-first-load cache.

## Tech Stack

- **Backend**: Python 3.11+ FastAPI
- **Database**: PostgreSQL 15
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Deployment**: Docker Compose (prod) + local venv scripts (dev)
- **Migration**: Alembic

## Architecture

```
Frontend (existing HTML/CSS/JS SPA)
  └── dev/game/40_api.js  (new: API request layer)
       │
       ▼  HTTP REST + JWT Bearer
Backend (FastAPI)
  ├── routers/     (API endpoints)
  ├── services/    (business logic)
  ├── models/      (SQLAlchemy ORM)
  └── schemas/     (Pydantic validation)
       │
       ▼  SQLAlchemy
PostgreSQL
```

Frontend gracefully degrades: if API is unreachable, falls back to localStorage (existing behavior).

## Data Model (Core Tables)

### users
- id (PK, auto)
- username (unique, indexed)
- password_hash
- nickname
- role: 'user' | 'admin' (default 'user')
- created_at, updated_at

### units
- id (PK, auto)
- name, icon, description, sort_order
- is_active (default true)

### levels
- id (PK, auto)
- unit_id (FK -> units)
- name, icon, bg, sort_order
- is_active (default true)

### questions
- id (PK, auto)
- level_id (FK -> levels)
- type: '选择题' | '判断题' | '填空题'
- content (HTML/text)
- options (JSONB, nullable for fill-in-blank)
- answer
- knowledge_meaning, knowledge_rule, knowledge_error, knowledge_example
- sort_order, is_active (default true)

### answer_records
- id (PK, auto)
- user_id (FK -> users, indexed)
- question_id (FK -> questions)
- user_answer
- is_correct (boolean)
- time_spent (seconds, float)
- mode: 'adventure' | 'extreme' | 'practice'
- created_at

### level_progress
- id (PK, auto)
- user_id (FK -> users, indexed)
- level_id (FK -> levels)
- stars (0-3, default 0)
- unlocked (boolean, default true for first level of each unit)
- updated_at
- Unique constraint: (user_id, level_id)

### achievements (reference table)
- id (PK, auto)
- name, icon, description, hint
- rarity: 'common' | 'rare' | 'epic' | 'legendary'
- category
- condition_type, condition_value

### user_achievements
- id (PK, auto)
- user_id (FK -> users)
- achievement_id (FK -> achievements)
- unlocked_at
- Unique constraint: (user_id, achievement_id)

### user_stats (materialized summary, refreshed on each answer)
- id (PK, auto)
- user_id (FK -> users, unique)
- total_questions, total_correct
- total_score, max_combo
- practice_count, extreme_passes, extreme_dual_passes
- updated_at

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | No | Register (username + password + nickname) |
| POST | /login | No | Login, returns access_token + refresh_token |
| POST | /refresh | No | Refresh access token |

### Units & Levels (`/api/units`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | List all active units |
| GET | /{unit_id}/levels | Yes | List levels for a unit |

### Questions (`/api/questions`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /levels/{level_id} | Yes | Get questions for a level |

### Answer Records (`/api/records`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /answer | Yes | Submit one answer |
| GET | /summary | Yes | User's overall stats + progress |
| GET | /wrong | Yes | Wrong questions list by unit |

### Scores & Progress (`/api/scores`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /progress | Yes | All units/levels progress with stars |
| GET | /level/{level_id} | Yes | Single level detail |

### Achievements (`/api/achievements`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | All achievements with user unlock status |
| POST | /check | Yes | Trigger achievement check (also auto-checked on answer submit) |

### Leaderboard (`/api/leaderboard`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | Top 50 by score, with pagination |

### Admin (`/api/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /questions | Admin | Create question |
| PUT | /questions/{id} | Admin | Update question |
| DELETE | /questions/{id} | Admin | Soft-delete question |
| GET | /users | Admin | List users with stats |
| GET | /dashboard | Admin | System stats overview |

## Frontend-Backend Integration

New file: `dev/game/40_api.js`
- Wraps all fetch() calls with JWT token management
- Auto-refreshes token on 401
- Falls back to localStorage when API unreachable
- Syncs local progress to backend on connection

Modify `dev/game/10_state.js`:
- `saveGameState()` additionally syncs to backend
- `loadGameState()` fetches from backend first, falls back to localStorage

## Seed Data

Existing questions from `dev/data/*.js` files will be migrated to PostgreSQL via a seed script (`server/seed_data.py`). The script reads the JS question files and inserts them as database rows.

## Project Structure

```
server/
├── main.py              # FastAPI app entry point
├── config.py            # Settings (DB URL, JWT secret, etc.)
├── database.py          # SQLAlchemy engine + session setup
├── auth.py              # JWT encode/decode, password hashing
├── dependencies.py      # FastAPI dependency injection (get_db, get_current_user)
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── unit.py
│   ├── question.py
│   └── record.py
├── schemas/
│   ├── __init__.py
│   ├── auth.py
│   ├── question.py
│   └── record.py
├── routers/
│   ├── __init__.py
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
│   ├── question_service.py
│   ├── record_service.py
│   ├── achievement_service.py
│   └── stats_service.py
├── seed_data.py
├── seed/
│   ├── units_and_levels.py
│   └── questions.py
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_questions.py
    └── test_records.py
```

## Error Handling

- All API errors return JSON: `{"detail": "message", "code": "ERROR_CODE"}`
- 401 for unauthenticated, 403 for forbidden, 404 for not found, 422 for validation errors
- Frontend API layer handles network errors gracefully (offline fallback)

## Testing

- pytest for backend unit/integration tests
- Test database via Docker or SQLite for CI
- Auth flow, CRUD operations, achievement logic, seed data integrity
