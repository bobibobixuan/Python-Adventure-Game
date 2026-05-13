# Design: 成就弹窗右下角 + WebSocket 实时在线状态

**Date:** 2026-05-14
**Status:** approved (revised after review)

---

## Feature 1: 成就弹窗移至右下角

### 问题
成就弹窗当前居中显示（`top:50%; left:50%`），弹出时会遮挡答题题目。

### 方案
将 `.achievement-popup` 从居中定位改为右下角固定定位，入场/出场动画同步调整，多弹窗时垂直堆叠。

### 改动文件
- `dev/style.css`：修改 `.achievement-popup` 定位和动画关键帧，新增堆叠样式
- `dev/game/20_app.js`：弹窗队列增加堆叠偏移逻辑

### 细节

**定位：**
- `bottom: 24px; right: 24px; top: auto; left: auto; transform: none`
- `z-index: 9999`：确保不被右下角其他悬浮元素遮挡
- 入场动画 `achievementIn`：从 `translateY(20px) scale(0.92); opacity:0` 滑入
- 出场 `.hide`：`translateY(12px) scale(0.96); opacity:0`
- shimmer 伪元素保持不变
- 窄屏 `@media (max-width: 480px)`：`right: 12px; left: 12px; bottom: 12px`

**多弹窗堆叠（Toast 队列）：**
- `displayNextAchievementPopup()` 中，每弹出一个新 toast，将已存在的 toast 向上推移
- 新 toast 的 `bottom` 偏移 = 已有 toast 数量 × (toast 高度 + 12px 间距)
- toast 消失后，剩余 toast 平滑回落，填补空位
- 最多同时显示 3 个 toast，超出时最旧的自动加速消失

---

## Feature 2: WebSocket 实时在线状态

### 问题
教师端目前只能看"今日活跃"统计，无法实时知道哪些学生当前在线。

### 方案
FastAPI WebSocket + 心跳机制 + 教师端实时展示。

### 架构

```
学生游戏端 ──WebSocket──> /ws/online <──WebSocket── 教师管理后台
  心跳(30s)                                         实时推送在线列表
```

### 后端

**新文件 `server/routers/online.py`：**

- WebSocket endpoint `/ws/online`（直接注册到 app，不走 APIRouter）

- **认证流程：** 连接建立后，客户端必须在 5 秒内发送 `{"type":"auth","token":"..."}`。后端验证 token 前拒绝所有其他消息，超时未认证则主动断开。**不使用 URL query param 传 token**，避免 token 被写入服务器日志。

- 内存状态 `ConnectionManager`：
  - `student_connections: dict[user_id, list[WebSocket]]` — 同一用户可能多标签页
  - `admin_connections: set[WebSocket]`
  - 每次心跳更新 `last_heartbeat`
  - 连接断开（`try/except WebSocketDisconnect`）时立即清理：
    - 学生：从 `student_connections[user_id]` 列表中移除该连接，列表为空则用户离线
    - 教师：从 `admin_connections` set 中移除

- 后台任务 `check_stale_connections`：每 15 秒检查，超过 60 秒无心跳的连接主动关闭并清理。状态变更时调用 `broadcast_to_admins`。

- 广播消息格式：
  ```json
  {
    "type": "online_status",
    "online_count": 5,
    "total_count": 30,
    "online_users": [{"id":1,"nickname":"小明"}, ...],
    "offline_users": [{"id":2,"nickname":"小红"}, ...]
  }
  ```

- **部署限制：** 在线状态存于进程内存。单 Uvicorn worker 部署没有问题；多 worker / 多容器部署会导致状态不共享（Worker A 的学生在 Worker B 的教师端看不到）。当前项目规模下保持内存方案，后续如有横向扩展需求再引入 Redis Pub/Sub。

**改动文件：**
- `server/main.py`：注册 `/ws/online` WebSocket 端点

### 游戏前端

**改动文件 `dev/game/40_api.js`：**
- 新增 `OnlineHeartbeat` 对象：
  - `connect()`：登录后调用，建立 WebSocket 连接
  - 连接成功后第一条消息发送 `{"type":"auth","token":"..."}` 进行认证
  - 认证成功后每 30 秒发送 `{"type":"heartbeat"}`
  - `ws.onclose`：指数退避重连：第 1 次 2~5s（随机），第 2 次 5~10s，第 3 次 10~20s，上限 30s。避免服务器重启后的重连风暴
  - `disconnect()`：登出时主动关闭，设置 `reconnect = false` 阻止自动重连
- 在 `API.login/register` 成功后自动调用 `OnlineHeartbeat.connect()`
- 在 `API.logout` 时调用 `OnlineHeartbeat.disconnect()`

### 教师端

**改动文件 `dev/admin/index.html`：**
- 仪表盘汇总卡片区新增第 5 张卡片「在线状态」，点击展开下拉面板
- 下拉面板显示在线列表（绿点+昵称）和离线列表（灰点+昵称）

**改动文件 `dev/admin/admin.js`：**
- 新增 WebSocket 连接逻辑：
  - 连接后发送 `{"type":"auth","token":"..."}` 认证
  - 教师端不发送心跳，只接收 `online_status` 推送
  - 指数退避重连（同学生端）
- 收到 `online_status` 后：更新仪表盘卡片数字、更新详情面板列表
- 学生列表表格 `<thead>` 新增「状态」列，`<tbody>` 每行用 `onlineUsers.has(id)` 判断显示 🟢 或 🔴

**改动文件 `dev/admin/admin.css`：**
- `.online-status-card`：可点击样式，cursor:pointer，hover 效果
- `.online-detail-panel`：卡片下方展开的详情面板，过渡动画
- `.online-dot` / `.offline-dot`：12px 圆点，绿/灰色
- `.online-student-list` / `.offline-student-list`：列表布局

### 边界情况
- WebSocket 连接失败：指数退避静默重试，不影响答题功能
- 服务器重启：内存清空，所有连接断开，学生端退避重连，恢复后自动重建状态
- 同一用户多标签页：多连接共享同一 user_id，任一连接有心跳即算在线
- 教师端未登录或 token 过期：auth 消息被拒，WebSocket 断开，教师端显示连接失败
- 教师端直接关浏览器：`WebSocketDisconnect` 异常触发 `admin_connections.remove(ws)`，无内存泄漏
- 数据库不存储在线状态：纯内存，重启清零，无历史遗留
