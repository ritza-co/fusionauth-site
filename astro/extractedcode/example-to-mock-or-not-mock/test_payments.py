import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()

def test_create_payment_with_mocked_user(client, monkeypatch):
    def mock_get_user_from_token(token):
        if token == "good-token":
            return {"id": "user_123", "email": "good@example.com"}
        elif token == "admin-token":
            return {"id": "admin_456", "email": "admin@example.com"}
        else:
            raise ValueError("Invalid token")

    monkeypatch.setattr("app.get_user_from_token", mock_get_user_from_token)

    response = client.post("/payments", headers={"Authorization": "Bearer good-token"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["user_id"] == "user_123"
    assert "reference" in data
    assert len(data["reference"]) == 36
    assert "id" in data
    assert len(data["id"]) == 36 