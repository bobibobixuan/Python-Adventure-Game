<p align="center">
  <h1 align="center">🐍 Python 基础闯关</h1>
  <p align="center">
    <strong>局域网优先的交互式 Python 学习平台</strong> — 零配置教室服务器，融合游戏化编程课程、教师后台与实时进度追踪。
  </p>
</p>

<p align="center">
  <a href="#功能特性"><img src="https://img.shields.io/badge/status-active-success" alt="Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Educational-blue" alt="License"></a>
  <a href="#快速开始"><img src="https://img.shields.io/badge/python-3.8+-blue" alt="Python"></a>
  <a href="#技术栈"><img src="https://img.shields.io/badge/backend-FastAPI-009688" alt="FastAPI"></a>
  <a href="#技术栈"><img src="https://img.shields.io/badge/frontend-vanilla_JS-F7DF1E?logo=javascript" alt="Vanilla JS"></a>
</p>

[English](https://github.com/bobibobixuan/Python-Adventure-Game/blob/main/README.md) | 简体中文

---

## ✨ 功能特性

- **游戏化学习路径** — 3 个单元、18 个关卡，包含星级评定、连击计分、生命值与倒计时机制
- **多模式切换** — 跟老师学（题前引导）、练习场（随机刷题）、极限测试（一命到底）、双单元综合挑战
- **教师实时后台** — WebSocket 心跳在线状态、学生活动流、答题统计与成就追踪
- **成就系统** — 14 枚可解锁徽章，涵盖正确率、速度、连击和通关里程碑，支持多弹窗堆叠提示
- **错题分析** — 逐题错题历史，附带知识点诊断和「小白版」分步解析
- **进度持久化** — 服务端状态同步，登出/重登自动恢复，跨设备档案恢复，localStorage 容错
- **零配置局域网部署** — 单命令启动，自动检测本机 IP，无需外部服务或容器
- **离线优先架构** — 原生 HTML/CSS/JS 前端，无 npm 依赖，浏览器原生 ES 模块
- **角色权限控制** — 学生、管理员、超级管理员，JWT 鉴权 + 接口级权限隔离

## 🚀 快速开始

### 环境要求

- Python `>= 3.8`
- Windows 为主要维护环境（Linux/macOS 兼容）

### 一键启动

```bash
# 克隆项目
git clone https://github.com/bobibobixuan/Python-Adventure-Game.git
cd Python-Adventure-Game

# 创建虚拟环境并安装依赖
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux

pip install -r requirements.txt

# 启动服务
python -m server.main
```

服务端启动后自动检测局域网 IP 并打印访问地址：

```
========================================
  Python Adventure Game Server
  本机访问: http://localhost
  局域网访问: http://192.168.x.x
========================================
```

浏览器打开即可 — 学生通过局域网加入，教师访问 `/admin` 进入后台。

### 默认账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 学生 | （界面注册） | — |
| 管理员 | `admin` | `admin123` |

## 📦 打包发布

### 构建独立可执行文件（Windows）

```bash
pip install pyinstaller
pyinstaller --clean pyinstaller.spec
```

打包产物包含 Python 运行时、全部依赖和静态资源，目标机器无需安装 Python。

### 构建纯前端单文件版

```bash
python build.py
```

生成 `dist/Python基础闯关_正式版.html` — 自包含 HTML 文件，完全在浏览器中运行，无需服务端。

## 🛠 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | 原生 HTML5、CSS3、JavaScript（ES 模块） |
| 后端 API | FastAPI、Uvicorn |
| 数据库 | SQLite（SQLAlchemy ORM） |
| 认证 | JWT（python-jose）+ bcrypt 密码哈希 |
| 实时通信 | WebSocket（原生 `ws://`），指数退避自动重连 |
| 管理后台 | 原生 JS SPA + Chart.js 图表 |
| 打包 | PyInstaller（便携 .exe）+ 自定义构建管线 |

## 📁 项目结构

```
Python-Adventure-Game/
├─ dev/                        # 前端源码
│  ├─ index.html               # 单页游戏骨架
│  ├─ style.css                # 样式、动画、响应式布局
│  ├─ data/                    # 游戏内容（单元、题库、成就）
│  │  ├─ 00_units.js           # 单元定义与关卡配置
│  │  ├─ 10_unit1_questions.js # 第一单元：运算符进阶
│  │  ├─ 11_unit2_questions.js # 第二单元：If语句基础
│  │  ├─ 20_unit_maps.js       # 关卡-题目映射
│  │  └─ 30_achievements.js    # 成就定义
│  ├─ game/                    # 游戏引擎
│  │  ├─ 00_core.js            # 工具函数与常量
│  │  ├─ 10_state.js           # 游戏状态与 localStorage 持久化
│  │  ├─ 20_app.js             # 主游戏流程与界面渲染
│  │  ├─ 30_devtools.js        # 开发者控制台
│  │  ├─ 40_api.js             # 后端 API 客户端
│  │  └─ 50_admin.js           # 管理后台客户端
│  └─ admin/                   # 教师管理后台 SPA
│     ├─ index.html            # 后台骨架
│     ├─ admin.js              # 后台逻辑与 WebSocket 客户端
│     ├─ admin.css             # 后台样式
│     └─ lib/chart.umd.js      # Chart.js 图表库
├─ server/                     # 后端（FastAPI）
│  ├─ main.py                  # 应用入口、生命周期、静态文件挂载
│  ├─ config.py                # 环境变量配置
│  ├─ database.py              # SQLAlchemy 引擎与会话工厂
│  ├─ auth.py                  # JWT 签发、校验、密码哈希
│  ├─ dependencies.py          # FastAPI 依赖注入（get_current_user 等）
│  ├─ models/                  # SQLAlchemy ORM 模型
│  │  ├─ user.py               # User、AdminAction
│  │  ├─ question.py           # Question、Unit、Level
│  │  ├─ record.py             # AnswerRecord、UserStats
│  │  └─ achievement.py        # Achievement、UserAchievement
│  ├─ schemas/                 # Pydantic 请求/响应模型
│  ├─ routers/                 # API 路由
│  │  ├─ auth.py               # POST /api/auth/register、/login
│  │  ├─ units.py              # GET /api/units
│  │  ├─ questions.py          # GET /api/questions
│  │  ├─ records.py            # POST /api/records、/sync-state
│  │  ├─ scores.py             # GET /api/scores
│  │  ├─ achievements.py       # GET /api/achievements、POST /sync
│  │  ├─ leaderboard.py        # GET /api/leaderboard
│  │  ├─ admin.py              # GET /api/admin/*
│  │  ├─ online.py             # WebSocket /ws/online
│  │  └─ import_questions.py   # POST /api/import/questions
│  ├─ services/                # 业务逻辑层
│  │  ├─ achievement_service.py
│  │  └─ stats_service.py
│  ├─ seed/                    # 数据库预置与题库提取
│  └─ tests/                   # pytest 测试套件
├─ tools/
│  └─ validate_data.py         # 题库完整性校验
├─ build.py                    # 前端单文件构建管线
├─ build.bat                   # Windows 构建辅助
├─ pyinstaller.spec            # PyInstaller 打包配置
├─ requirements.txt            # Python 依赖
├─ CHANGELOG.md                # 更新日志
└─ 更新日志/                    # 详细更新记录（中文）
```

## 📡 API 参考

### 认证

| Method | Endpoint | 说明 |
|---|---|---|
| `POST` | `/api/auth/register` | 注册学生账号 |
| `POST` | `/api/auth/login` | 登录，返回 JWT Token |
| `GET` | `/api/auth/me` | 获取当前用户信息 |

### 游戏内容

| Method | Endpoint | 说明 |
|---|---|---|
| `GET` | `/api/units` | 获取全部学习单元及关卡元数据 |
| `GET` | `/api/questions?unit_id=&level=` | 获取指定关卡题目 |
| `GET` | `/api/achievements` | 获取全部可解锁成就 |

### 进度与记录

| Method | Endpoint | 说明 |
|---|---|---|
| `POST` | `/api/records/submit` | 提交答案并评分 |
| `POST` | `/api/records/sync-state` | 双向同步完整游戏进度（星级、解锁、统计） |
| `GET` | `/api/records/mistakes` | 获取错题历史 |
| `POST` | `/api/achievements/sync` | 同步已解锁成就至服务端 |

### 排行榜与管理

| Method | Endpoint | 说明 |
|---|---|---|
| `GET` | `/api/leaderboard` | 全局积分排行榜 |
| `GET` | `/api/admin/dashboard` | 仪表盘概览（学生数、答题统计） |
| `GET` | `/api/admin/students` | 学生列表（含进度与在线状态） |
| `GET` | `/api/admin/actions` | 管理员操作审计日志 |

### 实时通信

| Protocol | Endpoint | 说明 |
|---|---|---|
| `WS` | `/ws/online` | WebSocket 心跳 — 学生在线状态、管理员实时更新 |

### 健康检查

| Method | Endpoint | 说明 |
|---|---|---|
| `GET` | `/api/health` | 服务健康检查 |

## 🔧 配置

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `SECRET_KEY` | 自动生成 | JWT 签名密钥 |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy 数据库连接 |
| `ADMIN_USERNAME` | `admin` | 默认管理员账号 |
| `ADMIN_PASSWORD` | `admin123` | 默认管理员密码 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT 有效期（默认 24 小时） |

### 默认端口

- 主服务：`80`（权限不足时回退至 `8000`）
- WebSocket：同端口，路径 `/ws/online`

### 权限控制

角色：`student`、`admin`、`super_admin`

管理员权限范围：用户生命周期管理、题库导入、审计日志查看、仪表盘数据

## 🌐 部署

推荐在教室局域网主机上运行服务端，学生通过浏览器加入，无需安装客户端。

运维要点：

- 执行 `python -m server.main` 启动服务，自动检测局域网 IP 并打印访问地址
- 教师后台位于 `/admin` 路由（同一主机）；首次启动自动创建默认管理员账号
- 数据库文件（`app.db`）首次启动自动建表，启用 WAL 模式支持并发读写
- 开发环境下 `dev/` 中的前端资源由 FastAPI `StaticFiles` 直接挂载提供服务
- 生产打包使用 `pyinstaller --clean pyinstaller.spec` 生成独立 `.exe`
- 纯前端单文件版（`python build.py`）为无服务器降级方案，内联全部 CSS/JS 至单个便携页面
- 备份应覆盖 `app.db`（用户数据），无需备份 `dev/` 目录（静态内容）

## 🤝 贡献

内部项目流程，暂不接受公开 PR。团队贡献者应遵循：

1. 从 `main` 创建功能分支
2. 保持改动小而可审阅
3. 题库修改前执行 `python tools/validate_data.py`
4. 执行 `python -m pytest server/tests/` 验证后端完整性
5. 用户可见改动后更新 `CHANGELOG.md` 和 `更新日志/`
6. 将可复用的经验教训写回 `AGENTS.md`

## 📄 许可证

仅限内部教育使用。详见 [LICENSE](LICENSE)。
