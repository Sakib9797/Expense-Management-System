"""Group management controller with pagination and caching."""

from flask import request, jsonify, current_app
from database.models.group_model import Group
from database.models.notification_model import Notification


class GroupController:
    """Controller for group management operations."""

    @staticmethod
    def create_group():
        """Create a new group."""
        data = request.get_json()
        name = data.get('name')
        size = data.get('size')
        email = data.get('email')
        description = data.get('description')

        result = Group.create(name, size, email, description)
        
        if result['success']:
            # Clear cache after creating new group
            if hasattr(current_app, 'cache'):
                current_app.cache.delete_memoized(Group.get_all)
                # Also clear the user's group cache since they just created a group
                current_app.cache.delete(f'user_groups_{email}')
            return jsonify({'id': result['group_id'], 'code': result['code']}), 201
        else:
            return jsonify({'error': result['message']}), 500

    @staticmethod
    def get_groups():
        """Get all groups with pagination."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        groups, total = Group.get_all_paginated(page, per_page)
        
        return jsonify({
            'groups': groups,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        })

    @staticmethod
    def search_groups():
        """Search user's groups."""
        query = request.args.get('query', '')
        email = request.args.get('email', '')

        if not email:
            return jsonify({'message': 'Email is required'}), 400

        groups = Group.search_user_groups(query, email)
        return jsonify(groups)

    @staticmethod
    def get_user_groups(email):
        """Get all groups for a user with caching."""
        # Try to get from cache
        cache_key = f'user_groups_{email}'
        if hasattr(current_app, 'cache'):
            cached_groups = current_app.cache.get(cache_key)
            
            if cached_groups is not None:
                return jsonify(cached_groups)
        
        groups = Group.get_user_groups(email)
        
        # Cache for 5 minutes
        if hasattr(current_app, 'cache'):
            current_app.cache.set(cache_key, groups, timeout=300)
        
        return jsonify(groups)

    @staticmethod
    def join_group():
        """Join a group using code."""
        data = request.get_json()
        code = data.get('code')
        email = data.get('email')

        if not code or not email:
            return jsonify({'message': 'Group code and logged-in user email are required'}), 400

        result = Group.join_group(code, email)
        
        if result['success']:
            # Clear user's group cache
            if hasattr(current_app, 'cache'):
                current_app.cache.delete(f'user_groups_{email}')
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 400

    @staticmethod
    def leave_group(group_id):
        """Leave a group."""
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'message': 'Email required'}), 400

        result = Group.leave_group(group_id, email)
        
        if result['success']:
            # Clear user's group cache
            if hasattr(current_app, 'cache'):
                current_app.cache.delete(f'user_groups_{email}')
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 404

    @staticmethod
    def get_group_members(group_id):
        """Get all members of a group."""
        members = Group.get_group_members(group_id)
        return jsonify({'members': members}), 200

    @staticmethod
    def remove_member(group_id):
        """Remove a member from group (owner only)."""
        data = request.get_json()
        owner_email = data.get('owner_email')
        member_email = data.get('member_email')

        if not owner_email or not member_email:
            return jsonify({'message': 'Owner email and member email are required'}), 400

        result = Group.remove_member(group_id, owner_email, member_email)

        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 403

    @staticmethod
    def get_notifications(email):
        """Get user notifications with pagination."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        notifications, total = Notification.get_user_notifications_paginated(email, page, per_page)
        
        return jsonify({
            'notifications': notifications,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        })
