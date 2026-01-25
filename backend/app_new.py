"""Main Flask application with MVC architecture and API optimizations."""

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_config import init_db
from backend.routes import auth_bp, user_bp, group_bp
from backend.routes.spending_routes import spending_bp
from backend.routes.chat_routes import chat_bp


app = Flask(
    __name__,
    static_folder='../frontend/dist',
    static_url_path='/'
)
CORS(app)

# Configure caching
cache = Cache(app, config={
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes default
})

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Make cache and limiter available to blueprints
app.cache = cache
app.limiter = limiter

# Register blueprints (RESTful API routes)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(group_bp)
app.register_blueprint(spending_bp)
app.register_blueprint(chat_bp)


@app.route("/")
def home():
    """Health check endpoint."""
    return "Backend is running."


@app.route('/', methods=['GET'])
def root():
    """Serve index.html for the root."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    """Serve static files (JS, CSS, images, etc.) or index.html for React Router."""
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    # Otherwise, serve index.html (for React Router)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    from database.db_config import DB_PATH
    print("Using database:", DB_PATH)
    init_db()
    app.run(debug=True)
