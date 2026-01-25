"""Message models for group chat and direct messages."""

from datetime import datetime
from database.db_config import get_db_connection


class GroupMessage:
    """Model for group chat messages."""

    @staticmethod
    def create(group_id, user_id, message, attachment_url=None, attachment_name=None, attachment_type=None):
        """Create a new group message."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO group_messages (group_id, user_id, message, attachment_url, attachment_name, attachment_type)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (group_id, user_id, message, attachment_url, attachment_name, attachment_type))

            conn.commit()
            message_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'message_id': message_id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_group_messages(group_id, limit=100, offset=0):
        """Get messages for a group with user information."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT 
                    gm.id, gm.group_id, gm.user_id, gm.message,
                    gm.attachment_url, gm.attachment_name, gm.attachment_type,
                    gm.created_at,
                    u.full_name, u.email
                FROM group_messages gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ?
                ORDER BY gm.created_at DESC
                LIMIT ? OFFSET ?
            """, (group_id, limit, offset))

            rows = cursor.fetchall()
            conn.close()

            messages = []
            for row in rows:
                messages.append({
                    'id': row[0],
                    'group_id': row[1],
                    'user_id': row[2],
                    'message': row[3],
                    'attachment_url': row[4],
                    'attachment_name': row[5],
                    'attachment_type': row[6],
                    'created_at': row[7],
                    'user_name': row[8],
                    'user_email': row[9]
                })

            # Reverse to show oldest first
            return messages[::-1]
        except Exception as e:
            print(f"Error getting group messages: {e}")
            return []

    @staticmethod
    def delete_message(message_id, user_id):
        """Delete a message (only by the sender)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM group_messages
                WHERE id = ? AND user_id = ?
            """, (message_id, user_id))

            conn.commit()
            deleted = cursor.rowcount > 0
            conn.close()

            return {'success': deleted}
        except Exception as e:
            return {'success': False, 'message': str(e)}


class DirectMessage:
    """Model for direct messages between users."""

    @staticmethod
    def create(sender_id, receiver_id, group_id, message, attachment_url=None, attachment_name=None, attachment_type=None):
        """Create a new direct message."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO direct_messages 
                (sender_id, receiver_id, group_id, message, attachment_url, attachment_name, attachment_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (sender_id, receiver_id, group_id, message, attachment_url, attachment_name, attachment_type))

            conn.commit()
            message_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'message_id': message_id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_conversation(user1_id, user2_id, group_id, limit=100, offset=0):
        """Get conversation between two users in a group."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT 
                    dm.id, dm.sender_id, dm.receiver_id, dm.group_id, dm.message,
                    dm.attachment_url, dm.attachment_name, dm.attachment_type,
                    dm.is_read, dm.created_at,
                    u1.full_name as sender_name, u1.email as sender_email,
                    u2.full_name as receiver_name, u2.email as receiver_email
                FROM direct_messages dm
                JOIN users u1 ON dm.sender_id = u1.id
                JOIN users u2 ON dm.receiver_id = u2.id
                WHERE dm.group_id = ?
                AND ((dm.sender_id = ? AND dm.receiver_id = ?) 
                     OR (dm.sender_id = ? AND dm.receiver_id = ?))
                ORDER BY dm.created_at DESC
                LIMIT ? OFFSET ?
            """, (group_id, user1_id, user2_id, user2_id, user1_id, limit, offset))

            rows = cursor.fetchall()
            conn.close()

            messages = []
            for row in rows:
                messages.append({
                    'id': row[0],
                    'sender_id': row[1],
                    'receiver_id': row[2],
                    'group_id': row[3],
                    'message': row[4],
                    'attachment_url': row[5],
                    'attachment_name': row[6],
                    'attachment_type': row[7],
                    'is_read': row[8],
                    'created_at': row[9],
                    'sender_name': row[10],
                    'sender_email': row[11],
                    'receiver_name': row[12],
                    'receiver_email': row[13]
                })

            # Reverse to show oldest first
            return messages[::-1]
        except Exception as e:
            print(f"Error getting conversation: {e}")
            return []

    @staticmethod
    def get_conversations_list(user_id, group_id):
        """Get list of users with whom the user has conversations in a group."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT DISTINCT
                    CASE 
                        WHEN dm.sender_id = ? THEN dm.receiver_id
                        ELSE dm.sender_id
                    END as other_user_id,
                    u.full_name,
                    u.email,
                    MAX(dm.created_at) as last_message_time,
                    SUM(CASE WHEN dm.receiver_id = ? AND dm.is_read = 0 THEN 1 ELSE 0 END) as unread_count
                FROM direct_messages dm
                JOIN users u ON (
                    CASE 
                        WHEN dm.sender_id = ? THEN dm.receiver_id
                        ELSE dm.sender_id
                    END = u.id
                )
                WHERE dm.group_id = ?
                AND (dm.sender_id = ? OR dm.receiver_id = ?)
                GROUP BY other_user_id
                ORDER BY last_message_time DESC
            """, (user_id, user_id, user_id, group_id, user_id, user_id))

            rows = cursor.fetchall()
            conn.close()

            conversations = []
            for row in rows:
                conversations.append({
                    'user_id': row[0],
                    'user_name': row[1],
                    'user_email': row[2],
                    'last_message_time': row[3],
                    'unread_count': row[4]
                })

            return conversations
        except Exception as e:
            print(f"Error getting conversations list: {e}")
            return []

    @staticmethod
    def mark_as_read(sender_id, receiver_id, group_id):
        """Mark all messages from sender to receiver as read."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                UPDATE direct_messages
                SET is_read = 1
                WHERE sender_id = ? AND receiver_id = ? AND group_id = ? AND is_read = 0
            """, (sender_id, receiver_id, group_id))

            conn.commit()
            conn.close()

            return {'success': True}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def delete_message(message_id, user_id):
        """Delete a message (only by the sender)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM direct_messages
                WHERE id = ? AND sender_id = ?
            """, (message_id, user_id))

            conn.commit()
            deleted = cursor.rowcount > 0
            conn.close()

            return {'success': deleted}
        except Exception as e:
            return {'success': False, 'message': str(e)}
