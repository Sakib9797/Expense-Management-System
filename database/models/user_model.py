"""User model for database operations."""

import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from database.db_config import get_db_connection


class User:
    """User model for authentication and profile management."""

    @staticmethod
    def create(email, password):
        """
        Create a new user.
        
        Args:
            email (str): User email address.
            password (str): Plain text password.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        if len(password) < 6:
            return {'success': False, 'message': 'Password must be at least 6 characters'}

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Check if email is already in use (FIXED: case-insensitive and only select ID)
            cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email,))
            existing = cursor.fetchone()
            
            if existing:
                conn.close()
                return {'success': False, 'message': 'Email already in use'}

            # Hash password and insert new user
            hashed_password = generate_password_hash(password)
            cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", 
                         (email, hashed_password))
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()

            return {'success': True, 'message': 'User registered successfully', 'user_id': user_id}

        except sqlite3.IntegrityError:
            return {'success': False, 'message': 'Email already in use'}
        except Exception as e:
            return {'success': False, 'message': f'Internal server error: {str(e)}'}

    @staticmethod
    def authenticate(email, password):
        """
        Authenticate user credentials.
        
        Args:
            email (str): User email address.
            password (str): Plain text password.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT password FROM users WHERE email = ?', (email,))
                row = cursor.fetchone()
                
                if row and check_password_hash(row[0], password):
                    return {'success': True, 'message': 'Login successful'}
                else:
                    return {'success': False, 'message': 'Invalid email or password'}
        except Exception as e:
            return {'success': False, 'message': f'Authentication error: {str(e)}'}

    @staticmethod
    def get_by_email(email):
        """
        Get user by email address.
        
        Args:
            email (str): User email address.
            
        Returns:
            dict: User data or None if not found.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT id, email, full_name, gender, phone_number, bio FROM users WHERE email = ?', (email,))
                row = cursor.fetchone()
                
                if row:
                    return {
                        'id': row[0],
                        'email': row[1],
                        'full_name': row[2],
                        'gender': row[3],
                        'phone_number': row[4],
                        'bio': row[5]
                    }
                return None
        except Exception:
            return None

    @staticmethod
    def update_profile(email, full_name, gender, phone, bio):
        """
        Update user profile information.
        
        Args:
            email (str): User email address.
            full_name (str): Full name.
            gender (str): Gender.
            phone (str): Phone number.
            bio (str): Bio/description.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user = cursor.fetchone()
                
                if not user:
                    return {'success': False, 'message': 'User not found'}

                cursor.execute('''
                    UPDATE users
                    SET full_name = ?, gender = ?, phone_number = ?, bio = ?
                    WHERE email = ?
                ''', (full_name, gender, phone, bio, email))

                conn.commit()
                return {'success': True, 'message': 'Profile updated successfully'}
        except Exception as e:
            return {'success': False, 'message': f'Update error: {str(e)}'}

    @staticmethod
    def update_password(email, new_password):
        """
        Update user password.
        
        Args:
            email (str): User email address.
            new_password (str): New plain text password.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        if len(new_password) < 3:
            return {'success': False, 'message': 'Password must be at least 3 characters'}

        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                
                # Check if the user exists by email
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                user = cursor.fetchone()

                if not user:
                    return {'success': False, 'message': 'User not found'}

                # Hash the new password
                hashed_password = generate_password_hash(new_password)

                # Update password in the database
                cursor.execute("UPDATE users SET password = ? WHERE email = ?", 
                             (hashed_password, email))
                conn.commit()

                return {'success': True, 'message': 'Password updated successfully'}

        except Exception as e:
            return {'success': False, 'message': f'Password update error: {str(e)}'}
