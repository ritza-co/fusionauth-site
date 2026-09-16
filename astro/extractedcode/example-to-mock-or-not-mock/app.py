import uuid
import requests
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

def get_user_from_token(token):
    response = requests.get("http://auth-service.local/validate", headers={
        "Authorization": f"Bearer {token}"
    })
    if response.status_code != 200:
        abort(401)
    return response.json()

def create_payment_for_user(user):
    if not user or not user.get("id"):
        raise PermissionError("User must be authenticated to create payment")
    return {
        "id": str(uuid.uuid4()),
        "reference": str(uuid.uuid4()),
        "user_id": user["id"]
    }

@app.route("/payments", methods=["POST"])
def create_payment():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = get_user_from_token(token)
    payment = create_payment_for_user(user)
    return jsonify(payment), 201

if __name__ == '__main__':
    app.run(debug=True) 