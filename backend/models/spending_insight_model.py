"""Spending insight model for AI-lite analysis."""

from datetime import datetime, timedelta
from database.db_config import get_db_connection
from backend.models.expense_model import Expense


class SpendingInsight:
    """Model for generating and storing spending insights."""

    @staticmethod
    def create_insight(user_id, group_id, insight_type, message, percentage=None, category=None, period=None):
        """Create a new spending insight."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO spending_insights (user_id, group_id, insight_type, message, percentage, category, period)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (user_id, group_id, insight_type, message, percentage, category, period))

            conn.commit()
            insight_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'insight_id': insight_id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_user_insights(user_id, group_id, limit=10):
        """Get recent insights for a user."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT id, insight_type, message, percentage, category, period, created_at
                FROM spending_insights
                WHERE user_id = ? AND group_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (user_id, group_id, limit))

            rows = cursor.fetchall()
            conn.close()

            insights = []
            for row in rows:
                insights.append({
                    'id': row[0],
                    'insight_type': row[1],
                    'message': row[2],
                    'percentage': row[3],
                    'category': row[4],
                    'period': row[5],
                    'created_at': row[6]
                })

            return insights
        except Exception as e:
            print(f"Error getting insights: {e}")
            return []

    @staticmethod
    def generate_insights(user_id, group_id):
        """Generate AI-lite spending insights."""
        insights = []
        
        try:
            # Calculate date ranges
            today = datetime.now()
            current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
            last_month_end = current_month_start - timedelta(days=1)

            # Get current and previous month spending
            current_spending = Expense.get_total_spending(
                user_id, group_id, 
                current_month_start.isoformat(), 
                today.isoformat()
            )
            
            last_month_spending = Expense.get_total_spending(
                user_id, group_id,
                last_month_start.isoformat(),
                last_month_end.isoformat()
            )

            # Insight 1: Overall spending comparison
            if last_month_spending > 0:
                change_percentage = ((current_spending - last_month_spending) / last_month_spending) * 100
                
                if change_percentage > 10:
                    message = f"You overspent {abs(change_percentage):.0f}% this month compared to last month"
                    SpendingInsight.create_insight(
                        user_id, group_id, 'overspending', message, 
                        abs(change_percentage), None, 'month'
                    )
                    insights.append(message)
                elif change_percentage < -10:
                    message = f"Great job! You saved {abs(change_percentage):.0f}% this month"
                    SpendingInsight.create_insight(
                        user_id, group_id, 'saving', message,
                        abs(change_percentage), None, 'month'
                    )
                    insights.append(message)

            # Insight 2: Category-wise comparison
            current_categories = Expense.get_spending_by_category(
                user_id, group_id,
                current_month_start.isoformat(),
                today.isoformat()
            )
            
            last_categories = Expense.get_spending_by_category(
                user_id, group_id,
                last_month_start.isoformat(),
                last_month_end.isoformat()
            )

            # Compare categories
            last_cat_dict = {cat['category']: cat['total'] for cat in last_categories}
            
            for current_cat in current_categories:
                category = current_cat['category']
                current_amount = current_cat['total']
                
                if category in last_cat_dict:
                    last_amount = last_cat_dict[category]
                    if last_amount > 0:
                        cat_change = ((current_amount - last_amount) / last_amount) * 100
                        
                        if cat_change > 15:
                            message = f"{category.capitalize()} spending increased {cat_change:.0f}% compared to last month"
                            SpendingInsight.create_insight(
                                user_id, group_id, 'category_increase', message,
                                cat_change, category, 'month'
                            )
                            insights.append(message)
                        elif cat_change < -15:
                            message = f"{category.capitalize()} spending decreased {abs(cat_change):.0f}% compared to last month"
                            SpendingInsight.create_insight(
                                user_id, group_id, 'category_decrease', message,
                                abs(cat_change), category, 'month'
                            )
                            insights.append(message)

            # Insight 3: Top spending category
            if current_categories:
                top_category = current_categories[0]
                total_current = sum(cat['total'] for cat in current_categories)
                top_percentage = (top_category['total'] / total_current) * 100
                
                if top_percentage > 40:
                    message = f"{top_category['category'].capitalize()} is your highest expense at {top_percentage:.0f}% of total spending"
                    SpendingInsight.create_insight(
                        user_id, group_id, 'top_category', message,
                        top_percentage, top_category['category'], 'month'
                    )
                    insights.append(message)

            return insights

        except Exception as e:
            print(f"Error generating insights: {e}")
            return []
