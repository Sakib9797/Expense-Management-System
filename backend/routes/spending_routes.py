"""Spending routes for targets, expenses, and insights."""

from flask import Blueprint
from backend.controllers.spending_controller import SpendingController

spending_bp = Blueprint('spending', __name__, url_prefix='/api/spending')


# Spending Target Routes
@spending_bp.route('/targets', methods=['POST'])
def create_target():
    """Create a new spending target."""
    return SpendingController.create_target()


@spending_bp.route('/targets/<string:email>', methods=['GET'])
def get_user_targets(email):
    """Get all targets for a user."""
    return SpendingController.get_user_targets(email)


@spending_bp.route('/targets/<int:target_id>', methods=['DELETE'])
def delete_target(target_id):
    """Delete a spending target."""
    return SpendingController.delete_target(target_id)


# Expense Routes
@spending_bp.route('/expenses', methods=['POST'])
def create_expense():
    """Create a new expense."""
    return SpendingController.create_expense()


@spending_bp.route('/expenses/<string:email>/<int:group_id>', methods=['GET'])
def get_user_expenses(email, group_id):
    """Get expenses for a user in a group."""
    return SpendingController.get_user_expenses(email, group_id)


@spending_bp.route('/summary/<string:email>/<int:group_id>', methods=['GET'])
def get_spending_summary(email, group_id):
    """Get spending summary."""
    return SpendingController.get_spending_summary(email, group_id)


# Insights Routes
@spending_bp.route('/insights/<string:email>/<int:group_id>', methods=['GET'])
def get_insights(email, group_id):
    """Get AI-lite spending insights."""
    return SpendingController.get_insights(email, group_id)
