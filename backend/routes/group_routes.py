"""Group management routes with rate limiting and pagination."""

from flask import Blueprint, current_app
from backend.controllers.group_controller import GroupController

group_bp = Blueprint('group', __name__, url_prefix='/api')


@group_bp.route('/groups', methods=['GET'])
def get_groups():
    """Get all groups endpoint with caching and pagination."""
    limiter = current_app.limiter
    limiter.limit("30 per minute")(lambda: None)()
    return GroupController.get_groups()


@group_bp.route('/groups', methods=['POST'])
def create_group():
    """Create group endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("10 per hour")(lambda: None)()
    return GroupController.create_group()


@group_bp.route('/groups/search', methods=['GET'])
def search_groups():
    """Search groups endpoint."""
    limiter = current_app.limiter
    limiter.limit("30 per minute")(lambda: None)()
    return GroupController.search_groups()


@group_bp.route('/groups/user/<string:email>', methods=['GET'])
def get_user_groups(email):
    """Get user groups endpoint with caching."""
    limiter = current_app.limiter
    limiter.limit("30 per minute")(lambda: None)()
    return GroupController.get_user_groups(email)


@group_bp.route('/groups/join', methods=['POST'])
def join_group():
    """Join group endpoint with rate limiting."""
    limiter = current_app.limiter
    limiter.limit("10 per hour")(lambda: None)()
    return GroupController.join_group()


@group_bp.route('/groups/<int:group_id>/leave', methods=['POST'])
def leave_group(group_id):
    """Leave group endpoint."""
    limiter = current_app.limiter
    limiter.limit("20 per hour")(lambda: None)()
    return GroupController.leave_group(group_id)


@group_bp.route('/notifications/<string:email>', methods=['GET'])
def get_notifications(email):
    """Get notifications endpoint with pagination."""
    limiter = current_app.limiter
    limiter.limit("30 per minute")(lambda: None)()
    return GroupController.get_notifications(email)
