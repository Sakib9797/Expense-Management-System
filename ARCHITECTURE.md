# Project Structure Overview

## ✅ RESTful API Implementation

All backend routes follow RESTful conventions:
- **Authentication**: `/api/register`, `/api/login`, `/api/forgot-password`, `/api/reset-password`
- **User Profile**: `/api/profile`
- **Groups**: `/api/groups` (GET, POST), `/api/groups/search`, `/api/groups/user/:email`, `/api/groups/join`, `/api/groups/:id/leave`
- **Notifications**: `/api/notifications/:email`

All endpoints use proper HTTP methods (GET, POST, PUT) and return JSON responses.

## ✅ MVC/Clean Architecture

### Layer Separation

#### 1. **Models** (`backend/models/`)
Data access layer with business entities:
- `user_model.py` - User CRUD and authentication
- `group_model.py` - Group operations
- `password_reset_model.py` - Token management
- `notification_model.py` - Notification queries

#### 2. **Controllers** (`backend/controllers/`)
Business logic and request handling:
- `auth_controller.py` - Authentication logic
- `user_controller.py` - Profile management
- `group_controller.py` - Group operations

#### 3. **Routes** (`backend/routes/`)
API endpoint definitions using Flask Blueprints:
- `auth_routes.py` - Authentication endpoints
- `user_routes.py` - User endpoints
- `group_routes.py` - Group endpoints

#### 4. **Services** (`backend/services/`)
External integrations:
- `email_service.py` - Gmail API integration

#### 5. **Database** (`database/`)
Centralized database management:
- `schema.sql` - Database schema
- `db_config.py` - Connection configuration
- `database.db` - SQLite database file

## ✅ Folder Structure

```
expense_splitter-main/
│
├── backend/                  # Python Flask backend
│   ├── controllers/         # Business logic controllers
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── user_controller.py
│   │   └── group_controller.py
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── user_model.py
│   │   ├── group_model.py
│   │   ├── password_reset_model.py
│   │   └── notification_model.py
│   ├── routes/              # API routes/endpoints
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   └── group_routes.py
│   ├── services/            # External services
│   │   ├── __init__.py
│   │   └── email_service.py
│   ├── __init__.py
│   ├── app.py              # Original monolithic app (deprecated)
│   ├── app_new.py          # New MVC Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── auth_gmail.py       # Gmail auth utilities
│   └── send_email.py       # Email utilities
│
├── database/                # Database layer
│   ├── __init__.py
│   ├── db_config.py        # Database connection config
│   ├── schema.sql          # Database schema definition
│   └── database.db         # SQLite database (generated)
│
├── frontend/                # React TypeScript frontend
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/             # Static assets
│   ├── dist/               # Production build (generated)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── .gitignore
└── README.md               # Project documentation
```

## Benefits of Current Architecture

### 1. **Separation of Concerns**
- Each layer has a single responsibility
- Models handle data, controllers handle logic, routes handle routing
- Easy to test and maintain

### 2. **Scalability**
- New features can be added without modifying existing code
- Each component is independent and can be scaled separately

### 3. **Maintainability**
- Clear folder structure makes code easy to find
- Consistent patterns across all modules
- Self-documenting code organization

### 4. **Reusability**
- Models can be used by multiple controllers
- Services can be shared across the application
- Database layer is centralized

### 5. **Testability**
- Each layer can be tested independently
- Mock data can be injected at any layer
- Unit tests and integration tests are straightforward

## How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python app_new.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production
```bash
cd frontend
npm run build
cd ../backend
python app_new.py
```

Backend serves the built frontend automatically from `frontend/dist`.

## Migration Notes

- **Old**: All code in single `backend/app.py` file (631 lines)
- **New**: Organized into MVC layers with proper separation
- **Database**: Moved from `backend/database.db` to `database/database.db`
- **Frontend**: Moved from root to `frontend/` folder
- **Legacy**: `app.py` kept for reference, use `app_new.py` going forward
