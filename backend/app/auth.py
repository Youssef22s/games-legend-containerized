from flask import Blueprint, request, jsonify, current_app
import bcrypt
from flask_cors import CORS
import jwt
import mysql.connector
from marshmallow import ValidationError

from .db import get_db_connection
from .schemas import user_schema

auth_bp = Blueprint("auth", __name__)
CORS(auth_bp)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        valid_data = user_schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    username = valid_data["username"]
    email = valid_data["email"]
    password = valid_data["password"]

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    try:
        db = get_db_connection()
        cursor = db.cursor()

        sql = "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, 'buyer')"
        val = (username, email, hashed_password)

        cursor.execute(sql, val)
        db.commit()

        return jsonify({"message": "User registered successfully!"}), 201

    except mysql.connector.Error as err:
        return (
            jsonify(
                {"error": f"Database error (maybe username or email exists): {err}"}
            ),
            409,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals() and cursor is not None:
            cursor.close()
        if "db" in locals() and db.is_connected():
            db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (data["email"],))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(
            data["password"].encode("utf-8"), user["password"].encode("utf-8")
        ):

            token = jwt.encode(
                {"user_id": user["id"], "role": user["role"]},
                current_app.config["SECRET_KEY"],
                algorithm="HS256",
            )
            return (
                jsonify(
                    {
                        "token": token,
                        "message": "Login successful",
                        "role": user["role"],
                        "username": user["username"],
                    }
                ),
                200,
            )

        return jsonify({"error": "Invalid email or password"}), 401

    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals() and cursor is not None:
            cursor.close()
        if "db" in locals() and db.is_connected():
            db.close()
