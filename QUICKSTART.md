# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed  
- ✅ pip (Python package manager)
- ✅ npm or bun (Node package manager)

## Step 1: Backend Setup

Open a terminal and navigate to the project root:

```powershell
cd "d:\VSCode\Expense Splitter Project [GITHUB]\expense_splitter-main"
```

Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the backend server:

```bash
python backend/app_new.py
```

You should see:
```
Using database: d:\...\database\database.db
 * Running on http://127.0.0.1:5000
```

## Step 2: Frontend Setup

Open a **new terminal** and navigate to the frontend folder:

```powershell
cd "d:\VSCode\Expense Splitter Project [GITHUB]\expense_splitter-main\frontend"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

## Step 3: Access the Application

Open your browser and go to:
```
http://localhost:8080
```

## Architecture Verification

✅ **RESTful API**: All endpoints use `/api/*` prefix with proper HTTP methods  
✅ **MVC Pattern**: Backend organized into Models, Controllers, Routes  
✅ **Clean Separation**: 
- Frontend → `frontend/` folder
- Backend → `backend/` folder  
- Database → `database/` folder

## API Endpoints Available

### Authentication
- POST `/api/register` - Create new account
- POST `/api/login` - Sign in
- POST `/api/forgot-password` - Request reset
- POST `/api/reset-password` - Reset with token

### Groups
- GET `/api/groups` - List all groups
- POST `/api/groups` - Create group
- POST `/api/groups/join` - Join with code
- POST `/api/groups/:id/leave` - Leave group

### Profile
- PUT `/api/profile` - Update user info

## Troubleshooting

### Backend won't start
- Check Python version: `python --version`
- Reinstall dependencies: `pip install -r backend/requirements.txt`
- Check port 5000 is free

### Frontend won't start
- Check Node version: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check port 8080 is free

### Database errors
- The database will be automatically created at `database/database.db`
- If issues persist, delete `database/database.db` and restart backend

## Production Build

To build for production:

```bash
cd frontend
npm run build
```

Then start only the backend:

```bash
cd ..
python backend/app_new.py
```

The Flask server will serve the built frontend from `frontend/dist/`.

## Next Steps

1. ✅ Test user registration and login
2. ✅ Create a group and get the join code
3. ✅ Join a group using the code
4. ✅ Test profile updates
5. ✅ Check notifications

Happy coding! 🚀
