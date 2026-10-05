from flask import Blueprint, request, jsonify
from .db import get_db_connection
from .utils import vendor_required

products_bp = Blueprint("products", __name__)


@products_bp.route("/", methods=["GET", "OPTIONS"])
@vendor_required
def get_my_products(current_user):

    vendor_id = current_user.get("user_id")

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        sql = """
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.vendor_id = %s
        """
        cursor.execute(sql, (vendor_id,))
        products = cursor.fetchall()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@products_bp.route("/", methods=["POST", "OPTIONS"])
@vendor_required
def add_product(current_user):
    vendor_id = current_user.get("user_id")
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    price = data.get("price")
    category_id = data.get("category_id")

    if not title or not price:
        return jsonify({"error": "Title and Price are required"}), 400

    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = "INSERT INTO products (vendor_id, category_id, title, description, price) VALUES (%s, %s, %s, %s, %s)"
        val = (vendor_id, category_id, title, description, price)
        cursor.execute(sql, val)
        db.commit()
        return jsonify({"message": "Product added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@products_bp.route("/<int:product_id>", methods=["PUT", "OPTIONS"])
@vendor_required
def edit_product(current_user, product_id):
    vendor_id = current_user.get("user_id")
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    price = data.get("price")
    category_id = data.get("category_id")

    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = "UPDATE products SET title=%s, description=%s, price=%s, category_id=%s WHERE id=%s AND vendor_id=%s"
        val = (title, description, price, category_id, product_id, vendor_id)
        cursor.execute(sql, val)
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found or not yours"}), 404

        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@products_bp.route("/<int:product_id>", methods=["DELETE", "OPTIONS"])
@vendor_required
def delete_product(current_user, product_id):
    vendor_id = current_user.get("user_id")
    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = "DELETE FROM products WHERE id=%s AND vendor_id=%s"
        cursor.execute(sql, (product_id, vendor_id))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found or not yours"}), 404

        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()


@products_bp.route("/all", methods=["GET"])
def get_all_products():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        sql = """
            SELECT p.id, p.title, p.description, p.price, 
                   c.name as category_name, 
                   u.username as vendor_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.vendor_id = u.id
            ORDER BY p.id DESC
        """
        cursor.execute(sql)
        products = cursor.fetchall()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        sql = """
            SELECT p.*, c.name as category_name, u.username as vendor_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.vendor_id = u.id
            WHERE p.id = %s
        """
        cursor.execute(sql, (product_id,))
        product = cursor.fetchone()
        
        if product:
            return jsonify(product), 200
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'db' in locals(): db.close()