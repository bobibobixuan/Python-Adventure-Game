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
