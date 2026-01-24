"""Spending target model for database operations."""

from datetime import datetime, timedelta
from database.db_config import get_db_connection


class SpendingTarget:
    """Spending target model for user budget management."""

    @staticmethod
    def create(user_id, group_id, target_amount, period_type):
        """
        Create a new spending target.
        
        Args:
            user_id: User ID
            group_id: Group ID
            target_amount: Target spending amount
            period_type: 'day', 'week', or 'month'
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Calculate start and end dates
            start_date = datetime.now()
            if period_type == 'day':
                end_date = start_date + timedelta(days=1)
            elif period_type == 'week':
                end_date = start_date + timedelta(weeks=1)
            elif period_type == 'month':
                end_date = start_date + timedelta(days=30)
            else:
                return {'success': False, 'message': 'Invalid period type'}

            cursor.execute("""
                INSERT INTO spending_targets (user_id, group_id, target_amount, period_type, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, group_id, target_amount, period_type, 
                  start_date.isoformat(), end_date.isoformat()))
            
            conn.commit()
            target_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'target_id': target_id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_active_target(user_id, group_id):
        """Get active spending target for user in a group."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT id, target_amount, period_type, start_date, end_date
                FROM spending_targets
                WHERE user_id = ? AND group_id = ? 
                AND end_date >= datetime('now')
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id, group_id))

            row = cursor.fetchone()
            conn.close()

            if row:
                return {
                    'id': row[0],
                    'target_amount': row[1],
                    'period_type': row[2],
                    'start_date': row[3],
                    'end_date': row[4]
                }
            return None
        except Exception as e:
            print(f"Error getting active target: {e}")
            return None

    @staticmethod
    def get_user_targets(user_id):
        """Get all spending targets for a user."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT st.id, st.target_amount, st.period_type, st.start_date, st.end_date,
                       g.name as group_name, st.group_id
                FROM spending_targets st
                JOIN groups g ON st.group_id = g.id
                WHERE st.user_id = ?
                ORDER BY st.created_at DESC
            """, (user_id,))

            rows = cursor.fetchall()
            conn.close()

            targets = []
            for row in rows:
                targets.append({
                    'id': row[0],
                    'target_amount': row[1],
                    'period_type': row[2],
                    'start_date': row[3],
                    'end_date': row[4],
                    'group_name': row[5],
                    'group_id': row[6],
                    'is_active': row[4] >= datetime.now().isoformat()
                })

            return targets
        except Exception as e:
            print(f"Error getting user targets: {e}")
            return []

    @staticmethod
    def delete_target(target_id, user_id):
        """Delete a spending target."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM spending_targets
                WHERE id = ? AND user_id = ?
            """, (target_id, user_id))

            conn.commit()
            deleted = cursor.rowcount > 0
            conn.close()

            return {'success': deleted}
        except Exception as e:
            return {'success': False, 'message': str(e)}
