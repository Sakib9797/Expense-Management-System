"""Group model for database operations."""

import random
import string
from database.db_config import get_db_connection


class Group:
    """Group model for managing expense groups."""

    @staticmethod
    def generate_code(length=5):
        """Generate a random group code."""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    @staticmethod
    def create(name, size, email, description):
        """
        Create a new group.
        
        Args:
            name (str): Group name.
            size (int): Maximum group size.
            email (str): Creator's email.
            description (str): Group description.
            
        Returns:
            dict: Result dictionary with success status, group_id, and code.
        """
        code = Group.generate_code()

        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Insert group
                cursor.execute('''
                    INSERT INTO groups (name, size, email, description, code, member_count)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (name, size, email, description, code, 1))
                group_id = cursor.lastrowid

                # Get user ID of the creator
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    raise Exception(f"User with email {email} not found")
                creator_id = user_row[0]

                # Add creator as first member
                cursor.execute('''
                    INSERT INTO group_members (group_id, user_id, email, joined_date)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ''', (group_id, creator_id, email))

                conn.commit()
                return {'success': True, 'group_id': group_id, 'code': code}

        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_all():
        """
        Get all groups.
        
        Returns:
            list: List of all groups.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM groups')
                groups = cursor.fetchall()
                return [dict(row) for row in groups]
        except Exception:
            return []

    @staticmethod
    def get_all_paginated(page=1, per_page=10):
        """
        Get all groups with pagination.
        
        Args:
            page (int): Page number (1-indexed).
            per_page (int): Items per page.
            
        Returns:
            tuple: (list of groups, total count)
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                
                # Get total count
                cursor.execute('SELECT COUNT(*) FROM groups')
                total = cursor.fetchone()[0]
                
                # Get paginated results
                offset = (page - 1) * per_page
                cursor.execute('SELECT * FROM groups LIMIT ? OFFSET ?', (per_page, offset))
                groups = cursor.fetchall()
                
                return [dict(row) for row in groups], total
        except Exception:
            return [], 0

    @staticmethod
    def get_by_code(code):
        """
        Get group by code.
        
        Args:
            code (str): Group code.
            
        Returns:
            dict: Group data or None if not found.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT id, size FROM groups WHERE code = ?', (code,))
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception:
            return None

    @staticmethod
    def search_user_groups(query, email):
        """
        Search groups where user is a member.
        
        Args:
            query (str): Search query.
            email (str): User email.
            
        Returns:
            list: List of matching groups.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Get user ID
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    return []
                user_id = user_row[0]

                # Find groups the user created or joined that match the query
                cursor.execute('''
                    SELECT DISTINCT g.*
                    FROM groups g
                    LEFT JOIN group_members gm ON g.id = gm.group_id
                    WHERE (g.email = ? OR gm.user_id = ?)
                      AND g.name LIKE ?
                ''', (email, user_id, f'%{query}%'))

                return [dict(row) for row in cursor.fetchall()]
        except Exception:
            return []

    @staticmethod
    def get_user_groups(email):
        """
        Get all groups where user is a member.
        
        Args:
            email (str): User email.
            
        Returns:
            list: List of groups with member details.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Get all groups where this user is a member
                cursor.execute('''
                    SELECT g.id, g.name, g.description, g.code, g.email, g.size, g.member_count
                    FROM groups g
                    JOIN group_members gm ON g.id = gm.group_id
                    JOIN users u ON gm.user_id = u.id
                    WHERE u.email = ?
                ''', (email,))
                group_rows = cursor.fetchall()

                groups = []
                for row in group_rows:
                    group_id = row[0]

                    # Get all members of the group
                    cursor.execute('''
                        SELECT u.id, u.email, u.full_name, gm.joined_date
                        FROM group_members gm
                        JOIN users u ON gm.user_id = u.id
                        WHERE gm.group_id = ?
                    ''', (group_id,))
                    members = cursor.fetchall()

                    groups.append({
                        'id': row[0],
                        'name': row[1],
                        'description': row[2],
                        'code': row[3],
                        'email': row[4],
                        'size': row[5],
                        'memberCount': row[6],
                        'members': [
                            {
                                'userId': member[0],
                                'email': member[1],
                                'fullName': member[2] or '',
                                'joinedAt': member[3]
                            } for member in members
                        ]
                    })

                return groups
        except Exception:
            return []

    @staticmethod
    def join_group(code, email):
        """
        Join a group using code.
        
        Args:
            code (str): Group code.
            email (str): User email.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()

                # Lookup group by code
                cursor.execute('SELECT id, size FROM groups WHERE code = ?', (code,))
                group_row = cursor.fetchone()
                if not group_row:
                    return {'success': False, 'message': 'Invalid group code'}

                group_id, group_size = group_row[0], group_row[1]

                # Find user by email
                cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    return {'success': False, 'message': 'User not registered'}

                user_id = user_row[0]

                # Check if already a member
                cursor.execute('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', 
                             (group_id, user_id))
                if cursor.fetchone():
                    return {'success': False, 'message': 'You are already a member of this group'}

                # Check if group is full
                cursor.execute('SELECT COUNT(*) FROM group_members WHERE group_id = ?', (group_id,))
                current_members = cursor.fetchone()[0]
                if current_members >= group_size:
                    return {'success': False, 'message': 'Group is full'}

                # Add user to group
                cursor.execute('''
                    INSERT INTO group_members (group_id, user_id, email, joined_date)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ''', (group_id, user_id, email))
                
                cursor.execute('UPDATE groups SET member_count = member_count + 1 WHERE id = ?', 
                             (group_id,))

                # Create notifications for other members
                cursor.execute('''
                    SELECT user_id FROM group_members
                    WHERE group_id = ? AND user_id != ?
                ''', (group_id, user_id))
                other_members = cursor.fetchall()

                for member in other_members:
                    cursor.execute('''
                        INSERT INTO notifications (user_id, group_id, message)
                        VALUES (?, ?, ?)
                    ''', (member[0], group_id, f"{email} joined your group."))

                conn.commit()
                return {'success': True, 'message': 'Successfully joined the group'}

        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def leave_group(group_id, email):
        """
        Leave a group.
        
        Args:
            group_id (int): Group ID.
            email (str): User email.
            
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

                user_id = user[0]

                # Remove member
                cursor.execute('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', 
                             (group_id, user_id))
                cursor.execute('UPDATE groups SET member_count = member_count - 1 WHERE id = ?', 
                             (group_id,))
                conn.commit()

                return {'success': True, 'message': 'Left group successfully'}

        except Exception as e:
            return {'success': False, 'message': str(e)}
