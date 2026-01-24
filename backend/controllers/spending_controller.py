"""Spending controller for targets, expenses, and insights."""

from flask import request, jsonify
from datetime import datetime, timedelta
from backend.models.spending_target_model import SpendingTarget
from backend.models.expense_model import Expense
from backend.models.spending_insight_model import SpendingInsight
from backend.models.notification_model import Notification
from backend.models.user_model import User


class SpendingController:
    """Controller for spending management operations."""

    @staticmethod
    def create_target():
        """Create a new spending target."""
        data = request.get_json()
        email = data.get('email')
        group_id = data.get('group_id')
        target_amount = data.get('target_amount')
        period_type = data.get('period_type')

        if not all([email, group_id, target_amount, period_type]):
            return jsonify({'message': 'All fields are required'}), 400

        # Get user ID from email
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = SpendingTarget.create(user['id'], group_id, target_amount, period_type)

        if result['success']:
            return jsonify({
                'message': 'Spending target created successfully',
                'target_id': result['target_id']
            }), 201
        else:
            return jsonify({'message': result['message']}), 500

    @staticmethod
    def get_user_targets(email):
        """Get all spending targets for a user."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        targets = SpendingTarget.get_user_targets(user['id'])
        return jsonify({'targets': targets}), 200

    @staticmethod
    def delete_target(target_id):
        """Delete a spending target."""
        data = request.get_json()
        email = data.get('email')

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = SpendingTarget.delete_target(target_id, user['id'])
        
        if result['success']:
            return jsonify({'message': 'Target deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete target'}), 500

    @staticmethod
    def create_expense():
        """Create a new expense and check target."""
        data = request.get_json()
        email = data.get('email')
        group_id = data.get('group_id')
        amount = data.get('amount')
        category = data.get('category', 'other')
        description = data.get('description', '')
        expense_date = data.get('expense_date', datetime.now().isoformat())

        if not all([email, group_id, amount]):
            return jsonify({'message': 'Email, group_id, and amount are required'}), 400

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Create expense
        result = Expense.create(group_id, user['id'], amount, category, description, expense_date)

        if not result['success']:
            return jsonify({'message': result['message']}), 500

        # Check if user has an active target
        active_target = SpendingTarget.get_active_target(user['id'], group_id)
        
        notifications_created = []
        if active_target:
            # Calculate total spending in the target period
            total_spending = Expense.get_total_spending(
                user['id'], group_id,
                active_target['start_date'],
                active_target['end_date']
            )

            target_amount = active_target['target_amount']
            
            # Check if overspent
            if total_spending > target_amount:
                overspent_percentage = ((total_spending - target_amount) / target_amount) * 100
                message = f"⚠️ You've exceeded your {active_target['period_type']}ly target by {overspent_percentage:.1f}%! " \
                         f"Spent: ${total_spending:.2f} / Target: ${target_amount:.2f}"
                
                Notification.create(user['id'], group_id, message)
                notifications_created.append(message)
            elif total_spending > target_amount * 0.8:
                # Warn when 80% of target reached
                percentage_used = (total_spending / target_amount) * 100
                message = f"⚠️ You've used {percentage_used:.1f}% of your {active_target['period_type']}ly budget. " \
                         f"Spent: ${total_spending:.2f} / Target: ${target_amount:.2f}"
                
                Notification.create(user['id'], group_id, message)
                notifications_created.append(message)

        return jsonify({
            'message': 'Expense created successfully',
            'expense_id': result['expense_id'],
            'notifications': notifications_created
        }), 201

    @staticmethod
    def get_user_expenses(email, group_id):
        """Get expenses for a user in a group."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Optional date filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        expenses = Expense.get_user_expenses(user['id'], group_id, start_date, end_date)
        return jsonify({'expenses': expenses}), 200

    @staticmethod
    def get_spending_summary(email, group_id):
        """Get spending summary for a user."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Calculate date ranges
        today = datetime.now()
        current_month_start = today.replace(day=1, hour=0, minute=0, second=0)
        current_week_start = today - timedelta(days=today.weekday())

        # Get spending totals
        month_total = Expense.get_total_spending(
            user['id'], group_id,
            current_month_start.isoformat(),
            today.isoformat()
        )

        week_total = Expense.get_total_spending(
            user['id'], group_id,
            current_week_start.isoformat(),
            today.isoformat()
        )

        day_total = Expense.get_total_spending(
            user['id'], group_id,
            today.replace(hour=0, minute=0, second=0).isoformat(),
            today.isoformat()
        )

        # Get active target
        active_target = SpendingTarget.get_active_target(user['id'], group_id)

        # Get category breakdown
        categories = Expense.get_spending_by_category(
            user['id'], group_id,
            current_month_start.isoformat(),
            today.isoformat()
        )

        return jsonify({
            'month_total': month_total,
            'week_total': week_total,
            'day_total': day_total,
            'active_target': active_target,
            'categories': categories
        }), 200

    @staticmethod
    def get_insights(email, group_id):
        """Get AI-lite spending insights."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Generate new insights
        new_insights = SpendingInsight.generate_insights(user['id'], group_id)

        # Get stored insights
        stored_insights = SpendingInsight.get_user_insights(user['id'], group_id, limit=20)

        return jsonify({
            'new_insights': new_insights,
            'all_insights': stored_insights
        }), 200

    @staticmethod
    def check_period_end():
        """Check and notify users when their spending period ends."""
        # This would be called by a scheduled task
        # For now, it can be triggered manually or by a cron job
        pass
