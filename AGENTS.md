# Project Knowledge

## Architecture

- **Backend**: FastAPI + SQLAlchemy + SQLite (`app.db`), JWT auth with user/admin roles
- **Frontend**: Vanilla HTML/CSS/JS SPA, served as static files from `dev/`
- **Packaging**: PyInstaller single-directory mode, spec at `pyinstaller.spec`, bundles entire `dev/` as data
- **Dev run**: `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000`
- **Tests**: pytest via `server/tests/conftest.py`, uses `test.db` (SQLite), TestClient with dependency override

## Key Files

```
server/main.py              # FastAPI app, lifespan, StaticFiles mount at /
server/database.py          # SQLAlchemy engine + SessionLocal
server/dependencies.py      # get_current_user, get_admin_user
server/auth.py              # JWT + bcrypt
server/routers/__init__.py  # All router instances defined here
server/routers/admin.py     # Admin APIs (dashboard, CRUD, analytics)
server/routers/import_questions.py  # POST /api/admin/import
server/schemas/__init__.py  # Import all schemas, register in __all__
server/services/            # Business logic layer (stats_service, achievement_service)
dev/admin/                  # Teacher admin panel (separate from game UI)
dev/admin/lib/chart.umd.js  # Chart.js v4.4.0 bundled for offline use
```

## Important Patterns

### Admin auth
All admin endpoints use `_: User = Depends(get_admin_user)` — the underscore means the user is verified but the value is unused. Returns 403 if role != "admin".

### Response models
Use Pydantic `response_model=` on every endpoint. Schemas go in `server/schemas/`, registered in `__init__.py`.

### Static file routing
`StaticFiles(directory="dev", html=True)` mounted at `/` serves the game. Accessing a subdirectory without trailing slash gets a 307 redirect — this is Starlette default behavior, not a bug. Added an explicit `@app.get("/admin")` route but StaticFiles catches it first; the 307 → `/admin/` → 200 flow works correctly.

### Database
- SQLite with `check_same_thread=False` needed for FastAPI's threaded access
- Seed via `python -m server.seed_data --force`
- Admin user must be created manually (not seeded): insert into `users` with `role="admin"` and bcrypt hash
- `app.db` is gitignored? Actually no — be careful not to commit user data

### Offline deployment
- No CDN dependencies — Chart.js is checked into `dev/admin/lib/`
- PyInstaller bundles the entire `dev/` tree automatically via `datas=[('dev', 'dev')]`
- New frontend files placed under `dev/` are auto-included in the build

### Test patterns
- `conftest.py` sets `DATABASE_URL=sqlite:///./test.db`, overrides `get_db`
- `autouse clean_db` fixture drops/creates tables between tests
- `auth_headers` fixture registers a normal user, `admin_headers` creates admin directly
- Tests use `from server.tests.conftest import client` for the TestClient instance
- Run: `$env:PYTHONPATH = "."; pytest server/tests/ -v` from project root

### Frontend admin panel
- Standalone SPA at `dev/admin/`, NOT part of the game's `dev/game/` system
- Uses its own token keys (`admin_jwt_token`) in localStorage, but falls back to shared `jwt_token` for compatibility
- Login validates `role === "admin"` before granting access
- All API calls go through `fetchAdmin()` which handles 401 by showing login form
