# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                        Port: 8080                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Components  │  Contexts  │  Hooks  │  Pages  │  Utils     │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/JSON (REST API)
                         │ CORS Enabled
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask)                             │
│                        Port: 5000                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                        ROUTES                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │ │
│  │  │  Auth    │  │  User    │  │        Group             │  │ │
│  │  │  Routes  │  │  Routes  │  │        Routes            │  │ │
│  │  └────┬─────┘  └────┬─────┘  └──────────┬───────────────┘  │ │
│  │       │             │                     │                  │ │
│  └───────┼─────────────┼─────────────────────┼──────────────────┘ │
│          │             │                     │                    │
│  ┌───────▼─────────────▼─────────────────────▼──────────────────┐ │
│  │                     CONTROLLERS                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │    Auth      │  │    User      │  │      Group       │   │ │
│  │  │  Controller  │  │  Controller  │  │    Controller    │   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │ │
│  │         │                 │                     │             │ │
│  └─────────┼─────────────────┼─────────────────────┼─────────────┘ │
│            │                 │                     │               │
│  ┌─────────▼─────────────────▼─────────────────────▼─────────────┐ │
│  │                         MODELS                                 │ │
│  │  ┌────────┐  ┌────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │  User  │  │ Group  │  │   Password   │  │ Notification │  │ │
│  │  │  Model │  │ Model  │  │ Reset Model  │  │    Model     │  │ │
│  │  └────┬───┘  └───┬────┘  └──────┬───────┘  └──────┬───────┘  │ │
│  │       │          │               │                  │          │ │
│  └───────┼──────────┼───────────────┼──────────────────┼──────────┘ │
│          │          │               │                  │            │
│  ┌───────▼──────────▼───────────────▼──────────────────▼──────────┐ │
│  │                      SERVICES                                   │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │           Email Service (Gmail API)                      │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (SQLite)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Schema: schema.sql  │  DB File: database.db               │ │
│  │                                                              │ │
│  │  Tables:                                                     │ │
│  │  • users                • groups                             │ │
│  │  • group_members        • notifications                      │ │
│  │  • password_resets                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: User Registration

```
1. User fills registration form in React
   └─> POST /api/register with {email, password}
       │
       ▼
2. auth_routes.py receives request
   └─> Calls AuthController.register()
       │
       ▼
3. AuthController validates input
   └─> Calls User.create(email, password)
       │
       ▼
4. User Model
   └─> Hashes password
   └─> Executes SQL INSERT via db_config
       │
       ▼
5. Database saves user
   └─> Returns user_id
       │
       ▼
6. Response flows back up
   └─> Controller → Route → Frontend
   └─> JSON: {success: true, message: "User registered"}
```

## RESTful API Design

| HTTP Method | Endpoint | Description |
|-------------|----------|-------------|
| POST | `/api/register` | Create new user account |
| POST | `/api/login` | Authenticate user |
| POST | `/api/forgot-password` | Request password reset |
| POST | `/api/reset-password` | Reset password with token |
| PUT | `/api/profile` | Update user profile |
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create new group |
| GET | `/api/groups/search` | Search user's groups |
| GET | `/api/groups/user/:email` | Get user's groups with details |
| POST | `/api/groups/join` | Join group with code |
| POST | `/api/groups/:id/leave` | Leave a group |
| GET | `/api/notifications/:email` | Get user notifications |

## MVC Architecture Benefits

### Models (Data Layer)
- ✅ Encapsulates all database operations
- ✅ Single source of truth for data logic
- ✅ Easy to test with mock databases
- ✅ Reusable across controllers

### Controllers (Business Logic Layer)
- ✅ Handles request validation
- ✅ Orchestrates multiple models
- ✅ Implements business rules
- ✅ Independent of routing framework

### Routes (Presentation Layer)
- ✅ Maps HTTP requests to controllers
- ✅ RESTful endpoint design
- ✅ Clean URL structure
- ✅ Easy to document and test

### Services (External Integration Layer)
- ✅ Isolates third-party dependencies
- ✅ Easy to mock for testing
- ✅ Centralized external API calls
- ✅ Reusable across application

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router
- **State**: Context API

### Backend
- **Framework**: Flask 3.0
- **Architecture**: MVC/Clean Architecture
- **Auth**: Werkzeug password hashing
- **Email**: Gmail API
- **CORS**: Flask-CORS

### Database
- **Type**: SQLite
- **ORM**: None (raw SQL for simplicity)
- **Schema**: Version controlled in schema.sql

## Folder Structure Rationale

```
├── backend/          # All Python backend code
│   ├── controllers/  # Request handlers (business logic)
│   ├── models/       # Data access layer
│   ├── routes/       # API endpoints (RESTful routes)
│   └── services/     # External integrations
│
├── database/         # Database schema and config
│   ├── schema.sql    # Version-controlled schema
│   └── db_config.py  # Connection management
│
└── frontend/         # All React frontend code
    ├── src/          # Application source
    ├── public/       # Static assets
    └── dist/         # Production build
```

This structure ensures:
1. ✅ Clear separation of concerns
2. ✅ Easy to navigate and find code
3. ✅ Scalable as project grows
4. ✅ Team members can work independently
5. ✅ Simple deployment (backend serves frontend)
