from flask import Blueprint, jsonify
from .db import get_db_connection
from .utils import admin_required

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/", methods=["GET"])
@admin_required
def get_notifications():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT *
            FROM notifications 
            ORDER BY created_at DESC 
            LIMIT 10
            """
        )
        notifications = cursor.fetchall()

        cursor.execute(
            """
            SELECT COUNT(*) as unread_count 
            FROM notifications 
            WHERE is_read = FALSE
            """
        )
        unread_count = cursor.fetchone()["unread_count"]

        return jsonify({
            "notifications": notifications,
            "unread_count": unread_count
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@admin_required
def mark_as_read(notif_id):
    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = %s
            """,
            (notif_id,) 
        )
        db.commit()

        return jsonify({"message": "Marked as read"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()