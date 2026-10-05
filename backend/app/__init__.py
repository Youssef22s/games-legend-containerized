import os

from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    CORS(app)

    app.config["HEALTHY"] = True

    @app.route("/health", methods=["GET"])
    def health():
        if app.config["HEALTHY"]:
            return {"status": "healthy"}, 200
        return {"status": "unhealthy"}, 500

    @app.route("/unhealthy", methods=["GET"])
    def make_unhealthy():
        app.config["HEALTHY"] = False
        return {"status": "unhealthy mode enabled"}, 200

    @app.route("/fix", methods=["GET"])
    def fix_health():
        app.config["HEALTHY"] = True
        return {"status": "healthy mode enabled"}, 200

    app.config["SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    from .auth import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from .admin import admin_bp

    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    from .products import products_bp

    app.register_blueprint(products_bp, url_prefix="/api/products")

    from .categories import categories_bp

    app.register_blueprint(categories_bp, url_prefix="/api/categories")

    from .cart import cart_bp

    app.register_blueprint(cart_bp, url_prefix="/api/cart")

    from .payment import payment_bp

    app.register_blueprint(payment_bp, url_prefix="/api/payment")

    from .buyer_profile import buyer_profile_bp

    app.register_blueprint(buyer_profile_bp, url_prefix="/api/buyer_profile")

    from .notifications import notifications_bp

    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    from .vendor import vendor_bp

    app.register_blueprint(vendor_bp, url_prefix="/api/vendor")

    return app
