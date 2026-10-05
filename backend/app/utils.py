from functools import wraps
from flask import request, jsonify, current_app
import jwt


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split()
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            data = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            if data.get("role") != "admin":
                return jsonify({"error": "Admin privileges required!"}), 403
        except Exception as e:
            return jsonify({"error": "Token is invalid!"}), 401

        return f(*args, **kwargs)

    return decorated


def vendor_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        token = None
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split()
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            current_user = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            if current_user.get("role") != "vendor":
                return jsonify({"error": "Vendor privileges required!"}), 403
        except Exception as e:
            return jsonify({"error": "Token is invalid!"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def buyer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split()
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            current_user = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            if current_user.get("role") not in ["buyer", None]:
                return jsonify({"error": "Buyer privileges required!"}), 403

        except Exception as e:
            return jsonify({"error": "Token is invalid!"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
