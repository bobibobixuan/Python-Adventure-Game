import sys
import socket
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server.database import engine, Base
from server.routers import (
    auth_router, units_router, questions_router, records_router,
    scores_router, achievements_router, leaderboard_router, admin_router,
)


def _get_static_dir() -> Path:
    if getattr(sys, 'frozen', False):
        return Path(sys._MEIPASS) / "dev"
    return Path(__file__).resolve().parent.parent / "dev"


def _get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Python Adventure Game API", version="1.0.0", lifespan=lifespan)

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

static_dir = _get_static_dir()
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    import webbrowser

    host = "0.0.0.0"
    port = 80
    local_ip = _get_local_ip()

    print(f"========================================")
    print(f"  Python Adventure Game Server")
    print(f"  本机访问: http://localhost")
    print(f"  局域网访问: http://{local_ip}")
    print(f"========================================")

    webbrowser.open(f"http://localhost")

    uvicorn.run(app, host=host, port=port)
