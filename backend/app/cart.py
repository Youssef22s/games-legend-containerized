from flask import Blueprint, request, jsonify
from .db import get_db_connection
from .utils import buyer_required

cart_bp = Blueprint("cart", __name__)


@cart_bp.route("/", methods=["POST"])
@buyer_required
def add_to_cart(current_user):
    print("current_user", current_user)
    buyer_id = current_user.get("user_id")
    data = request.get_json()
    product_id = data.get("product_id")

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "SELECT id FROM cart WHERE buyer_id=%s AND product_id=%s",
            (buyer_id, product_id),
        )
        item = cursor.fetchone()

        if item:
            cursor.execute(
                "UPDATE cart SET quantity = quantity + 1 WHERE id=%s", (item[0],)
            )
        else:
            cursor.execute(
                "INSERT INTO cart (buyer_id, product_id) VALUES (%s, %s)",
                (buyer_id, product_id),
            )

        db.commit()
        return jsonify({"message": "Added to cart successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@cart_bp.route("/", methods=["GET"])
@buyer_required
def get_cart(current_user):
    buyer_id = current_user.get("user_id")

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        sql = """
            SELECT 
                c.id AS cart_id,
                c.quantity,
                p.id AS product_id,
                p.title,
                p.price,
                p.description
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.buyer_id = %s
        """

        cursor.execute(sql, (buyer_id,))
        cart_items = cursor.fetchall()

        return jsonify(cart_items), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@cart_bp.route("/<int:cart_id>", methods=["DELETE"])
@buyer_required
def remove_from_cart(current_user, cart_id):
    buyer_id = current_user.get("user_id")

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM cart WHERE id=%s AND buyer_id=%s", (cart_id, buyer_id)
        )

        db.commit()

        return jsonify({"message": "Product removed from cart"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()
