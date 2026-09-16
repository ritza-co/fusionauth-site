import pytest
from app import app
from flask import abort

@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()

def test_locked_user_auth(client, monkeypatch):
    def mock_get_user_from_token(token):
        abort(403, description="Account locked")

    monkeypatch.setattr("app.get_user_from_token", mock_get_user_from_token)

    response = client.post(
        "/payments",
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 403
    assert b"Account locked" in response.data 