"""Database connection configuration."""

import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, 'database.db'))


def get_db_connection():
    """
    Create and return a database connection.
    
    Returns:
        sqlite3.Connection: Database connection object.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn


def init_db():
    """Initialize database schema from schema.sql file."""
    schema_path = os.path.join(BASE_DIR, 'schema.sql')
    os.makedirs(BASE_DIR, exist_ok=True)
    
    with get_db_connection() as conn:
        if os.path.exists(schema_path):
            with open(schema_path, 'r', encoding='utf-8') as f:
                conn.executescript(f.read())
        conn.commit()
