from flask import Blueprint, jsonify
from .db import get_db_connection

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("/", methods=["GET"])
def get_categories():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM categories")
        categories = cursor.fetchall()
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()
