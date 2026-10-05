from flask import Blueprint, request, jsonify
from .db import get_db_connection
from .utils import buyer_required

buyer_profile_bp = Blueprint("buyer_profile", __name__)


@buyer_profile_bp.route("/info", methods=["GET", "PUT"])
@buyer_required
def manage_profile(current_user):
    user_id = current_user.get("user_id")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        if request.method == "GET":
            cursor.execute(
                "SELECT username, email FROM users WHERE id = %s", (user_id,)
            )

            user = cursor.fetchone()
            return jsonify(user), 200

        if request.method == "PUT":
            data = request.json
            new_name = data.get("username")

            if not new_name or len(new_name.strip()) < 3:
                return (
                    jsonify({"error": "Username must be at least 3 characters long"}),
                    400,
                )

            cursor.execute(
                "UPDATE users SET username = %s WHERE id = %s",
                (new_name.strip(), user_id),
            )

            db.commit()

            return (
                jsonify(
                    {"message": "Profile updated successfully", "username": new_name}
                ),
                200,
            )

    except Exception as e:
        db.rollback()

        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@buyer_profile_bp.route("/orders", methods=["GET"])
@buyer_required
def get_order_history(current_user):
    buyer_id = current_user.get("user_id")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT 
                o.id,
                o.total_amount,
                o.created_at,
                o.status,
                GROUP_CONCAT(
                    CONCAT(
                        p.title,
                        ' (x',
                        oi.quantity,
                        ')'
                    )
                    SEPARATOR ' | '
                ) AS items
            FROM orders o
            LEFT JOIN order_items oi
                ON o.id = oi.order_id
            LEFT JOIN products p
                ON oi.product_id = p.id
            WHERE o.buyer_id = %s
            GROUP BY o.id
            ORDER BY o.created_at DESC
        """,
            (buyer_id,),
        )

        orders = cursor.fetchall()

        return jsonify(orders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()
