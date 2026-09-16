import pytest
import requests
from app import app

def get_token():
    res = requests.post("http://auth-service.local/login", json={
        "loginId": "test@example.com",
        "password": "secure123"
    })
    return res.json()["token"]

@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()

def test_create_payment_reference_exists(client):
    token = get_token()
    response = client.post(
        "/payments",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "reference" in data
    assert len(data["reference"]) == 36 