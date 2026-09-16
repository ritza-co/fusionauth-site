import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()

def test_webhook_with_mocked_signature(client, monkeypatch):
    def mock_verify_signature(payload, signature):
        return True  # Always accept during tests

    monkeypatch.setattr("app.verify_signature", mock_verify_signature)

    payload = {
        "type": "invoice.created",
        "invoice_id": "inv_001"
    }

    response = client.post(
        "/webhook",
        json=payload,
        headers={"svix-signature": "fake-signature"}
    )

    assert response.status_code == 200
    assert response.get_json()["status"] == "accepted"
    assert response.get_json()["event"] == "invoice.created" 