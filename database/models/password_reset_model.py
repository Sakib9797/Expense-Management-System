"""Password reset model for database operations."""

import time
import secrets
from database.db_config import get_db_connection


class PasswordReset:
    """Password reset model for managing reset tokens."""

    @staticmethod
    def generate_token():
        """Generate a secure reset token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_reset_request(email):
        """
        Create a password reset request.
        
        Args:
            email (str): User email address.
            
        Returns:
            dict: Result dictionary with success status, message, and token.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Check if the user exists
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                user = cursor.fetchone()
                if not user:
                    return {'success': False, 'message': 'Email not found'}

                # Generate token and set expiration (1 hour)
                token = PasswordReset.generate_token()
                expires = int(time.time()) + 3600

                # Insert the reset request
                cursor.execute(
                    "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
                    (email, token, expires)
                )
                conn.commit()

                return {'success': True, 'token': token, 'message': 'Reset token created'}

        except Exception as e:
            return {'success': False, 'message': f'Database error: {str(e)}'}

    @staticmethod
    def verify_token(token):
        """
        Verify a reset token and return associated email.
        
        Args:
            token (str): Reset token.
            
        Returns:
            dict: Result dictionary with success status and email or message.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Check if the token exists
                cursor.execute("SELECT email, expires_at FROM password_resets WHERE token = ?", (token,))
                row = cursor.fetchone()

                if not row:
                    return {'success': False, 'message': 'Invalid or expired token'}

                email, expires_at = row[0], row[1]
                current_time = int(time.time())

                # Verify token expiration
                if current_time > expires_at:
                    return {'success': False, 'message': 'Token has expired'}

                return {'success': True, 'email': email}

        except Exception as e:
            return {'success': False, 'message': f'Database error: {str(e)}'}

    @staticmethod
    def delete_token(token):
        """
        Delete a reset token after use.
        
        Args:
            token (str): Reset token.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM password_resets WHERE token = ?", (token,))
                conn.commit()
                return True
        except Exception:
            return False
