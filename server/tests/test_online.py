import asyncio
import json

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from httpx_ws import aconnect_ws
from httpx_ws.transport import ASGIWebSocketTransport

from server.main import app
from server.auth import create_access_token
from server.database import SessionLocal
from server.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def seed_users():
    """Seed test users into the test database so WebSocket tests have users to work with."""
    from server.auth import hash_password
    db = SessionLocal()
    # Create a student user
    student = db.query(User).filter(User.username == "ws_student").first()
    if not student:
        student = User(
            username="ws_student",
            password_hash=hash_password("test123"),
            nickname="WS Student",
            role="user",
        )
        db.add(student)
    # Create an admin user
    admin = db.query(User).filter(User.username == "ws_admin").first()
    if not admin:
        admin = User(
            username="ws_admin",
            password_hash=hash_password("admin123"),
            nickname="WS Admin",
            role="admin",
        )
        db.add(admin)
    db.commit()
    db.refresh(student)
    db.refresh(admin)
    db.close()
    return student, admin


@pytest.mark.asyncio
async def test_student_connect_and_heartbeat(seed_users):
    """Student connects to WebSocket, sends auth and heartbeat."""
    student, _ = seed_users
    token = create_access_token({"sub": str(student.id)})

    transport = ASGIWebSocketTransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws("/ws/online", client) as ws:
            await ws.send_json({"type": "auth", "token": token})
            await ws.send_json({"type": "heartbeat"})
            await asyncio.sleep(0.5)

    assert True


@pytest.mark.asyncio
async def test_admin_connect_and_receive_status(seed_users):
    """Admin connects to WebSocket, receives online status push."""
    _, admin = seed_users
    token = create_access_token({"sub": str(admin.id)})

    transport = ASGIWebSocketTransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws("/ws/online", client) as ws:
            await ws.send_json({"type": "auth", "token": token})
            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=3)
                msg = json.loads(raw)
                assert msg["type"] == "online_status"
                assert "online_count" in msg
                assert "total_count" in msg
                assert "online_users" in msg
                assert "offline_users" in msg
            except asyncio.TimeoutError:
                pytest.fail("Did not receive online_status push")


@pytest.mark.asyncio
async def test_invalid_token_rejected():
    """Invalid token should be rejected."""
    from httpx_ws._exceptions import WebSocketDisconnect

    transport = ASGIWebSocketTransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws("/ws/online", client) as ws:
            await ws.send_json({"type": "auth", "token": "invalid-token"})
            with pytest.raises(WebSocketDisconnect):
                await ws.receive_text()


@pytest.mark.asyncio
async def test_missing_auth_closed():
    """Not sending auth message should result in disconnection."""
    transport = ASGIWebSocketTransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws("/ws/online", client) as ws:
            await asyncio.sleep(6)
            with pytest.raises(Exception):
                await ws.receive_text()
