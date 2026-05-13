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

### README style
Bilingual `README.md` (English) + `README.zh-CN.md` (Chinese), cross-linked. Structure: badges → features → quick start → tech stack table → project tree → API reference table → config table → deployment → contributing → license. No screenshots. Professional tone, oriented toward technical users scanning for integration details.

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
- `*.db`, `*.db-shm`, `*.db-wal` are gitignored — SQLite WAL files must be gitignored or they leak local state. `app.db` itself is also gitignored; production database should never be committed

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

### WebSocket online status
- Endpoint: free function `online_websocket_endpoint` registered via `app.add_api_websocket_route("/ws/online", ...)` — NOT an APIRouter
- Auth: client sends `{"type":"auth","token":"..."}` as first WebSocket message (never URL param — avoids token in server logs)
- ConnectionManager: in-memory `dict[user_id, list[(ws, heartbeat)]]` + `set[admin_ws]` guarded by `asyncio.Lock()`
- Student role: sends `{"type":"heartbeat"}` every 30s, server timeouts at 60s stale check every 15s
- Admin role: silent receive loop, server pushes `{"type":"online_status", online_count, total_count, online_users, offline_users}` on every state change
- Background cleanup: `asyncio.create_task(manager.check_stale_connections())` in `lifespan`, cancel + `CancelledError` suppression on shutdown
- Multi-tab: same user_id can have multiple WebSocket connections, user is online as long as ANY connection is alive

### Achievement toast system
- Toasts are dynamically created DOM elements (`document.createElement('div')`), appended to `document.body`, removed after dismiss animation
- Hardcoded `<div id="achievementPopup">` in HTML is REMOVED — old `getElementById` references replaced with dynamic creation
- Stacking: max 3 simultaneous toasts, offset by 102px vertically, `repositionRemainingToasts()` on dismiss
- CSS: `bottom:24px; right:24px; z-index:9999`, entrance from `translateY(20px) translateX(40px)`, exit to `translateY(12px)`

## Lessons Learned

### Subagent file encoding
**Subagents can corrupt UTF-8 files** when writing files with Chinese/emoji content. Always verify file encoding after a subagent touches HTML/CSS/JS with non-ASCII characters. Check for BOM prefix (﻿) and mojibake patterns. Fix: `git checkout <pre-corruption-commit> -- <file>`, re-apply changes manually.

### asyncio.Lock is NOT reentrant
Never call a method that acquires `self._lock` from within the same `async with self._lock:` block. In `check_stale_connections`, the `if stale: await self._broadcast_status()` call must be OUTSIDE the lock — otherwise deadlock. Pattern: hold lock only for brief state mutations, release before any await that might re-acquire.

### WebSocket accept() order
Starlette 0.41+ requires `await websocket.accept()` before any `receive_text()` call. Put `accept()` at the top of the endpoint, not buried in ConnectionManager methods — those are called after auth, but `receive_text()` happens during auth.

### Exponential backoff must not reset on every connect
The retry counter (`reconnectAttempt`) must only be reset in `onopen` (success) and `disconnect()` (intentional). Resetting it at the top of `connect()` means every retry is "attempt 0" and backoff never escalates.

### WebSocket reconnection: clean up old state
Before creating a new WebSocket in `doConnect()`: (1) clear any pending reconnect timer, (2) null the old `ws.onclose` to prevent stale reconnection triggers, (3) close the old socket. Without this, orphaned websockets accumulate and duplicate connections spawn on reconnect.

### Inline styles belong in CSS
When adding new UI elements, put styles in CSS (`.online-status-card .card-value { color: #27ae60; }`) rather than inline (`style="color:#27ae60"`). Avoids duplication, keeps HTML clean.

### LocalStorage cache leak on account switch
When the same machine is shared by multiple users, `localStorage` game state persists across logout/login. If logout only clears JWT tokens but not game data (`STORAGE_KEY`), the next user who logs in will inherit the previous user's progress. The `onAuthSuccess` -> `syncGameStateToServer` push-on-login pattern then uploads the stale data to the wrong account.

Fix: (1) Clear `localStorage.removeItem(STORAGE_KEY)` on logout, reset `gameState` to default. (2) On login, pull server progress first (`GET /api/scores/progress` + `GET /api/records/summary` + `GET /api/achievements/`), only push local if server is empty. Server is the source of truth when logged in.

### Pull-then-push login pattern
Login flow: fetch progress + summary + achievements in parallel; if server has data (total_questions > 0 or total_score > 0 or total_stars > 0), overwrite local gameState entirely; if server is empty, start with `createDefaultGameState()` and save. This prevents cross-account data leaks while allowing returning users to restore progress on any machine.

### WebSocket testing
Use `httpx-ws` + `ASGIWebSocketTransport` (not `ASGITransport` — can't handle WebSocket upgrades). Signature: `aconnect_ws(url, client)`. Use `seed_users` fixture pattern to create test users rather than relying on existing DB state. Tests that sleep (auth timeout test at 6s) are slow but unavoidable for timeout-path verification.
