from flask import Blueprint, jsonify

from .db import get_db_connection
from .utils import vendor_required

vendor_bp = Blueprint("vendor", __name__)


@vendor_bp.route("/orders", methods=["GET"])
@vendor_required
def get_vendor_orders(current_user):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        vendor_id = current_user["user_id"]

        cursor.execute(
            """
            SELECT 
                o.id AS order_id, 
                o.created_at, 
                o.status, 
                u.username AS buyer_name, 
                p.title AS product_title, 
                oi.quantity, 
                oi.price_at_purchase, 
                (oi.quantity * oi.price_at_purchase) AS total_earned
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN users u ON o.buyer_id = u.id
            WHERE p.vendor_id = %s
            ORDER BY o.created_at DESC
        """,
            (vendor_id,),
        )

        orders = cursor.fetchall()
        return jsonify(orders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()
