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

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/461c840a-756d-44d0-a039-5717471152f1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/461c840a-756d-44d0-a039-5717471152f1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/461c840a-756d-44d0-a039-5717471152f1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
