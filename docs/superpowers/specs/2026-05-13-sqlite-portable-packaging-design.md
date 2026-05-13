# SQLite 便携打包设计

## 目标

- 数据库用 SQLite，移除 Docker/PostgreSQL
- 用 PyInstaller 打包成单 exe，Windows 运行
- 端口 80，教师机启动，学生机浏览器访问
- 前端接入后端 API，数据统一存教师机
- 支持题库 JSON 导入

## 架构

```
教师机 (game.exe)
├── FastAPI (uvicorn :80)
│   ├── /          静态前端 (dev/)
│   └── /api/*     业务接口
└── SQLite (app.db)

学生机 (浏览器)
└── http://教师机IP → 前端 → fetch('/api/...') → SQLite
```

## 改动清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 删除 | Dockerfile, docker-compose.yml | 移除 Docker |
| 删除 | 依赖 psycopg2-binary | 不需要 PostgreSQL |
| 修改 | server/main.py | 端口80、挂载静态文件、打开浏览器、显示IP |
| 修改 | server/config.py | SQLite 路径调整为可执行文件同级 |
| 新增 | dev/game/40_api.js | 前端 API 层 |
| 新增 | dev/game/50_admin.js | 管理页面 |
| 新增 | server/routers/import_questions.py | 题库导入接口 |
| 新增 | docs/题库导入格式规范.md | 导入格式规范 |
| 新增 | pyinstaller.spec | PyInstaller 配置 |
| 新增 | build.bat | 打包脚本 |
