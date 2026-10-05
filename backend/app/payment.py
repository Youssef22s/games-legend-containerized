import os
import stripe
from flask import Blueprint, jsonify
from .db import get_db_connection
from .utils import buyer_required

payment_bp = Blueprint("payment", __name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@payment_bp.route("/create-checkout-session", methods=["POST"])
@buyer_required
def create_checkout_session(current_user):
    buyer_id = current_user.get("user_id")

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT c.quantity, p.title, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.buyer_id = %s
        """,
            (buyer_id,),
        )
        cart_items = cursor.fetchall()

        if not cart_items:
            return jsonify({"error": "Your cart is empty!"}), 400

        line_items = []
        for item in cart_items:
            line_items.append(
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": item["title"],
                        },
                        "unit_amount": int(float(item["price"]) * 100),
                    },
                    "quantity": item["quantity"],
                }
            )

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{frontend_url}/success.html",
            cancel_url=f"{frontend_url}/cart.html",
        )

        return jsonify({"url": session.url}), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@payment_bp.route("/finalize-order", methods=["POST"])
@buyer_required
def finalize_order(current_user):
    buyer_id = current_user.get("user_id")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.buyer_id = %s
        """,
            (buyer_id,),
        )

        cart_items = cursor.fetchall()

        if not cart_items:
            return jsonify({"message": "Cart is already empty"}), 200

        total_amount = sum(item["price"] * item["quantity"] for item in cart_items)

        cursor.execute(
            "INSERT INTO orders (buyer_id, total_amount) VALUES (%s, %s)",
            (buyer_id, total_amount),
        )

        order_id = cursor.lastrowid

        for item in cart_items:
            cursor.execute(
                """
                INSERT INTO order_items
                (order_id, product_id, quantity, price_at_purchase)
                VALUES (%s, %s, %s, %s)
            """,
                (order_id, item["product_id"], item["quantity"], item["price"]),
            )

        cursor.execute("DELETE FROM cart WHERE buyer_id = %s", (buyer_id,))

        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        admin = cursor.fetchone()

        if admin:
            notification_message = (
                f"New order #{order_id} has been placed for ${total_amount}"
            )
            cursor.execute(
                """
                    INSERT INTO notifications (user_id, message, order_id) 
                    VALUES (%s, %s, %s)""",
                (admin["id"], notification_message, order_id),
            )

        db.commit()

        return (
            jsonify({"message": "Order created successfully", "order_id": order_id}),
            201,
        )

    except Exception as e:
        db.rollback()

        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()