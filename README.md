# Expense Splitter Project

A full-stack expense splitting application built with Flask (Python) backend and React (TypeScript) frontend.

## Project Structure

```
expense_splitter-main/
├── backend/              # Flask backend with MVC architecture
│   ├── models/          # Database models
│   ├── controllers/     # Business logic controllers
│   ├── routes/          # RESTful API routes
│   ├── services/        # External services (email, etc.)
│   └── app_new.py       # Main Flask application
├── database/            # Database configuration and schema
│   ├── schema.sql       # Database schema definition
│   ├── db_config.py     # Database connection configuration
│   └── database.db      # SQLite database file (generated)
├── frontend/            # React frontend application
│   ├── src/            # Source files
│   ├── public/         # Static assets
│   └── dist/           # Production build (generated)
└── README.md           # This file
```

## Architecture

### Backend (Flask - MVC/Clean Architecture)
- **Models**: Database operations and business entities
  - `user_model.py`: User authentication and profile management
  - `group_model.py`: Group management operations
  - `password_reset_model.py`: Password reset token handling
  - `notification_model.py`: User notifications
- **Controllers**: Request handling and response formatting
  - `auth_controller.py`: Authentication logic
  - `user_controller.py`: User profile operations
  - `group_controller.py`: Group management logic
- **Routes**: RESTful API endpoints
  - `auth_routes.py`: `/api/register`, `/api/login`, `/api/forgot-password`, `/api/reset-password`
  - `user_routes.py`: `/api/profile`
  - `group_routes.py`: `/api/groups/*`, `/api/notifications/*`
- **Services**: External integrations
  - `email_service.py`: Gmail API integration for emails

### Database (SQLite)
- Centralized in `/database` folder
- Schema defined in `schema.sql`
- Tables: users, groups, group_members, notifications, password_resets

### Frontend (React + TypeScript + Vite)
- Located in `/frontend` folder
- Built with Vite for fast development
- Uses shadcn/ui components and Tailwind CSS

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or bun

### Backend Setup

1. Navigate to the project root:
   ```bash
   cd "d:\VSCode\Expense Splitter Project [GITHUB]\expense_splitter-main"
   ```

2. Install Python dependencies:
   ```bash
   pip install flask flask-cors werkzeug google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   ```

3. Run the backend server:
   ```bash
   python backend/app_new.py
   ```

   The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   The frontend will start on `http://localhost:8080`

### Production Build

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   # or
   bun run build
   ```

2. The Flask backend will automatically serve the built frontend from `frontend/dist`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### User Profile
- `PUT /api/profile` - Update user profile

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/search` - Search user groups
- `GET /api/groups/user/:email` - Get user's groups
- `POST /api/groups/join` - Join group with code
- `POST /api/groups/:id/leave` - Leave group

### Notifications
- `GET /api/notifications/:email` - Get user notifications

## Features

- ✅ RESTful API design
- ✅ MVC/Clean Architecture pattern
- ✅ Organized folder structure (frontend, backend, database)
- ✅ User authentication with password hashing
- ✅ Group management with join codes
- ✅ Email notifications (Gmail API)
- ✅ Password reset functionality
- ✅ User profiles
- ✅ Real-time notifications

## Development

- Backend uses Flask with blueprints for modular routing
- Frontend uses React Router for navigation
- Database operations are abstracted in model classes
- CORS enabled for local development
- Hot reload enabled for both frontend and backend

---

## Technologies Used

This project is built with:

**Frontend:**
- React with TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn-ui components
- React Router for navigation

**Backend:**
- Python Flask
- SQLite database
- Flask-CORS for cross-origin requests
- MVC architecture pattern

## Development Setup

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies
cd frontend
npm install

# Step 4: Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Step 5: Start the development servers
# Terminal 1 - Backend
cd backend
python app_new.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```
