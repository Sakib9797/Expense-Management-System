"""Chat controller for group messages and direct messages."""

from flask import request, jsonify
from database.models.message_model import GroupMessage, DirectMessage
from database.models.user_model import User


class ChatController:
    """Controller for chat operations."""

    @staticmethod
    def send_group_message():
        """Send a message to group chat."""
        data = request.get_json()
        email = data.get('email')
        group_id = data.get('group_id')
        message = data.get('message')
        attachment_url = data.get('attachment_url')
        attachment_name = data.get('attachment_name')
        attachment_type = data.get('attachment_type')

        if not all([email, group_id, message]):
            return jsonify({'message': 'Email, group_id, and message are required'}), 400

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = GroupMessage.create(
            group_id, user['id'], message,
            attachment_url, attachment_name, attachment_type
        )

        if result['success']:
            return jsonify({
                'message': 'Message sent successfully',
                'message_id': result['message_id']
            }), 201
        else:
            return jsonify({'message': result['message']}), 500

    @staticmethod
    def get_group_messages(group_id):
        """Get all messages for a group."""
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        messages = GroupMessage.get_group_messages(group_id, limit, offset)
        return jsonify({'messages': messages}), 200

    @staticmethod
    def delete_group_message(message_id):
        """Delete a group message."""
        data = request.get_json()
        email = data.get('email')

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = GroupMessage.delete_message(message_id, user['id'])

        if result['success']:
            return jsonify({'message': 'Message deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete message'}), 500

    @staticmethod
    def send_direct_message():
        """Send a direct message to another user."""
        data = request.get_json()
        sender_email = data.get('sender_email')
        receiver_email = data.get('receiver_email')
        group_id = data.get('group_id')
        message = data.get('message')
        attachment_url = data.get('attachment_url')
        attachment_name = data.get('attachment_name')
        attachment_type = data.get('attachment_type')

        if not all([sender_email, receiver_email, group_id, message]):
            return jsonify({'message': 'All fields are required'}), 400

        sender = User.get_by_email(sender_email)
        receiver = User.get_by_email(receiver_email)

        if not sender or not receiver:
            return jsonify({'message': 'User not found'}), 404

        result = DirectMessage.create(
            sender['id'], receiver['id'], group_id, message,
            attachment_url, attachment_name, attachment_type
        )

        if result['success']:
            return jsonify({
                'message': 'Message sent successfully',
                'message_id': result['message_id']
            }), 201
        else:
            return jsonify({'message': result['message']}), 500

    @staticmethod
    def get_conversation(email, other_user_email, group_id):
        """Get conversation between two users."""
        user = User.get_by_email(email)
        other_user = User.get_by_email(other_user_email)

        if not user or not other_user:
            return jsonify({'message': 'User not found'}), 404

        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        messages = DirectMessage.get_conversation(
            user['id'], other_user['id'], group_id, limit, offset
        )

        # Mark messages as read
        DirectMessage.mark_as_read(other_user['id'], user['id'], group_id)

        return jsonify({'messages': messages}), 200

    @staticmethod
    def get_conversations_list(email, group_id):
        """Get list of all conversations for a user in a group."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        conversations = DirectMessage.get_conversations_list(user['id'], group_id)
        return jsonify({'conversations': conversations}), 200

    @staticmethod
    def delete_direct_message(message_id):
        """Delete a direct message."""
        data = request.get_json()
        email = data.get('email')

        user = User.get_by_email(email)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = DirectMessage.delete_message(message_id, user['id'])

        if result['success']:
            return jsonify({'message': 'Message deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete message'}), 500
