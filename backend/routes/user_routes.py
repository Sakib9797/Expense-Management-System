"""User profile routes."""

from flask import Blueprint
from backend.controllers.user_controller import UserController

user_bp = Blueprint('user', __name__, url_prefix='/api')


@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile endpoint."""
    return UserController.update_profile()
