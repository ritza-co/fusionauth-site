from flask import Flask, request, jsonify
from webhook_utils import verify_signature

app = Flask(__name__)

def handle_webhook(data):
    return {"status": "accepted", "event": data.get("type")}

@app.route("/webhook", methods=["POST"])
def webhook():
    payload = request.get_json()

    if not verify_signature(payload, request.headers):
        return jsonify({"error": "invalid signature"}), 403

    result = handle_webhook(payload)
    return jsonify(result), 200 