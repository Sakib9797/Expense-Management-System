"""Authentication controller."""

from flask import request, jsonify
from database.models.user_model import User
from database.models.password_reset_model import PasswordReset
from backend.services.email_service import EmailService


class AuthController:
    """Controller for authentication-related operations."""

    @staticmethod
    def register():
        """Register a new user."""
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        result = User.create(email, password)
        
        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 400

    @staticmethod
    def login():
        """Authenticate user login."""
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400

        result = User.authenticate(email, password)
        
        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'error': result['message']}), 401

    @staticmethod
    def forgot_password():
        """Request password reset."""
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        result = PasswordReset.create_reset_request(email)
        
        if not result['success']:
            return jsonify({"status": "error", "message": result['message']}), 404

        # Generate the reset link with the token
        token = result['token']
        reset_link = f"http://localhost:8080/reset-password?token={token}"

        # Attempt to send the reset email
        email_result = EmailService.send_reset_email(email, reset_link)
        
        if email_result['success']:
            return jsonify({"status": "success", "message": "Password reset link sent successfully"}), 200
        else:
            return jsonify({"status": "error", "message": f"Failed to send reset email: {email_result['message']}"}), 500

    @staticmethod
    def reset_password():
        """Reset user password with token."""
        data = request.json
        token = data.get('token')
        new_password = data.get('new_password')

        if not token:
            return jsonify({"status": "error", "message": "Token is required"}), 400
        if not new_password:
            return jsonify({"status": "error", "message": "New password is required"}), 400

        # Verify token
        verify_result = PasswordReset.verify_token(token)
        if not verify_result['success']:
            return jsonify({"status": "error", "message": verify_result['message']}), 400

        email = verify_result['email']

        # Update password
        password_result = User.update_password(email, new_password)
        if not password_result['success']:
            return jsonify({"status": "error", "message": password_result['message']}), 400

        # Remove the used token
        PasswordReset.delete_token(token)

        return jsonify({"status": "success", "message": "Password reset successfully"}), 200
