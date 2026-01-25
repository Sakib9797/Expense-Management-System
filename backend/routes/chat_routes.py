"""Chat routes for group messages and direct messages."""

from flask import Blueprint
from backend.controllers.chat_controller import ChatController

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Group chat routes
@chat_bp.route('/group/messages', methods=['POST'])
def send_group_message():
    """Send a message to group chat."""
    return ChatController.send_group_message()

@chat_bp.route('/group/<int:group_id>/messages', methods=['GET'])
def get_group_messages(group_id):
    """Get all messages for a group."""
    return ChatController.get_group_messages(group_id)

@chat_bp.route('/group/messages/<int:message_id>', methods=['DELETE'])
def delete_group_message(message_id):
    """Delete a group message."""
    return ChatController.delete_group_message(message_id)

# Direct message routes
@chat_bp.route('/direct/messages', methods=['POST'])
def send_direct_message():
    """Send a direct message."""
    return ChatController.send_direct_message()

@chat_bp.route('/direct/<email>/<other_email>/<int:group_id>', methods=['GET'])
def get_conversation(email, other_email, group_id):
    """Get conversation between two users."""
    return ChatController.get_conversation(email, other_email, group_id)

@chat_bp.route('/direct/<email>/<int:group_id>/conversations', methods=['GET'])
def get_conversations_list(email, group_id):
    """Get list of all conversations."""
    return ChatController.get_conversations_list(email, group_id)

@chat_bp.route('/direct/messages/<int:message_id>', methods=['DELETE'])
def delete_direct_message(message_id):
    """Delete a direct message."""
    return ChatController.delete_direct_message(message_id)
