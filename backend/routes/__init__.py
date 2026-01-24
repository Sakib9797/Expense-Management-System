"""Routes package initialization."""

from backend.routes.auth_routes import auth_bp
from backend.routes.user_routes import user_bp
from backend.routes.group_routes import group_bp

__all__ = ['auth_bp', 'user_bp', 'group_bp']
