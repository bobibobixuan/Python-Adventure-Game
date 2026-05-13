import asyncio
import json
import time
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect

from server.auth import decode_token
from server.database import SessionLocal
from server.models.user import User


class ConnectionManager:
    def __init__(self):
        # user_id -> list of (websocket, last_heartbeat)
        self.student_connections: dict[int, list[tuple[WebSocket, float]]] = {}
        self.admin_connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect_student(self, ws: WebSocket, user_id: int):
        await ws.accept()
        async with self._lock:
            if user_id not in self.student_connections:
                self.student_connections[user_id] = []
            self.student_connections[user_id].append((ws, time.time()))
        await self._broadcast_status()

    async def heartbeat(self, user_id: int):
        async with self._lock:
            if user_id in self.student_connections:
                conns = self.student_connections[user_id]
                now = time.time()
                self.student_connections[user_id] = [(ws, now) for ws, _ in conns]

    async def disconnect_student(self, ws: WebSocket, user_id: int):
        async with self._lock:
            if user_id in self.student_connections:
                self.student_connections[user_id] = [
                    (w, h) for w, h in self.student_connections[user_id] if w != ws
                ]
                if not self.student_connections[user_id]:
                    del self.student_connections[user_id]
        await self._broadcast_status()

    async def connect_admin(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.admin_connections.add(ws)
        await self._broadcast_status()

    async def disconnect_admin(self, ws: WebSocket):
        async with self._lock:
            self.admin_connections.discard(ws)

    async def _broadcast_status(self):
        async with self._lock:
            online_user_ids = set(self.student_connections.keys())

        db = SessionLocal()
        try:
            all_users = db.query(User).filter(User.role == "user").all()
            total_count = len(all_users)
            online_users = [{"id": u.id, "nickname": u.nickname}
                            for u in all_users if u.id in online_user_ids]
            offline_users = [{"id": u.id, "nickname": u.nickname}
                             for u in all_users if u.id not in online_user_ids]
        finally:
            db.close()

        dead_admins = set()
        for admin_ws in list(self.admin_connections):
            try:
                await admin_ws.send_json({
                    "type": "online_status",
                    "online_count": len(online_user_ids),
                    "total_count": total_count,
                    "online_users": online_users,
                    "offline_users": offline_users,
                })
            except Exception:
                dead_admins.add(admin_ws)

        for dead in dead_admins:
            async with self._lock:
                self.admin_connections.discard(dead)

    async def check_stale_connections(self, timeout: float = 60):
        while True:
            await asyncio.sleep(15)
            async with self._lock:
                now = time.time()
                stale = []
                for uid, conns in list(self.student_connections.items()):
                    alive = [(ws, h) for ws, h in conns if now - h < timeout]
                    dead = [ws for ws, h in conns if now - h >= timeout]
                    if alive:
                        self.student_connections[uid] = alive
                    else:
                        stale.append(uid)
                        del self.student_connections[uid]
                    for ws in dead:
                        try:
                            await ws.close()
                        except Exception:
                            pass

            if stale:
                await self._broadcast_status()


manager = ConnectionManager()


async def online_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for online status tracking."""
    user_id: Optional[int] = None
    is_admin: bool = False
    authenticated: bool = False
    auth_deadline = time.time() + 5

    try:
        while time.time() < auth_deadline and not authenticated:
            try:
                raw = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=auth_deadline - time.time()
                )
            except asyncio.TimeoutError:
                await websocket.close(code=4001, reason="auth timeout")
                return

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.close(code=4002, reason="invalid json")
                return

            if msg.get("type") != "auth" or not msg.get("token"):
                await websocket.close(code=4003, reason="auth required")
                return

            payload = decode_token(msg["token"])
            if payload is None or payload.get("type") != "access":
                await websocket.close(code=4004, reason="invalid token")
                return

            uid_str = payload.get("sub")
            if uid_str is None:
                await websocket.close(code=4004, reason="invalid token")
                return

            try:
                user_id = int(uid_str)
            except (ValueError, TypeError):
                await websocket.close(code=4004, reason="invalid token")
                return

            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == user_id).first()
                if user is None:
                    await websocket.close(code=4004, reason="user not found")
                    return
                is_admin = user.role == "admin"
            finally:
                db.close()

            authenticated = True

        if is_admin:
            await manager.connect_admin(websocket)
            try:
                while True:
                    await websocket.receive_text()
            except WebSocketDisconnect:
                await manager.disconnect_admin(websocket)
        else:
            await manager.connect_student(websocket, user_id)
            try:
                while True:
                    raw = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=35
                    )
                    try:
                        msg = json.loads(raw)
                        if msg.get("type") == "heartbeat":
                            await manager.heartbeat(user_id)
                    except json.JSONDecodeError:
                        pass
            except (WebSocketDisconnect, asyncio.TimeoutError):
                await manager.disconnect_student(websocket, user_id)
    except WebSocketDisconnect:
        if user_id is not None:
            if is_admin:
                await manager.disconnect_admin(websocket)
            else:
                await manager.disconnect_student(websocket, user_id)
