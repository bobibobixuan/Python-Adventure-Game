# SQLite 便携打包 + 题库导入 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除Docker/PostgreSQL，SQLite化，前端接入API，80端口，PyInstaller打包成exe，支持题库JSON导入

**Architecture:** FastAPI 在 80 端口同时提供静态前端和 API，SQLite 存储，PyInstaller 打包为单目录。前端新增 API 层使用相对路径 fetch。

**Tech Stack:** FastAPI, SQLAlchemy, SQLite, PyInstaller, vanilla JS

---

### Task 1: 移除 Docker 和 PostgreSQL 依赖

**Files:**
- Delete: `Dockerfile`
- Delete: `docker-compose.yml`
- Modify: `requirements.txt`

- [ ] **Step 1: 删除 Docker 文件**

```bash
git rm Dockerfile docker-compose.yml
```

- [ ] **Step 2: 移除 psycopg2-binary 依赖**

编辑 `requirements.txt`，删除第4行 `psycopg2-binary==2.9.10`。

- [ ] **Step 3: 验证后端能正常启动**

```bash
pip install -r requirements.txt
python -m pytest server/tests/ -v
```

Expected: 所有测试通过，SQLite 无需额外配置。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove Docker and PostgreSQL dependency, keep SQLite only"
```

---

### Task 2: 修改后端配置和启动逻辑

**Files:**
- Modify: `server/config.py`
- Modify: `server/main.py`

- [ ] **Step 1: 修改 config.py —— PyInstaller 兼容的数据库路径**

将 `server/config.py` 替换为：

```python
import sys
from pathlib import Path
from pydantic_settings import BaseSettings


def _get_base_dir() -> Path:
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{_get_base_dir() / 'app.db'}"
    JWT_SECRET: str = "change-me-in-production-use-a-random-64-char-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
```

- [ ] **Step 2: 修改 main.py —— 挂载静态文件、端口80、打开浏览器、显示IP**

将 `server/main.py` 替换为：

```python
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
```

- [ ] **Step 3: 验证启动**

```bash
python -m server.main
```

Expected: 服务器在 80 端口启动，浏览器自动打开，控制台打印本机IP。

- [ ] **Step 4: Commit**

```bash
git add server/config.py server/main.py
git commit -m "feat: serve static files, port 80, auto-open browser, show LAN IP"
```

---

### Task 3: 创建题库导入格式规范文档

**Files:**
- Create: `docs/题库导入格式规范.md`

- [ ] **Step 1: 编写规范文档**

```markdown
# 题库导入格式规范

## 支持格式

JSON（`.json`），UTF-8 编码。

## 文件结构

```json
{
  "version": "1.0",
  "unit": "第一单元",
  "questions": [
    {
      "type": "选择题",
      "content": "print(2 + 3 * 4) 的输出结果是？",
      "options": [
        {"letter": "A", "text": "20"},
        {"letter": "B", "text": "14"},
        {"letter": "C", "text": "24"},
        {"letter": "D", "text": "9"}
      ],
      "answer": "B",
      "explanation": "先乘除后加减：3*4=12，2+12=14",
      "difficulty": 1
    },
    {
      "type": "判断题",
      "content": "Python中列表的索引从1开始。",
      "answer": "false",
      "explanation": "Python列表索引从0开始。",
      "difficulty": 1
    },
    {
      "type": "填空题",
      "content": "Python中用于定义函数的关键字是____。",
      "answer": "def",
      "explanation": "使用 def 关键字定义函数。",
      "difficulty": 2
    }
  ]
}
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| version | string | 是 | 格式版本，当前 `"1.0"` |
| unit | string | 是 | 单元名称，如 `"第一单元"` |
| questions | array | 是 | 题目列表 |

### question 对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | `"选择题"` / `"判断题"` / `"填空题"` |
| content | string | 是 | 题目内容，可含 HTML |
| options | array | 选择题必填 | 选项列表，每个含 `letter` 和 `text` |
| answer | string | 是 | 选择题填字母，判断题 `"true"/"false"`，填空题填文本 |
| explanation | string | 否 | 解析说明，显示在答对/答错后的知识卡片中 |
| difficulty | int | 否 | 难度 1-3，默认 1 |

## 导入规则

1. 相同 `unit` 名称的题目会合并到同一单元
2. 每道题导入时会按顺序分配到对应关卡（每关5题一组）
3. 重复导入同一文件不会去重——会新增题目
4. 单次导入最多 500 题
```

- [ ] **Step 2: Commit**

```bash
git add docs/题库导入格式规范.md
git commit -m "docs: add question import format specification"
```

---

### Task 4: 创建后端题库批量导入接口

**Files:**
- Create: `server/routers/import_questions.py`
- Modify: `server/routers/__init__.py`

- [ ] **Step 1: 创建导入接口**

```python
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from server.database import get_db
from server.dependencies import get_admin_user
from server.models.user import User
from server.models.unit import Unit, Level
from server.models.question import Question
from server.routers import admin_router


class OptionItem(BaseModel):
    letter: str
    text: str


class QuestionItem(BaseModel):
    type: str
    content: str
    options: Optional[list[OptionItem]] = None
    answer: str
    explanation: str = ""
    difficulty: int = 1


class ImportPayload(BaseModel):
    version: str
    unit: str
    questions: list[QuestionItem]


@admin_router.post("/import")
def import_questions(
    payload: ImportPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if len(payload.questions) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="单次最多导入500题"
        )

    valid_types = {"选择题", "判断题", "填空题"}
    for i, q in enumerate(payload.questions):
        if q.type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 无效的题目类型 '{q.type}'"
            )
        if q.type == "选择题" and (not q.options or len(q.options) < 2):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 选择题缺少选项"
            )
        if not q.answer or not q.answer.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 缺少答案"
            )

    # 查找或创建单元
    unit = db.query(Unit).filter(Unit.name == payload.unit).first()
    if not unit:
        max_order = db.query(Unit).count()
        unit = Unit(
            name=payload.unit,
            icon="📚",
            subtitle=payload.unit,
            description=payload.unit,
            sort_order=max_order,
        )
        db.add(unit)
        db.flush()

    # 获取或创建关卡（每5题一组）
    level_count = db.query(Level).filter(Level.unit_id == unit.id).count()
    existing_max_sort = (
        db.query(Level)
        .filter(Level.unit_id == unit.id)
        .order_by(Level.sort_order.desc())
        .first()
    )
    base_sort = (existing_max_sort.sort_order + 1) if existing_max_sort else 0

    imported = 0
    for batch_start in range(0, len(payload.questions), 5):
        batch = payload.questions[batch_start:batch_start + 5]
        level_index = level_count + (batch_start // 5)

        level_name = f"第{level_index + 1}关"
        level = Level(
            unit_id=unit.id,
            name=level_name,
            icon="📝",
            bg="🏰",
            questions_count=len(batch),
            sort_order=base_sort + (batch_start // 5),
        )
        db.add(level)
        db.flush()

        for idx, q in enumerate(batch):
            options_list = None
            if q.options:
                options_list = [{"letter": o.letter, "text": o.text} for o in q.options]

            question = Question(
                level_id=level.id,
                type=q.type,
                content=q.content,
                options=options_list,
                answer=q.answer.strip(),
                knowledge_meaning=q.explanation,
                knowledge_rule="",
                knowledge_error="",
                knowledge_example="",
                sort_order=idx,
            )
            db.add(question)
            imported += 1

    db.commit()

    return {
        "message": f"导入成功！单元「{payload.unit}」新增 {imported} 题，{len(payload.questions) // 5 + (1 if len(payload.questions) % 5 else 0)} 关"
    }
```

- [ ] **Step 2: 在 __init__.py 中注册 import 模块**

编辑 `server/routers/__init__.py`，在末尾添加一行：

```python
from server.routers import import_questions as _import_module  # noqa: F401
```

- [ ] **Step 3: 写测试**

```python
# server/tests/test_import.py
from fastapi.testclient import TestClient
from server.main import app
from server.database import SessionLocal, Base, engine
from server.models.user import User
from server.auth import hash_password

client = TestClient(app)


def _get_admin_token():
    db = SessionLocal()
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        user = User(
            username="admin",
            password_hash=hash_password("admin123"),
            nickname="Admin",
            role="admin",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()

    resp = client.post("/api/auth/login", json={
        "username": "admin", "password": "admin123"
    })
    return resp.json()["access_token"]


def test_import_questions_creates_unit_and_levels():
    Base.metadata.create_all(bind=engine)
    token = _get_admin_token()

    payload = {
        "version": "1.0",
        "unit": "测试单元",
        "questions": [
            {
                "type": "选择题",
                "content": "测试题1",
                "options": [
                    {"letter": "A", "text": "选项A"},
                    {"letter": "B", "text": "选项B"}
                ],
                "answer": "A",
                "explanation": "解析1"
            },
            {
                "type": "判断题",
                "content": "测试题2",
                "answer": "true",
                "explanation": "解析2"
            }
        ]
    }

    resp = client.post(
        "/api/admin/import",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "导入成功" in data["message"]
    assert "2" in data["message"]


def test_import_rejects_invalid_type():
    Base.metadata.create_all(bind=engine)
    token = _get_admin_token()

    payload = {
        "version": "1.0",
        "unit": "测试",
        "questions": [
            {"type": "多选题", "content": "测试", "answer": "A"}
        ]
    }

    resp = client.post(
        "/api/admin/import",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 400


def test_import_choice_requires_options():
    Base.metadata.create_all(bind=engine)
    token = _get_admin_token()

    payload = {
        "version": "1.0",
        "unit": "测试",
        "questions": [
            {"type": "选择题", "content": "测试", "answer": "A", "options": []}
        ]
    }

    resp = client.post(
        "/api/admin/import",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 400
```

- [ ] **Step 4: 运行测试**

```bash
python -m pytest server/tests/test_import.py -v
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add server/routers/import_questions.py server/routers/__init__.py server/tests/test_import.py
git commit -m "feat: add bulk question import endpoint POST /api/admin/import"
```

---

### Task 5: 创建前端 API 层

**Files:**
- Create: `dev/game/40_api.js`

- [ ] **Step 1: 创建 API 层**

```javascript
// API Layer - 所有后端通信集中在这里
const API = (() => {
    const TOKEN_KEY = 'jwt_token';
    const USER_KEY = 'current_user';

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    function clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function getCurrentUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function setCurrentUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    async function fetchAPI(path, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const resp = await fetch(path, { ...options, headers });
        if (resp.status === 401) {
            clearToken();
            throw new Error('登录已过期，请重新登录');
        }
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: '请求失败' }));
            throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        return resp.json();
    }

    // Auth
    async function register(username, password, nickname) {
        const data = await fetchAPI('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, nickname })
        });
        setToken(data.access_token);
        setCurrentUser(data.user);
        return data;
    }

    async function login(username, password) {
        const data = await fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        setToken(data.access_token);
        setCurrentUser(data.user);
        return data;
    }

    function logout() {
        clearToken();
    }

    function isLoggedIn() {
        return !!getToken();
    }

    // Questions
    async function getLevelQuestions(levelId) {
        return fetchAPI(`/api/questions/levels/${levelId}`);
    }

    // Units
    async function getUnits() {
        return fetchAPI('/api/units');
    }

    async function getUnitProgress() {
        return fetchAPI('/api/units/progress');
    }

    // Records
    async function submitRecord(record) {
        return fetchAPI('/api/records', {
            method: 'POST',
            body: JSON.stringify(record)
        });
    }

    async function getRecords() {
        return fetchAPI('/api/records');
    }

    // Scores
    async function getScores() {
        return fetchAPI('/api/scores');
    }

    // Achievements
    async function getAchievements() {
        return fetchAPI('/api/achievements');
    }

    async function checkAchievements(stats) {
        return fetchAPI('/api/achievements/check', {
            method: 'POST',
            body: JSON.stringify(stats)
        });
    }

    // Leaderboard
    async function getLeaderboard() {
        return fetchAPI('/api/leaderboard');
    }

    // Admin
    async function importQuestions(jsonData) {
        return fetchAPI('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify(jsonData)
        });
    }

    return {
        getToken, setToken, clearToken,
        getCurrentUser, setCurrentUser,
        isLoggedIn,
        register, login, logout,
        getLevelQuestions, getUnits, getUnitProgress,
        submitRecord, getRecords, getScores,
        getAchievements, checkAchievements,
        getLeaderboard,
        importQuestions
    };
})();
```

- [ ] **Step 2: Commit**

```bash
git add dev/game/40_api.js
git commit -m "feat: add frontend API layer with JWT auth"
```

---

### Task 6: 创建前端题库导入管理页面

**Files:**
- Create: `dev/game/50_admin.js`

- [ ] **Step 1: 创建管理页面 JS**

```javascript
// Admin Panel - 题库导入
function showAdminPanel() {
    if (!API.isLoggedIn()) {
        alert('请先登录管理员账号');
        return;
    }

    const existingPanel = document.getElementById('adminImportPanel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'adminImportPanel';
    panel.innerHTML = `
        <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:16px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;color:#333;">
                <h2 style="margin:0 0 10px 0;">📥 题库导入</h2>
                <p style="color:#999;margin:0 0 20px 0;font-size:0.9em;">
                    上传符合格式规范的 JSON 文件。格式详见
                    <a href="#" onclick="event.preventDefault();alert('请查看 docs/题库导入格式规范.md')">导入规范</a>
                </p>

                <div style="border:2px dashed #ccc;border-radius:12px;padding:40px 20px;text-align:center;margin-bottom:20px;cursor:pointer;"
                     id="dropZone"
                     onclick="document.getElementById('importFileInput').click()">
                    <div style="font-size:2em;">📁</div>
                    <div style="margin-top:8px;color:#999;" id="dropText">点击选择文件或拖拽到此处</div>
                </div>
                <input type="file" id="importFileInput" accept=".json" style="display:none;"
                       onchange="handleImportFile(this.files[0])">

                <div id="importPreview" style="display:none;margin-bottom:20px;">
                    <div style="background:#f0f7ff;border-radius:8px;padding:12px;margin-bottom:10px;">
                        <strong id="previewUnit"></strong>
                        <span style="color:#999;margin-left:8px;" id="previewCount"></span>
                    </div>
                    <div id="previewQuestions" style="max-height:200px;overflow-y:auto;font-size:0.85em;"></div>
                </div>

                <div id="importResult" style="display:none;margin-bottom:15px;"></div>

                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button onclick="document.getElementById('adminImportPanel').remove()"
                            style="padding:10px 20px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">
                        关闭
                    </button>
                    <button id="importSubmitBtn" onclick="doImport()" disabled
                            style="padding:10px 20px;border:none;border-radius:8px;background:#667eea;color:#fff;cursor:pointer;">
                        开始导入
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // 拖拽支持
    const dropZone = panel.querySelector('#dropZone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#667eea'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#ccc'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        const file = e.dataTransfer.files[0];
        if (file) handleImportFile(file);
    });
}

let pendingImportData = null;

function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.version || !data.unit || !Array.isArray(data.questions)) {
                throw new Error('格式不符合规范：需要 version, unit, questions 字段');
            }
            pendingImportData = data;

            document.getElementById('dropText').textContent = file.name;
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('previewUnit').textContent = '📚 ' + data.unit;
            document.getElementById('previewCount').textContent = data.questions.length + ' 题';

            const preview = document.getElementById('previewQuestions');
            preview.innerHTML = data.questions.slice(0, 5).map((q, i) =>
                `<div style="padding:6px 0;border-bottom:1px solid #eee;">
                    ${i+1}. [${q.type}] ${q.content.substring(0, 50)}${q.content.length > 50 ? '...' : ''}
                </div>`
            ).join('') + (data.questions.length > 5 ?
                `<div style="color:#999;padding:6px 0;">... 还有 ${data.questions.length - 5} 题</div>` : '');

            document.getElementById('importSubmitBtn').disabled = false;
        } catch (err) {
            alert('文件解析失败：' + err.message);
        }
    };
    reader.readAsText(file);
}

async function doImport() {
    if (!pendingImportData) return;
    const btn = document.getElementById('importSubmitBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';

    const resultDiv = document.getElementById('importResult');
    try {
        const result = await API.importQuestions(pendingImportData);
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#e8f5e9;color:#2e7d32;padding:12px;border-radius:8px;">
            ✅ ${result.message}
        </div>`;
        pendingImportData = null;
        document.getElementById('importSubmitBtn').style.display = 'none';
    } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#ffebee;color:#c62828;padding:12px;border-radius:8px;">
            ❌ ${err.message}
        </div>`;
        btn.disabled = false;
        btn.textContent = '重试导入';
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add dev/game/50_admin.js
git commit -m "feat: add admin question import panel UI"
```

---

### Task 7: PyInstaller 打包配置

**Files:**
- Create: `pyinstaller.spec`
- Create: `build.bat`

- [ ] **Step 1: 创建 pyinstaller.spec**

```python
# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['server/main.py'],
    pathex=[],
    binaries=[],
    datas=[('dev', 'dev')],
    hiddenimports=['server.routers', 'server.routers.import_questions', 'server.models', 'server.seed'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['psycopg2', 'psycopg2-binary'],
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='game',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_tracked=False,
    argv_emulation=False,
    target_arch=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='game',
)
```

- [ ] **Step 2: 创建 build.bat**

```batch
@echo off
echo === Python Adventure Game - Build Script ===
echo.

pip install pyinstaller
pip install -r requirements.txt

echo.
echo === Building... ===
pyinstaller --clean pyinstaller.spec

echo.
echo === Build complete ===
echo Output: dist\game\
echo Run: dist\game\game.exe
pause
```

- [ ] **Step 3: 测试打包**

```bash
build.bat
```

Expected: 在 `dist/game/` 生成 `game.exe`，双击可启动。

- [ ] **Step 4: Commit**

```bash
git add pyinstaller.spec build.bat
git commit -m "build: add PyInstaller spec and build script"
```

---

### Task 8: 修复 index.html 加载 JS/CSS 文件

**Files:**
- Modify: `dev/index.html`

`<!-- BUILD:STYLES -->`、`<!-- BUILD:DATA -->`、`<!-- BUILD:GAME -->` 是构建标记，dev 模式下需要改为实际的 `<script>`/`<link>` 引用。

- [ ] **Step 1: 替换 BUILD:STYLES 为 link 标签**

将第9行的 `<!-- BUILD:STYLES -->` 替换为：

```html
    <link rel="stylesheet" href="style.css">
```

- [ ] **Step 2: 替换 BUILD:DATA 为 data script 标签**

将 `<!-- BUILD:DATA -->` 替换为：

```html
    <script src="data/00_units.js"></script>
    <script src="data/10_unit1_questions.js"></script>
    <script src="data/11_unit2_questions.js"></script>
    <script src="data/20_unit_maps.js"></script>
    <script src="data/30_achievements.js"></script>
```

- [ ] **Step 3: 替换 BUILD:GAME 为 game script 标签（含新增文件）**

将 `<!-- BUILD:GAME -->` 替换为：

```html
    <script src="game/00_core.js"></script>
    <script src="game/10_state.js"></script>
    <script src="game/20_app.js"></script>
    <script src="game/30_devtools.js"></script>
    <script src="game/40_api.js"></script>
    <script src="game/50_admin.js"></script>
```

- [ ] **Step 4: Commit**

```bash
git add dev/index.html
git commit -m "fix: replace BUILD markers with actual script/link tags for dev mode"
