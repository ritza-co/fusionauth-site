from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def login():
    return jsonify({"token": "test-token", "user": {"id": "user_123"}})

@app.route("/validate", methods=["GET"])
def validate():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token == "test-token":
        return jsonify({"id": "user_123", "email": "test@example.com"})
    return jsonify({"error": "invalid token"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001) 