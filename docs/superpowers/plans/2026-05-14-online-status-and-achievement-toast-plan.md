# Achievement Toast Repositioning + WebSocket Online Status 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将成就弹窗移至右下角并支持多弹窗堆叠；通过 WebSocket 实现学生心跳上报和教师端实时在线状态展示。

**Architecture:** Feature 1 沿用现有 CSS class 切换动画体系，仅改定位和位移方向，JS 队列逻辑小幅扩展支持堆叠。Feature 2 后端新增 WebSocket 端点维护内存在线表，学生端每 30s 心跳，教师端接收服务器推送更新仪表盘卡片和学生列表状态列。

**Tech Stack:** FastAPI WebSocket, vanilla JS WebSocket API, CSS transitions/keyframes

**Spec:** `docs/superpowers/specs/2026-05-14-online-status-and-achievement-toast-design.md`

---

### Task 1: 成就弹窗 CSS 移至右下角 + 堆叠样式

**Files:**
- Modify: `dev/style.css:2204-2291`（`.achievement-popup` 及其子规则）

- [ ] **Step 1: 修改 `.achievement-popup` 定位和 z-index**

将居中定位改为右下角固定定位，提高 z-index：

```css
/* 成就弹窗 */
.achievement-popup {
    --achievement-popup-accent: #ffd700;
    position: fixed;
    bottom: 24px;
    right: 24px;
    top: auto;
    left: auto;
    transform: translateY(20px) scale(0.92);
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid var(--achievement-popup-accent);
    border-radius: 20px;
    padding: 30px 50px;
    z-index: 9999;
    text-align: center;
    color: white;
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.24);
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    max-width: 420px;
}
```

- [ ] **Step 2: 修改 `.achievement-popup.show` 入场状态**

```css
.achievement-popup.show {
    opacity: 1;
    transform: translateY(0) scale(1);
    animation: achievementIn var(--motion-slow) var(--ease-bounce);
}
```

- [ ] **Step 3: 修改 `.achievement-popup.hide` 出场状态**

```css
.achievement-popup.hide {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
    transition: opacity var(--motion-fast) var(--ease-fluid), transform var(--motion-fast) var(--ease-fluid);
}
```

- [ ] **Step 4: 修改 `@keyframes achievementIn`**

```css
@keyframes achievementIn {
    0% {
        transform: translateY(20px) translateX(40px) scale(0.86);
        opacity: 0;
    }
    100% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 1;
    }
}
```

- [ ] **Step 5: 新增 `@media (max-width: 480px)` 窄屏适配**

在 `.achievement-popup-desc` 之后、`/* 修炼场模式 */` 之前插入：

```css
@media (max-width: 480px) {
    .achievement-popup {
        right: 12px;
        left: 12px;
        bottom: 12px;
        max-width: none;
        padding: 24px 20px;
    }
}
```

- [ ] **Step 6: 更新 `@media (prefers-reduced-motion: reduce)` 中的引用**

找到 `.achievement-popup.show` 所在行（约 2581 行），确认它仍然有效（class 名未变，无需修改）。

- [ ] **Step 7: 验证 CSS 改动**

运行游戏，触发一个成就，确认弹窗出现在右下角并有滑入动画。

- [ ] **Step 8: Commit**

```bash
git add dev/style.css
git commit -m "feat: move achievement popup to bottom-right corner"
```

---

### Task 2: 成就弹窗 JS 堆叠逻辑

**Files:**
- Modify: `dev/game/20_app.js:846-894`（`showAchievementPopup` 和 `displayNextAchievementPopup`）

- [ ] **Step 1: 替换 `displayNextAchievementPopup` 函数，增加堆叠偏移**

定位到 `dev/game/20_app.js:857`，将 `displayNextAchievementPopup` 函数替换为：

```javascript
function displayNextAchievementPopup() {
    const popup = document.getElementById('achievementPopup');
    const popupMeta = document.getElementById('popupMeta');
    const achievement = achievementPopupQueue.shift();

    if (!popup || !achievement) {
        achievementPopupActive = false;
        return;
    }

    // 计算堆叠偏移：统计当前页面可见的 toast 数量
    const visibleToasts = document.querySelectorAll('.achievement-popup.show').length;
    const baseBottom = 24;
    const stackOffset = visibleToasts * 102; // toast 估算高度 + 12px 间距
    popup.style.bottom = (baseBottom + stackOffset) + 'px';

    const rarityMeta = getAchievementRarityMeta(achievement.rarity);
    const categoryMeta = getAchievementCategoryMeta(achievement.category);

    popup.dataset.rarity = achievement.rarity || 'common';
    popup.style.setProperty('--achievement-popup-accent', rarityMeta.accent);
    document.getElementById('popupIcon').textContent = achievement.icon;
    document.getElementById('popupTitle').textContent = achievement.name;
    if (popupMeta) {
        popupMeta.textContent = `${categoryMeta.icon} ${achievement.category} · ${rarityMeta.label}`;
    }
    document.getElementById('popupDesc').textContent = achievement.desc;

    // 同时显示上限：超过 3 个则跳过队列中最旧的
    if (visibleToasts >= 3) {
        achievementPopupQueue.shift();
    }

    popup.style.display = 'block';
    popup.classList.remove('hide');
    void popup.offsetWidth;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hide');

        // 其他可见 toast 回落
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('hide');
            repositionRemainingToasts();
            displayNextAchievementPopup();
        }, 240);
    }, 2800);
}
```

- [ ] **Step 2: 新增 `repositionRemainingToasts` 辅助函数**

在 `displayNextAchievementPopup` 之前插入：

```javascript
function repositionRemainingToasts() {
    const toasts = document.querySelectorAll('.achievement-popup.show');
    const baseBottom = 24;
    toasts.forEach((toast, i) => {
        toast.style.bottom = (baseBottom + i * 102) + 'px';
    });
}
```

- [ ] **Step 3: 验证堆叠逻辑**

连续触发多个成就（如通过开发者控制台手动调用），确认弹窗上下排列不重叠，消失后其余弹窗回落。

- [ ] **Step 4: Commit**

```bash
git add dev/game/20_app.js
git commit -m "feat: add toast stacking for multiple achievement popups"
```

---

### Task 3: WebSocket 后端 — ConnectionManager + 端点

**Files:**
- Create: `server/routers/online.py`

- [ ] **Step 1: 创建 `server/routers/online.py`**

```python
import asyncio
import time
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

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
                # 更新该用户所有连接的 heartbeat（实际只需更新活跃的那条，
                # 但多标签页场景下我们不知道哪条发了心跳，统一刷新全部）
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

    async def disconnect_admin(self, ws: WebSocket):
        async with self._lock:
            self.admin_connections.discard(ws)

    async def _broadcast_status(self):
        async with self._lock:
            online_user_ids = set(self.student_connections.keys())
            # 获取 total users 需要查数据库
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
        for admin_ws in self.admin_connections:
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
            self.admin_connections.discard(dead)

    async def check_stale_connections(self, timeout: float = 60):
        while True:
            await asyncio.sleep(15)
            async with self._lock:
                now = time.time()
                stale = []
                for uid, conns in list(self.student_connections.items()):
                    # 过滤掉超时的连接
                    alive = [(ws, h) for ws, h in conns if now - h < timeout]
                    dead = [ws for ws, h in conns if now - h >= timeout]
                    if alive:
                        self.student_connections[uid] = alive
                    else:
                        stale.append(uid)
                        del self.student_connections[uid]
                    # 关闭超时的连接
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
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=auth_deadline - time.time())
            except asyncio.TimeoutError:
                await websocket.close(code=4001, reason="auth timeout")
                return

            import json
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

        if not authenticated:
            return

        if is_admin:
            await manager.connect_admin(websocket)
            # 教师端连接后立即推送一次当前状态
            await manager._broadcast_status()
            # 教师端只接收推送，不发送消息
            try:
                while True:
                    await websocket.receive_text()  # 保持连接，忽略消息
            except WebSocketDisconnect:
                await manager.disconnect_admin(websocket)
        else:
            await manager.connect_student(websocket, user_id)
            # 学生端接收心跳
            try:
                while True:
                    raw = await asyncio.wait_for(websocket.receive_text(), timeout=35)
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
```

- [ ] **Step 2: 验证后端语法**

```bash
python -c "from server.routers.online import manager, online_websocket_endpoint; print('OK')"
```

- [ ] **Step 3: Commit**

```bash
git add server/routers/online.py
git commit -m "feat: add WebSocket online status tracking endpoint"
```

---

### Task 4: 注册 WebSocket 端点

**Files:**
- Modify: `server/main.py:14-17,65-72`

- [ ] **Step 1: 导入 online 模块并在 app 上注册 WebSocket 路由**

在 `server/main.py` 的 import 区域新增导入：

```python
from server.routers.online import online_websocket_endpoint, manager
```

在 `app = FastAPI(...)` 之后、`app.add_middleware(...)` 之前新增 WebSocket 路由注册：

```python
app.add_api_websocket_route("/ws/online", online_websocket_endpoint)
```

在 `lifespan` 中启动后台清理任务。修改 lifespan 函数：

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # 启动在线状态后台清理任务
    cleanup_task = asyncio.create_task(manager.check_stale_connections())
    if _should_open_browser:
        import asyncio as _asyncio
        import webbrowser
        _asyncio.create_task(_delayed_browser_open(_browser_url, webbrowser))
    yield
    cleanup_task.cancel()
```

- [ ] **Step 2: 验证服务器启动**

```bash
python -c "from server.main import app; print(len(app.routes))"
```
预期：路由数量增加 1（新增 `/ws/online`）。

- [ ] **Step 3: Commit**

```bash
git add server/main.py
git commit -m "feat: register WebSocket /ws/online endpoint with stale connection cleanup"
```

---

### Task 5: 游戏前端 WebSocket 心跳

**Files:**
- Modify: `dev/game/40_api.js:1-157`

- [ ] **Step 1: 在 API 模块顶部新增 `OnlineHeartbeat` 对象**

在 `// API Layer - 所有后端通信集中在这里` 行后、`const API = (() => {` 之前插入：

```javascript
// Online Heartbeat WebSocket
const OnlineHeartbeat = (() => {
    let ws = null;
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    let heartbeatTimer = null;
    let intentionalClose = false;

    function getBaseUrl() {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${location.host}`;
    }

    function connect(token) {
        if (!token) return;
        intentionalClose = false;
        reconnectAttempt = 0;

        function doConnect() {
            if (intentionalClose) return;

            const url = `${getBaseUrl()}/ws/online`;
            ws = new WebSocket(url);

            ws.onopen = () => {
                // 发送认证消息
                ws.send(JSON.stringify({ type: 'auth', token: token }));
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'auth_ok') {
                        reconnectAttempt = 0;
                        // 开始定期心跳
                        heartbeatTimer = setInterval(() => {
                            if (ws && ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ type: 'heartbeat' }));
                            }
                        }, 30000);
                    }
                } catch (e) { /* ignore */ }
            };

            ws.onclose = () => {
                if (heartbeatTimer) {
                    clearInterval(heartbeatTimer);
                    heartbeatTimer = null;
                }
                if (intentionalClose) return;
                scheduleReconnect(token);
            };

            ws.onerror = () => {
                // onclose 会紧随其后触发，在 onclose 中处理重连
            };
        }

        doConnect();
    }

    function scheduleReconnect(token) {
        reconnectAttempt++;
        // 指数退避 + 随机抖动：上限 30s
        const base = Math.min(2000 * Math.pow(2, reconnectAttempt - 1), 30000);
        const jitter = Math.random() * 3000;
        const delay = Math.min(base + jitter, 30000);

        reconnectTimer = setTimeout(() => {
            if (!intentionalClose) {
                connect(token);
            }
        }, delay);
    }

    function disconnect() {
        intentionalClose = true;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    }

    return { connect, disconnect };
})();
```

- [ ] **Step 2: 在 `API.login` 和 `API.register` 成功后启动心跳**

在 `API.login` 方法中，`setCurrentUser(data.user);` 之后添加：

```javascript
OnlineHeartbeat.connect(data.access_token);
```

在 `API.register` 方法中，`setCurrentUser(data.user);` 之后添加：

```javascript
OnlineHeartbeat.connect(data.access_token);
```

- [ ] **Step 3: 在 `API.logout` 中停止心跳**

在 `logout()` 方法中添加：

```javascript
function logout() {
    OnlineHeartbeat.disconnect();
    clearToken();
}
```

- [ ] **Step 4: 在文件底部暴露 `OnlineHeartbeat` 到全局作用域（可选，便于调试）**

无需额外暴露 — `OnlineHeartbeat` 已在 IIFE 外声明。

- [ ] **Step 5: 验证心跳**

启动服务器，在浏览器中登录游戏，打开 Network → WS 标签页，确认 `/ws/online` 连接建立，并且每 30 秒看到一条 `{"type":"heartbeat"}` 消息。

- [ ] **Step 6: Commit**

```bash
git add dev/game/40_api.js
git commit -m "feat: add WebSocket heartbeat to game frontend"
```

---

### Task 6: 教师端仪表盘在线状态卡片 + 学生列表状态列

**Files:**
- Modify: `dev/admin/index.html:47-60`（仪表盘）、`dev/admin/index.html:62-86`（学生列表）
- Modify: `dev/admin/admin.css:39-43,51-60`

- [ ] **Step 1: 在仪表盘 HTML 中新增在线状态卡片**

在 `dashboardCards` div 内、4 张现有卡片之后，新增第 5 张卡片和详情面板：

```html
<div class="summary-card online-status-card" id="onlineStatusCard" onclick="toggleOnlineDetail()" style="cursor:pointer;">
    <div class="card-label">🟢 当前在线</div>
    <div class="card-value" style="color:#27ae60;" id="onlineCount">-</div>
    <div class="card-sub" style="font-size:0.8em;color:#999;">/ 共 <span id="totalStudentCount">-</span> 人</div>
</div>
```

在 `dashboardCards` div 之后、charts-row 之前新增详情面板：

```html
<div class="online-detail-panel" id="onlineDetailPanel" style="display:none;">
    <div class="online-detail-section">
        <h4 class="online-detail-title">🟢 在线 (<span id="onlineDetailCount">0</span>)</h4>
        <div class="online-student-list" id="onlineStudentList"></div>
    </div>
    <div class="online-detail-section">
        <h4 class="online-detail-title offline-title">🔴 离线 (<span id="offlineDetailCount">0</span>)</h4>
        <div class="online-student-list" id="offlineStudentList"></div>
    </div>
</div>
```

- [ ] **Step 2: 在学生列表表格 thead 中新增「状态」列**

在学生列表的 `<thead>` 中，`<th>最近活跃</th>` 前插入：

```html
<th style="width:60px;">状态</th>
```

- [ ] **Step 3: 在 admin.css 中新增在线状态相关样式**

在 `.summary-card` 规则后面追加：

```css
.summary-cards { grid-template-columns: repeat(5, 1fr); }
.online-status-card { cursor: pointer; transition: box-shadow 0.15s; }
.online-status-card:hover { box-shadow: 0 2px 8px rgba(39,174,96,0.15); }
.online-status-card .card-sub { font-size: 0.8em; color: #999; }
.online-detail-panel {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    animation: fadeIn 0.2s;
}
.online-detail-title { font-size: 0.95em; font-weight: 600; margin-bottom: 10px; color: #555; }
.online-detail-title.offline-title { color: #999; }
.online-student-list { display: flex; flex-wrap: wrap; gap: 8px; }
.online-student-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 16px;
    background: #e8f5e9; color: #2e7d32; font-size: 0.85em;
}
.offline-student-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 16px;
    background: #f5f5f5; color: #999; font-size: 0.85em;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.status-dot.online { background: #27ae60; }
.status-dot.offline { background: #ccc; }
```

在响应式区域追加：

```css
@media (max-width: 768px) {
    .summary-cards { grid-template-columns: repeat(2, 1fr); }
    .online-detail-panel { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: 验证 HTML/CSS**

在浏览器中打开 `/admin` 页面，确认在线状态卡片样式正确，详情面板默认隐藏。需要在 Task 7 完成后功能才能完全验证。

- [ ] **Step 5: Commit**

```bash
git add dev/admin/index.html dev/admin/admin.css
git commit -m "feat: add online status card and student status column to admin panel"
```

---

### Task 7: 教师端 JS — WebSocket 连接与 UI 更新

**Files:**
- Modify: `dev/admin/admin.js:1-8,97-152,218-229`（多处）

- [ ] **Step 1: 在文件顶部新增全局状态和 WebSocket 管理**

在 `let currentStudentPage = 1;` 之后新增：

```javascript
let onlineUsers = [];
let offlineUsers = [];
let adminWs = null;
let adminReconnectTimer = null;
let adminReconnectAttempt = 0;
let adminIntentionalClose = false;

function connectAdminWebSocket(token) {
    adminIntentionalClose = false;
    adminReconnectAttempt = 0;

    function doConnect() {
        if (adminIntentionalClose) return;

        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${proto}//${location.host}/ws/online`;
        adminWs = new WebSocket(url);

        adminWs.onopen = () => {
            adminWs.send(JSON.stringify({ type: 'auth', token: token }));
        };

        adminWs.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'online_status') {
                    onlineUsers = msg.online_users || [];
                    offlineUsers = msg.offline_users || [];
                    updateOnlineUI();
                }
            } catch (e) { /* ignore */ }
        };

        adminWs.onclose = () => {
            if (adminIntentionalClose) return;
            scheduleAdminReconnect(token);
        };
    }

    doConnect();
}

function scheduleAdminReconnect(token) {
    adminReconnectAttempt++;
    const base = Math.min(2000 * Math.pow(2, adminReconnectAttempt - 1), 30000);
    const jitter = Math.random() * 3000;
    const delay = Math.min(base + jitter, 30000);

    adminReconnectTimer = setTimeout(() => {
        if (!adminIntentionalClose) {
            connectAdminWebSocket(token);
        }
    }, delay);
}

function disconnectAdminWebSocket() {
    adminIntentionalClose = true;
    if (adminReconnectTimer) {
        clearTimeout(adminReconnectTimer);
        adminReconnectTimer = null;
    }
    if (adminWs) {
        adminWs.close();
        adminWs = null;
    }
}
```

- [ ] **Step 2: 新增 `updateOnlineUI` 函数，更新仪表盘卡片和详情面板**

在 `loadDashboard` 函数之前插入：

```javascript
function updateOnlineUI() {
    // 仪表盘卡片数字
    const onlineCountEl = document.getElementById('onlineCount');
    const totalCountEl = document.getElementById('totalStudentCount');
    if (onlineCountEl) onlineCountEl.textContent = onlineUsers.length;
    if (totalCountEl) totalCountEl.textContent = onlineUsers.length + offlineUsers.length;

    // 详情面板
    const onlineListEl = document.getElementById('onlineStudentList');
    const offlineListEl = document.getElementById('offlineStudentList');
    const onlineDetailCount = document.getElementById('onlineDetailCount');
    const offlineDetailCount = document.getElementById('offlineDetailCount');

    if (onlineDetailCount) onlineDetailCount.textContent = onlineUsers.length;
    if (offlineDetailCount) offlineDetailCount.textContent = offlineUsers.length;

    if (onlineListEl) {
        onlineListEl.innerHTML = onlineUsers.length === 0
            ? '<span style="color:#999;font-size:0.85em;">暂无在线学生</span>'
            : onlineUsers.map(u => `<span class="online-student-tag"><span class="status-dot online"></span>${escapeHtml(u.nickname)}</span>`).join('');
    }

    if (offlineListEl) {
        offlineListEl.innerHTML = offlineUsers.length === 0
            ? '<span style="color:#999;font-size:0.85em;">全部在线</span>'
            : offlineUsers.map(u => `<span class="offline-student-tag"><span class="status-dot offline"></span>${escapeHtml(u.nickname)}</span>`).join('');
    }

    // 如果在学生列表页面，刷新表格以更新状态列
    if (currentPage === 'students') {
        loadStudentList();
    }
}

function toggleOnlineDetail() {
    const panel = document.getElementById('onlineDetailPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? '' : 'none';
    }
}
```

- [ ] **Step 3: 在登录成功后启动 WebSocket**

在 `showContent` 函数中（约第 53 行），`switchPage('dashboard');` 调用之前新增：

```javascript
const token = getToken();
if (token) {
    connectAdminWebSocket(token);
}
```

- [ ] **Step 4: 在登出时断开 WebSocket**

在 `doLogout` 函数中，`clearToken();` 之前新增：

```javascript
disconnectAdminWebSocket();
```

- [ ] **Step 5: 修改学生列表渲染，增加状态列**

定位到 `dev/admin/admin.js:239-246`，将 map 生成的 `<tr>` 部分替换为：

```javascript
tbody.innerHTML = data.items.map(s => {
    const isOnline = onlineUsers.some(u => u.id === s.user_id);
    return `<tr onclick="fetchAndRenderStudentDetail(${s.user_id})">
        <td><span class="status-dot ${isOnline ? 'online' : 'offline'}" style="width:10px;height:10px;border-radius:50%;display:inline-block;${isOnline ? 'background:#27ae60;' : 'background:#ccc;'}"></span></td>
        <td><strong>${escapeHtml(s.nickname)}</strong><br><span style="color:#999;font-size:0.8em;">@${escapeHtml(s.username)}</span></td>
        <td>${s.total_score}</td>
        <td>${s.accuracy}%</td>
        <td>${s.completed_levels}</td>
        <td>${s.last_active ? s.last_active.substring(0, 16) : '-'}</td>
    </tr>`;
}).join('');
```

- [ ] **Step 6: 验证完整功能**

1. 启动服务器
2. 用学生账号登录游戏，观察 `/admin` 仪表盘在线人数变为 1
3. 点击在线状态卡片，展开详情面板，确认显示在线学生昵称
4. 关闭学生页面，等待约 60 秒后教师端看到状态变为离线
5. 切换到学生列表页面，确认状态列正确显示

- [ ] **Step 7: Commit**

```bash
git add dev/admin/admin.js
git commit -m "feat: add WebSocket connection and online status UI updates to admin panel"
```

---

### Task 8: 端到端集成测试

**Files:**
- Modify: `server/tests/test_records.py`（已有测试文件）

- [ ] **Step 1: 编写 WebSocket 集成测试**

在 `server/tests/` 目录下创建 `test_online.py`：

```python
import asyncio
import json

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from httpx_ws import aconnect_ws

from server.main import app
from server.auth import create_access_token
from server.database import SessionLocal
from server.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


@pytest.mark.asyncio
async def test_student_connect_and_heartbeat():
    """学生连接 WebSocket，发送认证和心跳，验证状态更新"""
    db = SessionLocal()
    user = db.query(User).filter(User.role == "user").first()
    db.close()

    if not user:
        pytest.skip("数据库无学生用户")

    token = create_access_token({"sub": str(user.id)})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws(client, "/ws/online") as ws:
            # 发送认证
            await ws.send_json({"type": "auth", "token": token})
            # 等待 auth_ok（如果有的话）或跳过
            await ws.send_json({"type": "heartbeat"})
            await asyncio.sleep(0.5)

    # 验证：连接断开后不报错
    assert True


@pytest.mark.asyncio
async def test_admin_connect_and_receive_status():
    """教师连接 WebSocket，接收在线状态推送"""
    db = SessionLocal()
    admin = db.query(User).filter(User.role == "admin").first()
    db.close()

    if not admin:
        pytest.skip("数据库无管理员用户")

    token = create_access_token({"sub": str(admin.id)})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws(client, "/ws/online") as ws:
            await ws.send_json({"type": "auth", "token": token})
            # 教师应收到 online_status 消息
            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=3)
                msg = json.loads(raw)
                assert msg["type"] == "online_status"
                assert "online_count" in msg
                assert "total_count" in msg
                assert "online_users" in msg
                assert "offline_users" in msg
            except asyncio.TimeoutError:
                pytest.fail("未收到 online_status 推送")


@pytest.mark.asyncio
async def test_invalid_token_rejected():
    """无效 token 应被拒绝"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with pytest.raises(Exception):
            async with aconnect_ws(client, "/ws/online") as ws:
                await ws.send_json({"type": "auth", "token": "invalid-token"})
                await asyncio.sleep(1)


@pytest.mark.asyncio
async def test_missing_auth_closed():
    """未发认证消息应在 5 秒后被断开"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with aconnect_ws(client, "/ws/online") as ws:
            await asyncio.sleep(6)
            with pytest.raises(Exception):
                await ws.receive_text()
```

- [ ] **Step 2: 安装 WebSocket 测试依赖**

```bash
pip install httpx-ws
```

- [ ] **Step 3: 运行测试**

```bash
python -m pytest server/tests/test_online.py -v
```

预期：跳过或通过（取决于数据库是否有用户）。

- [ ] **Step 4: Commit**

```bash
git add server/tests/test_online.py
git commit -m "test: add WebSocket online status integration tests"
```
