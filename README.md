<p align="center">
  <h1 align="center">🐍 Python Adventure Game</h1>
  <p align="center">
    <strong>LAN-first interactive Python learning platform</strong> — zero-config classroom server with gamified coding curriculum, teacher dashboard, and real-time progress tracking.
  </p>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/status-active-success" alt="Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Educational-blue" alt="License"></a>
  <a href="#quick-start"><img src="https://img.shields.io/badge/python-3.8+-blue" alt="Python"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/backend-FastAPI-009688" alt="FastAPI"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/frontend-vanilla_JS-F7DF1E?logo=javascript" alt="Vanilla JS"></a>
</p>

English | [简体中文](https://github.com/bobibobixuan/Python-Adventure-Game/blob/main/README.zh-CN.md)

---

## ✨ Features

- **Gamified learning path** — 3 units, 18 levels with star ratings, combo streaks, scoring, health points, and countdown timers
- **Multiple game modes** — guided learning with pre-question hints, practice arena with random drills, survival gauntlet with no second chances, and cross-unit combined challenges
- **Real-time teacher dashboard** — live online status via WebSocket heartbeat, student activity feed, quiz statistics, and achievement tracking
- **Achievement system** — 14 unlockable badges spanning accuracy, speed, streak, and completion milestones, with stacked toast notifications
- **Wrong-answer analytics** — per-question mistake history with knowledge-point diagnosis and beginner-friendly step-by-step explanations
- **Progress persistence** — server-side state sync with automatic restore after logout/relogin, cross-device profile recovery, and localStorage fault tolerance
- **Zero-config LAN deployment** — single-command startup, auto-detected LAN IP, no external services or containers required
- **Offline-first architecture** — vanilla HTML/CSS/JS frontend with no npm dependencies; browser-native ES modules and localStorage
- **Role-based access control** — student, admin, and super_admin roles with scoped API permissions and JWT authentication

## 🚀 Quick Start

### Requirements

- Python `>= 3.8`
- Windows is the primary maintained environment (Linux/macOS compatible)

### One-command startup

```bash
# Clone and enter the project
git clone https://github.com/bobibobixuan/Python-Adventure-Game.git
cd Python-Adventure-Game

# Create virtual environment and install dependencies
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux

pip install -r requirements.txt

# Start the server
python -m server.main
```

The server auto-detects your LAN IP and prints the access URLs:

```
========================================
  Python Adventure Game Server
  本机访问: http://localhost
  局域网访问: http://192.168.x.x
========================================
```

Open the URL in a browser — students join via LAN, the teacher accesses `/admin` for the dashboard.

### Default accounts

| Role | Username | Password |
|---|---|---|
| Student | (register via UI) | — |
| Admin | `admin` | `admin123` |

## 📦 Packaging

### Build standalone executable (Windows)

```bash
pip install pyinstaller
pyinstaller --clean pyinstaller.spec
```

The packaged binary includes the Python runtime, all dependencies, and static assets — no Python installation needed on the target machine.

### Build frontend-only single-file release

```bash
python build.py
```

Generates `dist/Python基础闯关_正式版.html` — a self-contained HTML file that runs entirely in-browser with localStorage, no server required.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES modules) |
| Backend API | FastAPI, Uvicorn |
| Database | SQLite (SQLAlchemy ORM) |
| Authentication | JWT (python-jose) with bcrypt password hashing |
| Realtime | WebSocket (native `ws://`) with exponential-backoff reconnection |
| Admin UI | Vanilla JS SPA with Chart.js analytics |
| Packaging | PyInstaller (portable .exe) + custom build pipeline |

## 📁 Project Structure

```
Python-Adventure-Game/
├─ dev/                        # Frontend source
│  ├─ index.html               # Single-page game shell
│  ├─ style.css                # Styles, animations, responsive layout
│  ├─ data/                    # Game content (units, questions, achievements)
│  │  ├─ 00_units.js           # Unit definitions and level config
│  │  ├─ 10_unit1_questions.js # Unit 1: Operators
│  │  ├─ 11_unit2_questions.js # Unit 2: If Statements
│  │  ├─ 20_unit_maps.js       # Level-to-question mapping
│  │  └─ 30_achievements.js    # Achievement definitions
│  ├─ game/                    # Game engine
│  │  ├─ 00_core.js            # Utility functions and constants
│  │  ├─ 10_state.js           # Game state and localStorage persistence
│  │  ├─ 20_app.js             # Main game flow and UI rendering
│  │  ├─ 30_devtools.js        # Developer console for debugging
│  │  ├─ 40_api.js             # Backend API client
│  │  └─ 50_admin.js           # Admin dashboard client
│  └─ admin/                   # Teacher admin SPA
│     ├─ index.html            # Admin panel shell
│     ├─ admin.js              # Admin logic and WebSocket client
│     ├─ admin.css             # Admin styles
│     └─ lib/chart.umd.js      # Chart.js for analytics
├─ server/                     # Backend (FastAPI)
│  ├─ main.py                  # App entry point, lifespan, static mounting
│  ├─ config.py                # Environment-based configuration
│  ├─ database.py              # SQLAlchemy engine and session factory
│  ├─ auth.py                  # JWT creation, verification, password hashing
│  ├─ dependencies.py          # FastAPI dependency injection (get_current_user, etc.)
│  ├─ models/                  # SQLAlchemy ORM models
│  │  ├─ user.py               # User, AdminAction
│  │  ├─ question.py           # Question, Unit, Level
│  │  ├─ record.py             # AnswerRecord, UserStats
│  │  └─ achievement.py        # Achievement, UserAchievement
│  ├─ schemas/                 # Pydantic request/response schemas
│  ├─ routers/                 # API route handlers
│  │  ├─ auth.py               # POST /api/auth/register, /login
│  │  ├─ units.py              # GET /api/units
│  │  ├─ questions.py          # GET /api/questions
│  │  ├─ records.py            # POST /api/records, /sync-state
│  │  ├─ scores.py             # GET /api/scores
│  │  ├─ achievements.py       # GET /api/achievements, POST /sync
│  │  ├─ leaderboard.py        # GET /api/leaderboard
│  │  ├─ admin.py              # GET /api/admin/*
│  │  ├─ online.py             # WebSocket /ws/online
│  │  └─ import_questions.py   # POST /api/import/questions
│  ├─ services/                # Business logic layer
│  │  ├─ achievement_service.py
│  │  └─ stats_service.py
│  ├─ seed/                    # Database seeding and question extraction
│  └─ tests/                   # pytest test suite
├─ tools/
│  └─ validate_data.py         # Question bank integrity checker
├─ build.py                    # Frontend single-file build pipeline
├─ build.bat                   # Windows build helper
├─ pyinstaller.spec            # PyInstaller packaging config
├─ requirements.txt            # Python dependencies
├─ CHANGELOG.md                # Release notes
└─ 更新日志/                    # Detailed changelogs (Chinese)
```

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Login, returns JWT token |
| `GET` | `/api/auth/me` | Get current user profile |

### Game Content

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/units` | List all learning units with level metadata |
| `GET` | `/api/questions?unit_id=&level=` | Get questions for a specific level |
| `GET` | `/api/achievements` | List all achievable badges |

### Progress & Records

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/records/submit` | Submit an answer for grading |
| `POST` | `/api/records/sync-state` | Push/pull full game progress (stars, unlocks, stats) |
| `GET` | `/api/records/mistakes` | Retrieve wrong-answer history |
| `POST` | `/api/achievements/sync` | Sync earned achievements to server |

### Leaderboard & Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leaderboard` | Global score leaderboard |
| `GET` | `/api/admin/dashboard` | Dashboard overview (student count, answer stats) |
| `GET` | `/api/admin/students` | Student list with progress and online status |
| `GET` | `/api/admin/actions` | Admin audit log |

### Realtime

| Protocol | Endpoint | Description |
|---|---|---|
| `WS` | `/ws/online` | WebSocket heartbeat — student online presence, admin live updates |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |

## 🔧 Configuration

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | auto-generated | JWT signing secret |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy database URL |
| `ADMIN_USERNAME` | `admin` | Default admin account name |
| `ADMIN_PASSWORD` | `admin123` | Default admin account password |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token lifetime (24h default) |

### Default ports

- Main server: `80` (falls back to `8000` if permission denied)
- WebSocket: same port, path `/ws/online`

### Access control

Roles: `student`, `admin`, `super_admin`

Admin scopes: user lifecycle management, question bank import, audit log review, dashboard analytics

## 🌐 Deployment

The recommended deployment runs the server on a classroom LAN host. Students connect via browser — no client installation required.

Key operational notes:

- Start the server with `python -m server.main` — it auto-detects the LAN IP and prints access URLs
- The admin dashboard is at `/admin` route (same host); first-launch creates the default admin account
- Database file (`app.db`) is auto-created on first startup with all tables; WAL mode is enabled for concurrent read/write
- Frontend assets in `dev/` are served directly by FastAPI's `StaticFiles` mount in development
- For production packaging, use `pyinstaller --clean pyinstaller.spec` to produce a standalone `.exe`
- The single-file HTML build (`python build.py`) is a serverless fallback — it inlines all CSS/JS into one portable page
- Backups should cover `app.db` (user data), not the `dev/` directory (static content)

## 🤝 Contributing

Internal project workflow — not open to public PRs at this time. Team contributors should:

1. Create a focused branch from `main`
2. Keep changes minimal and reviewable
3. Run `python tools/validate_data.py` before committing question bank changes
4. Run `python -m pytest server/tests/` to verify backend integrity
5. Update `CHANGELOG.md` and `更新日志/` when user-facing behavior changes
6. Write durable lessons back into `AGENTS.md` when they help future work

## 📄 License

Internal educational use only. See [LICENSE](LICENSE) for details.
