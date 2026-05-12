from server.tests.conftest import client


def test_register():
    resp = client.post("/api/auth/register", json={
        "username": "newuser",
        "password": "pass123456",
        "nickname": "New User",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "newuser"


def test_register_duplicate():
    client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "pass123456",
        "nickname": "Dup",
    })
    resp = client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "pass123456",
        "nickname": "Dup2",
    })
    assert resp.status_code == 409


def test_login(auth_headers):
    assert auth_headers is not None
    assert auth_headers["Authorization"].startswith("Bearer ")


def test_login_wrong_password():
    client.post("/api/auth/register", json={
        "username": "wrongpw",
        "password": "correct123",
        "nickname": "WP",
    })
    resp = client.post("/api/auth/login", json={
        "username": "wrongpw",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_refresh_token():
    resp = client.post("/api/auth/register", json={
        "username": "refresher",
        "password": "pass123456",
        "nickname": "Ref",
    })
    refresh_token = resp.json()["refresh_token"]
    resp2 = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert resp2.status_code == 200
    assert "access_token" in resp2.json()


def test_unauthorized_access():
    resp = client.get("/api/units/")
    assert resp.status_code == 401
