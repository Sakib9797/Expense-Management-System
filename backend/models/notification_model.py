"""Notification model for database operations."""

from database.db_config import get_db_connection


class Notification:
    """Notification model for managing user notifications."""

    @staticmethod
    def get_user_notifications(email):
        """
        Get all notifications for a user.
        
        Args:
            email (str): User email address.
            
        Returns:
            list: List of notifications.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    return []

                user_id = user_row[0]

                cursor.execute('''
                    SELECT n.id, n.message, n.created_at
                    FROM notifications n
                    WHERE n.user_id = ?
                    ORDER BY n.created_at DESC
                ''', (user_id,))
                
                notifications = [
                    {
                        'id': row[0],
                        'message': row[1],
                        'createdAt': row[2]
                    } for row in cursor.fetchall()
                ]
                return notifications
        except Exception:
            return []

    @staticmethod
    def get_user_notifications_paginated(email, page=1, per_page=20):
        """
        Get user notifications with pagination.
        
        Args:
            email (str): User email address.
            page (int): Page number (1-indexed).
            per_page (int): Items per page.
            
        Returns:
            tuple: (list of notifications, total count)
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    return [], 0

                user_id = user_row[0]

                # Get total count
                cursor.execute('SELECT COUNT(*) FROM notifications WHERE user_id = ?', (user_id,))
                total = cursor.fetchone()[0]

                # Get paginated results
                offset = (page - 1) * per_page
                cursor.execute('''
                    SELECT n.id, n.message, n.created_at
                    FROM notifications n
                    WHERE n.user_id = ?
                    ORDER BY n.created_at DESC
                    LIMIT ? OFFSET ?
                ''', (user_id, per_page, offset))
                
                notifications = [
                    {
                        'id': row[0],
                        'message': row[1],
                        'createdAt': row[2]
                    } for row in cursor.fetchall()
                ]
                return notifications, total
        except Exception:
            return [], 0
