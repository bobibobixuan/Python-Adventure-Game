from server.tests.conftest import client, TestingSessionLocal
from server.models.unit import Unit, Level
from server.models.question import Question


def _seed_question():
    db = TestingSessionLocal()
    unit = Unit(id=1, name="Test Unit", icon="📝", sort_order=0)
    db.add(unit)
    db.flush()
    level = Level(id=1, unit_id=1, name="Test Level", icon="📝", bg="🏰", sort_order=0)
    db.add(level)
    db.flush()
    q = Question(
        id=1, level_id=1, type="填空题", content="2+2=?",
        answer="4", knowledge_meaning="", knowledge_rule="",
        knowledge_error="", knowledge_example="", sort_order=0,
    )
    db.add(q)
    db.commit()
    db.close()


def test_submit_answer(auth_headers):
    _seed_question()
    resp = client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1,
        "user_answer": "4",
        "is_correct": True,
        "time_spent": 3.5,
        "mode": "adventure",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_get_summary(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "4", "is_correct": True,
        "time_spent": 2.0, "mode": "adventure",
    })
    resp = client.get("/api/records/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_questions"] == 1
    assert data["total_correct"] == 1


def test_get_wrong_questions(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "3", "is_correct": False,
        "time_spent": 5.0, "mode": "adventure",
    })
    resp = client.get("/api/records/wrong", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["user_answer"] == "3"


def test_leaderboard(auth_headers):
    _seed_question()
    client.post("/api/records/answer", headers=auth_headers, json={
        "question_id": 1, "user_answer": "4", "is_correct": True,
        "time_spent": 1.0, "mode": "adventure",
    })
    resp = client.get("/api/leaderboard/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


def test_admin_dashboard(admin_headers):
    resp = client.get("/api/admin/dashboard", headers=admin_headers)
    assert resp.status_code == 200
    assert "user_count" in resp.json()
