from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from flask_cors import CORS
import os
import random
import string
from werkzeug.security import generate_password_hash, check_password_hash
from send_email import send_reset_email
# For Gmail API
import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import time
import secrets

app = Flask(
    __name__,
    static_folder='../frontend/dist',  # Adjust if your build folder is different
    static_url_path='/'
)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Centralized database location at project root
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'database', 'database.db'))
DATABASE = 'database.db'
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

# =========================
# Gmail Auth and Email Code
# =========================
def generate_reset_token():
    return secrets.token_urlsafe(32)

def gmail_authenticate():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'client_secret_325861786392-ulbb7o1nvka8mt6r6vdl6oln78a124m3.apps.googleusercontent.com.json',
            SCOPES
        )
        creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            def init_db():
                # Ensure database directory exists and initialize schema from file
                db_dir = os.path.abspath(os.path.join(BASE_DIR, '..', 'database'))
                os.makedirs(db_dir, exist_ok=True)
                schema_path = os.path.join(db_dir, 'schema.sql')
                with sqlite3.connect(DB_PATH) as conn:
                    if os.path.exists(schema_path):
                        with open(schema_path, 'r', encoding='utf-8') as f:
                            conn.executescript(f.read())
                    conn.commit()
        return jsonify({"status": "success", "message": "Password reset successfully"}), 200

    except sqlite3.Error as e:
        # Handle any SQLite database errors
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        # Catch any other errors
        return jsonify({"status": "error", "message": f"Failed to reset password: {str(e)}"}), 500
    finally:
        conn.close()



# =========================
# Database and API Endpoints
# =========================
@app.route("/")
def home():
    return "Backend is running."


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Create the 'users' table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            gender TEXT,
            phone_number TEXT,
            bio TEXT
        )
        ''')

        # Create the 'password_resets' table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at INTEGER NOT NULL
        )
        ''')

        # Create the 'groups' table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            size INTEGER NOT NULL,
            email TEXT NOT NULL,
            description TEXT,
            code TEXT UNIQUE NOT NULL,
            member_count INTEGER NOT NULL DEFAULT 1
        )
        ''')

        # Create the 'notifications' table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            group_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (group_id) REFERENCES groups(id)
        )
        ''')

        # Create the 'group_members' table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            email TEXT NOT NULL,
            joined_date TEXT NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')

        # Commit the changes to the database
        conn.commit()

# --- API ROUTES ---

@app.route('/groups', methods=['GET'])
def get_groups():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM groups')
        groups = cursor.fetchall()
        return jsonify(groups)

@app.route('/groups/search', methods=['GET'])
def search_user_groups():
    query = request.args.get('query', '')
    email = request.args.get('email', '')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Get user ID
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({'message': 'User not found'}), 404
        user_id = user_row[0]

        # Find groups the user created or joined that match the query
        cursor.execute('''
            SELECT DISTINCT g.*
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            WHERE (g.email = ? OR gm.user_id = ?)
              AND g.name LIKE ?
        ''', (email, user_id, f'%{query}%'))

        columns = [column[0] for column in cursor.description]
        groups = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify(groups)
@app.route('/groups/join', methods=['POST'])
def join_group_by_code():
    data = request.get_json()
    code = data.get('code')
    email = data.get('email')  # From frontend context, but trusted by design

    if not code or not email:
        return jsonify({'message': 'Group code and logged-in user email are required'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # 1. Lookup group by code
        cursor.execute('SELECT id, size FROM groups WHERE code = ?', (code,))
        group_row = cursor.fetchone()
        if not group_row:
            return jsonify({'message': 'Invalid group code'}), 400

        group_id, group_size = group_row

        # 2. Find user by email (must exist from registration)
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({'message': 'User not registered'}), 400

        user_id = user_row[0]

        # 3. Check if already a member
        cursor.execute('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', (group_id, user_id))
        if cursor.fetchone():
            return jsonify({'message': 'You are already a member of this group'}), 400

        # 4. Check if group is full
        cursor.execute('SELECT COUNT(*) FROM group_members WHERE group_id = ?', (group_id,))
        current_members = cursor.fetchone()[0]
        if current_members >= group_size:
            return jsonify({'message': 'Group is full'}), 400

        # 5. Add user to group (no join code anymore)
        cursor.execute('''
            INSERT INTO group_members (group_id, user_id, email, joined_date)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (group_id, user_id, email))
        
        cursor.execute('''
        UPDATE groups SET member_count = member_count + 1 WHERE id = ?
        ''', (group_id,))

        # Fetch all other group members except the joiner
        cursor.execute('''
            SELECT user_id FROM group_members
            WHERE group_id = ? AND user_id != ?
        ''', (group_id, user_id))
        other_members = cursor.fetchall()

        # Insert notification for each other member
        for member in other_members:
            cursor.execute('''
                INSERT INTO notifications (user_id, group_id, message)
                VALUES (?, ?, ?)
            ''', (
                member[0],
                group_id,
                f"{email} joined your group."
            ))


        conn.commit()
        return jsonify({'message': 'Successfully joined the group'}), 200
    
    
@app.route('/notifications/<string:email>', methods=['GET'])
def get_user_notifications(email):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify([])

        user_id = user_row[0]

        cursor.execute('''
            SELECT n.id, n.message, n.created_at
            FROM notifications n
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
        ''', (user_id,))
        notifications = [
            {'id': row[0], 'message': row[1], 'createdAt': row[2]} for row in cursor.fetchall()
        ]
        return jsonify(notifications)



@app.route('/groups/user/<string:email>', methods=['GET'])
def get_user_groups(email):
    with sqlite3.connect(DB_PATH) as conn:
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

        return jsonify(groups)

@app.route('/groups/<int:group_id>/leave', methods=['POST'])
def leave_group(group_id):
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email required'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        user_id = user[0]

        # Remove member
        cursor.execute('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', (group_id, user_id))
        cursor.execute('UPDATE groups SET member_count = member_count - 1 WHERE id = ?', (group_id,))
        conn.commit()

    return jsonify({'message': 'Left group successfully'}), 200

#@app.route('/send-reset-email', methods=['POST'])
#def api_send_reset_email():
#    data = request.json
#    to_email = data.get('to_email')
#    reset_link = data.get('reset_link')
#    try:
#        send_reset_email(to_email, reset_link)
#        return jsonify({'message': 'Reset email sent successfully'})
#    except Exception as e:
#        return jsonify({'error': str(e)}), 500

# --- FRONTEND ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        

        # Check if email is already in use
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            conn.close()
            return jsonify({"message": "Email already in use"}), 400

        # Hash password and insert new user
        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
        conn.commit()
        conn.close()

        return jsonify({"message": "User registered successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        if row and check_password_hash(row[0], password):
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401


def generate_group_code(length=5):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/groups', methods=['POST'])
def create_group():
    data = request.get_json()
    name = data.get('name')
    size = data.get('size')
    email = data.get('email')
    description = data.get('description')
    code = generate_group_code()  # Used only in 'groups' table

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()

            # 1. Insert group
            cursor.execute('''
                INSERT INTO groups (name, size, email, description, code, member_count)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (name, size, email, description, code, 1))
            group_id = cursor.lastrowid

            # 2. Get user ID of the creator
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            user_row = cursor.fetchone()
            if not user_row:
                raise Exception(f"User with email {email} not found")
            creator_id = user_row[0]

            # 3. Add creator as first member — NO join code here
            cursor.execute('''
                INSERT INTO group_members (group_id, user_id, email, joined_date)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ''', (group_id, creator_id, email))

            conn.commit()
            return jsonify({'id': group_id, 'code': code}), 201

    except Exception as e:
        print("Error creating group:", e)
        return jsonify({'error': str(e)}), 500
    
# Serve static files (JS, CSS, images, etc.)
@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    # If the file exists, serve it
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    # Otherwise, serve index.html (for React Router)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    # Validate email input
    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check if the user with the provided email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "Email not found"}), 404

        # Generate a unique reset token and set its expiration time (1 hour)
        token = generate_reset_token()
        expires = int(time.time()) + 3600  # 1 hour from now

        # Insert the password reset request into the database
        cursor.execute(
            "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
            (email, token, expires)
        )
        conn.commit()

        # Generate the reset link with the token
        reset_link = f"http://localhost:8080/reset-password?token={token}"

        # Attempt to send the reset email
        send_reset_email(email, reset_link)
        
        return jsonify({"status": "success", "message": "Password reset link sent successfully"}), 200

    except sqlite3.Error as e:
        # Handle any database related errors
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        # Handle any other errors, including email sending failures
        return jsonify({"status": "error", "message": f"Failed to send reset email: {str(e)}"}), 500



@app.route('/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()

    email = data.get('email')
    full_name = data.get('fullName')
    gender = data.get('gender')
    phone = data.get('phoneNumber')
    bio = data.get('bio')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        cursor.execute('''
    UPDATE users
    SET full_name = ?, gender = ?, phone_number = ?, bio = ?
    WHERE email = ?
''', (full_name, gender, phone, bio, email))

        conn.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200


# Serve index.html for the root
@app.route('/', methods=['GET'])
def root():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("Using database:", DB_PATH)
    init_db()
    app.run(debug=True)