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


def _get_local_ip() -> tuple[str, bool]:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0], True
    except Exception:
        return "127.0.0.1", False


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
    preferred_port = 80
    fallback_port = 8000
    local_ip, ip_ok = _get_local_ip()

    def _print_banner(p: int):
        def _url(h: str) -> str:
            return f"http://{h}" + (f":{p}" if p != 80 else "")

        print("========================================")
        print("  Python Adventure Game Server")
        print(f"  本机访问: {_url('localhost')}")
        if ip_ok:
            print(f"  局域网访问: {_url(local_ip)}")
        else:
            print("  (无法检测局域网IP，请手动查看本机IP)")
        print("========================================")

    @app.on_event("startup")
    def _open_browser():
        import webbrowser
        webbrowser.open(_url_text)

    port = preferred_port
    _url_text = f"http://localhost" + (f":{port}" if port != 80 else "")
    _print_banner(port)

    try:
        uvicorn.run(app, host=host, port=port)
    except (PermissionError, OSError):
        port = fallback_port
        _url_text = f"http://localhost:{port}"
        print(f"\n  !! 端口 {preferred_port} 需要管理员权限，已切换到端口 {port}\n")
        _print_banner(port)
        uvicorn.run(app, host=host, port=port)
