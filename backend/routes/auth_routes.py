"""Authentication routes with rate limiting."""

from flask import Blueprint, current_app
from backend.controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("5 per minute")(lambda: None)()
    return AuthController.register()


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("10 per minute")(lambda: None)()
    return AuthController.login()


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Forgot password endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("3 per hour")(lambda: None)()
    return AuthController.forgot_password()


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("5 per hour")(lambda: None)()
    return AuthController.reset_password()
