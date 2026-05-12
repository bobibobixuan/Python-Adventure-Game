from server.tests.conftest import client, TestingSessionLocal
from server.models.unit import Unit, Level
from server.models.question import Question


def _seed_unit_and_level():
    db = TestingSessionLocal()
    unit = Unit(id=1, name="Test Unit", icon="📝", sort_order=0)
    db.add(unit)
    db.flush()
    level = Level(id=1, unit_id=1, name="Test Level", icon="📝", bg="🏰", sort_order=0)
    db.add(level)
    db.flush()
    q = Question(
        level_id=1, type="选择题", content="What is 2+2?",
        options=[{"letter": "A", "text": "3"}, {"letter": "B", "text": "4"}],
        answer="B", knowledge_meaning="2+2=4", knowledge_rule="addition",
        knowledge_error="don't guess", knowledge_example="2+2=4", sort_order=0,
    )
    db.add(q)
    db.commit()
    db.close()


def test_get_questions(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/questions/levels/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["type"] == "选择题"
    assert data[0]["answer"] == "B"
    assert data[0]["knowledge"]["meaning"] == "2+2=4"


def test_get_questions_not_found(auth_headers):
    resp = client.get("/api/questions/levels/999", headers=auth_headers)
    assert resp.status_code == 404


def test_list_units(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/units/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Unit"


def test_list_levels(auth_headers):
    _seed_unit_and_level()
    resp = client.get("/api/units/1/levels", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Level"
