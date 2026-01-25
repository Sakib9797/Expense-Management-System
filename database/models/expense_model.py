"""Expense model for database operations."""

from datetime import datetime, timedelta
from database.db_config import get_db_connection


class Expense:
    """Expense model for tracking user spending."""

    @staticmethod
    def create(group_id, user_id, amount, category, description, expense_date):
        """Create a new expense."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO expenses (group_id, user_id, amount, category, description, expense_date)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (group_id, user_id, amount, category, description, expense_date))

            conn.commit()
            expense_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'expense_id': expense_id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_user_expenses(user_id, group_id, start_date=None, end_date=None):
        """Get expenses for a user in a group within a date range."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            if start_date and end_date:
                cursor.execute("""
                    SELECT id, amount, category, description, expense_date, created_at
                    FROM expenses
                    WHERE user_id = ? AND group_id = ?
                    AND expense_date BETWEEN ? AND ?
                    ORDER BY expense_date DESC
                """, (user_id, group_id, start_date, end_date))
            else:
                cursor.execute("""
                    SELECT id, amount, category, description, expense_date, created_at
                    FROM expenses
                    WHERE user_id = ? AND group_id = ?
                    ORDER BY expense_date DESC
                """, (user_id, group_id))

            rows = cursor.fetchall()
            conn.close()

            expenses = []
            for row in rows:
                expenses.append({
                    'id': row[0],
                    'amount': row[1],
                    'category': row[2],
                    'description': row[3],
                    'expense_date': row[4],
                    'created_at': row[5]
                })

            return expenses
        except Exception as e:
            print(f"Error getting expenses: {e}")
            return []

    @staticmethod
    def get_total_spending(user_id, group_id, start_date, end_date):
        """Calculate total spending for a user in a period."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT COALESCE(SUM(amount), 0) as total
                FROM expenses
                WHERE user_id = ? AND group_id = ?
                AND expense_date BETWEEN ? AND ?
            """, (user_id, group_id, start_date, end_date))

            result = cursor.fetchone()
            conn.close()

            return result[0] if result else 0
        except Exception as e:
            print(f"Error calculating total spending: {e}")
            return 0

    @staticmethod
    def get_spending_by_category(user_id, group_id, start_date, end_date):
        """Get spending grouped by category."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT category, SUM(amount) as total
                FROM expenses
                WHERE user_id = ? AND group_id = ?
                AND expense_date BETWEEN ? AND ?
                GROUP BY category
                ORDER BY total DESC
            """, (user_id, group_id, start_date, end_date))

            rows = cursor.fetchall()
            conn.close()

            categories = []
            for row in rows:
                categories.append({
                    'category': row[0],
                    'total': row[1]
                })

            return categories
        except Exception as e:
            print(f"Error getting category spending: {e}")
            return []

    @staticmethod
    def delete_expense(expense_id, user_id):
        """Delete an expense."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Verify the expense belongs to the user
            cursor.execute("""
                DELETE FROM expenses
                WHERE id = ? AND user_id = ?
            """, (expense_id, user_id))

            conn.commit()
            deleted = cursor.rowcount > 0
            conn.close()

            return {'success': deleted}
        except Exception as e:
            print(f"Error deleting expense: {e}")
            return {'success': False, 'message': str(e)}
