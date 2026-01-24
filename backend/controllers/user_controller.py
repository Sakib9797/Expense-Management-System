"""User profile controller."""

from flask import request, jsonify
from backend.models.user_model import User


class UserController:
    """Controller for user profile operations."""

    @staticmethod
    def update_profile():
        """Update user profile information."""
        data = request.get_json()

        email = data.get('email')
        full_name = data.get('fullName')
        gender = data.get('gender')
        phone = data.get('phoneNumber')
        bio = data.get('bio')

        if not email:
            return jsonify({'message': 'Email is required'}), 400

        result = User.update_profile(email, full_name, gender, phone, bio)
        
        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 404
