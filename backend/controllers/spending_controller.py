"""Spending controller for targets, expenses, and insights."""

from flask import request, jsonify
from datetime import datetime, timedelta
from database.models.spending_target_model import SpendingTarget
from database.models.expense_model import Expense
from database.models.spending_insight_model import SpendingInsight
from database.models.notification_model import Notification
from database.models.user_model import User
from backend.ml.engine import MLEngine


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

        print(f"DEBUG: Create expense called - email={email}, group_id={group_id}, amount={amount}")

        if not all([email, group_id, amount]):
            return jsonify({'message': 'Email, group_id, and amount are required'}), 400

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        print(f"DEBUG: User found - id={user['id']}")

        # ML: auto-categorise if description provided and category is 'other' or missing
        ml_suggestion = None
        if description and category in ('other', '', None):
            try:
                ml_result = MLEngine.predict_category(description, user['id'], group_id)
                if ml_result['confidence'] >= 0.3:
                    category = ml_result['predicted_category']
                    ml_suggestion = ml_result
            except Exception:
                pass  # fallback to manual category

        # Create expense
        result = Expense.create(group_id, user['id'], amount, category, description, expense_date)

        if not result['success']:
            return jsonify({'message': result['message']}), 500

        print(f"DEBUG: Expense created - id={result['expense_id']}")

        # Check if user has an active target
        active_target = SpendingTarget.get_active_target(user['id'], group_id)
        
        print(f"DEBUG: Active target for user {user['id']} in group {group_id}: {active_target}")
        
        notifications_created = []
        if active_target:
            # Calculate total spending in the target period
            total_spending = Expense.get_total_spending(
                user['id'], group_id,
                active_target['start_date'],
                active_target['end_date']
            )

            target_amount = active_target['target_amount']
            percentage_used = (total_spending / target_amount) * 100
            
            print(f"DEBUG: Total spending: ${total_spending}, Target: ${target_amount}, Percentage: {percentage_used}%")
            
            # Check if exceeded target (100%)
            if total_spending > target_amount:
                overspent_amount = total_spending - target_amount
                overspent_percentage = ((total_spending - target_amount) / target_amount) * 100
                message = f"🚨 Budget Alert: You've exceeded your {active_target['period_type']}ly spending target by ${overspent_amount:.2f} ({overspent_percentage:.1f}%)! " \
                         f"Total spent: ${total_spending:.2f} / Target: ${target_amount:.2f}"
                
                print(f"DEBUG: Creating EXCEEDED notification: {message}")
                notif_created = Notification.create(user['id'], group_id, message)
                print(f"DEBUG: Notification created: {notif_created}")
                notifications_created.append({
                    'type': 'exceeded',
                    'message': message,
                    'percentage': percentage_used
                })
            
            # Warning at 90% threshold
            elif total_spending > target_amount * 0.9 and total_spending <= target_amount:
                remaining = target_amount - total_spending
                message = f"⚠️ Budget Warning: You've used {percentage_used:.1f}% of your {active_target['period_type']}ly budget. " \
                         f"Only ${remaining:.2f} remaining! Spent: ${total_spending:.2f} / Target: ${target_amount:.2f}"
                
                Notification.create(user['id'], group_id, message)
                notifications_created.append({
                    'type': 'warning_90',
                    'message': message,
                    'percentage': percentage_used
                })
            
            # Warning at 80% threshold
            elif total_spending > target_amount * 0.8 and total_spending <= target_amount * 0.9:
                remaining = target_amount - total_spending
                message = f"💡 Budget Notice: You've used {percentage_used:.1f}% of your {active_target['period_type']}ly budget. " \
                         f"${remaining:.2f} remaining. Spent: ${total_spending:.2f} / Target: ${target_amount:.2f}"
                
                Notification.create(user['id'], group_id, message)
                notifications_created.append({
                    'type': 'warning_80',
                    'message': message,
                    'percentage': percentage_used
                })

        # Generate spending behavior insights
        insights = SpendingInsight.generate_insights(user['id'], group_id)
        
        # Create notifications for new insights
        for insight_message in insights:
            Notification.create(user['id'], group_id, f"📊 Insight: {insight_message}")
            notifications_created.append({
                'type': 'insight',
                'message': insight_message
            })

        # ML: retrain categoriser with new data point
        try:
            MLEngine.retrain_categoriser(user['id'], group_id)
        except Exception:
            pass

        # ML: check for anomaly on the just-created expense
        anomaly_flag = None
        try:
            anomalies = MLEngine.detect_anomalies(user['id'], group_id)
            for a in anomalies:
                if a['expense_id'] == result['expense_id']:
                    anomaly_flag = a
                    Notification.create(
                        user['id'], group_id,
                        f"🤖 Anomaly Detected: {a['reason']}"
                    )
                    notifications_created.append({
                        'type': 'anomaly',
                        'message': a['reason']
                    })
                    break
        except Exception:
            pass

        response_data = {
            'message': 'Expense created successfully',
            'expense_id': result['expense_id'],
            'notifications': notifications_created
        }
        if ml_suggestion:
            response_data['ml_category_suggestion'] = ml_suggestion
        if anomaly_flag:
            response_data['anomaly'] = anomaly_flag

        return jsonify(response_data), 201

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
    def delete_expense(expense_id):
        """Delete an expense."""
        data = request.get_json()
        email = data.get('email')

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = Expense.delete_expense(expense_id, user['id'])
        
        if result['success']:
            return jsonify({'message': 'Expense deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete expense or expense not found'}), 404

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
