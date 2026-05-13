from server.tests.conftest import client


def test_dashboard_requires_admin(auth_headers):
    resp = client.get("/api/admin/dashboard", headers=auth_headers)
    assert resp.status_code == 403


def test_dashboard_as_admin(admin_headers):
    resp = client.get("/api/admin/dashboard", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "user_count" in data
    assert "avg_accuracy" in data
    assert "daily_trend" in data
    assert "unit_accuracy" in data


def test_student_list_pagination(admin_headers):
    resp = client.get(
        "/api/admin/students?page=1&page_size=10", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert data["page"] == 1
    assert data["page_size"] == 10


def test_student_list_search(admin_headers):
    resp = client.get(
        "/api/admin/students?search=nonexistent_xyz", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0


def test_student_detail_not_found(admin_headers):
    resp = client.get("/api/admin/students/99999", headers=admin_headers)
    assert resp.status_code == 404


def test_student_detail_exists(admin_headers, auth_headers):
    user_resp = client.get("/api/records/summary", headers=auth_headers)
    assert user_resp.status_code == 200

    list_resp = client.get(
        "/api/admin/students?page_size=100", headers=admin_headers
    )
    users = list_resp.json()["items"]
    test_user = next((u for u in users if u["username"] == "testuser"), None)
    assert test_user is not None, "testuser not found in student list"
    user_id = test_user["user_id"]

    resp = client.get(f"/api/admin/students/{user_id}", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == user_id
    assert "summary" in data
    assert "unit_progress" in data
    assert "recent_answers" in data
    assert "wrong_questions" in data


def test_level_analytics(admin_headers):
    resp = client.get("/api/admin/analytics/levels", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_wrong_question_stats(admin_headers):
    resp = client.get(
        "/api/admin/analytics/wrong-questions?limit=10", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) <= 10
