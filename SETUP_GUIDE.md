# Job Portal - Full Stack Setup Guide

## Project Structure
```
d:\FreeLance3\
├── frontend/        (React Vite App - Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Home.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api.js              (NEW - API utility with token headers)
│   │   └── main.jsx
│   └── package.json
│
└── backend/         (Node.js Express - Port 5000)
    ├── server.js
    ├── models/
    │   ├── User.js
    │   └── Job.js
    ├── routes/
    │   ├── auth.js             (UPDATED - Better error handling)
    │   ├── jobs.js
    │   └── users.js
    ├── middleware/
    │   └── auth.js             (JWT verification)
    ├── .env                    (IMPORTANT - Configure this)
    └── package.json
```

## Backend Setup

### 1. Install MongoDB
Download and install MongoDB from: https://www.mongodb.com/try/download/community

### 2. Start MongoDB Service
**Windows:**
```bash
# If installed as service, it starts automatically
# Or run mongod manually from installation directory
```

### 3. Install Backend Dependencies
```bash
cd d:\FreeLance3\backend
npm install
```

### 4. Configure Environment Variables
Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

### 5. Start Backend Server
```bash
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
cd d:\FreeLance3\frontend
npm install
```

### 2. Start Frontend Development Server
```bash
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Authentication Flow

### Registration
1. User fills form with: Name, Email, Password, Role (Job Seeker or Employer)
2. Frontend sends POST to `http://localhost:5000/api/auth/register`
3. Backend:
   - Validates input
   - Checks if email already exists
   - Hashes password with bcryptjs
   - Saves user to MongoDB
   - Generates JWT token
   - Returns token + user data
4. Frontend stores token in localStorage
5. User redirected to jobs page

### Login
1. User enters email and password
2. Frontend sends POST to `http://localhost:5000/api/auth/login`
3. Backend:
   - Finds user by email
   - Compares password using bcrypt.compare()
   - If match: Generates JWT token
   - If no match: Returns "Invalid email or password"
4. Token stored in localStorage and AuthContext state
5. Token automatically included in all API requests via `x-auth-token` header

### Token Authentication
- Token stored in `localStorage.getItem('token')`
- All requests include header: `x-auth-token: <token>`
- Backend middleware (auth.js) verifies token
- If expired or invalid: Returns 401 Unauthorized

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Jobs (All require token)
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post new job (employer only)
- `POST /api/jobs/:id/apply` - Apply to job (jobseeker only)
- `PUT /api/jobs/:id` - Update job (owner only)
- `DELETE /api/jobs/:id` - Delete job (owner only)

### Users (All require token)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile (self only)

## Testing the System

### Test User Creation (Registration)
```bash
# Terminal or Postman
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'

# Expected response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker"
  }
}
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Password Verification
Try logging in with wrong password - should get: "Invalid email or password"

### Get Jobs (with token)
```bash
curl -X GET http://localhost:5000/api/jobs \
  -H "x-auth-token: <your_token_here>"
```

## Frontend Components Updated

### Login.jsx
- Connects to backend `/api/auth/login`
- Validates email and password format
- Shows error messages from backend
- Stores token in localStorage after successful login

### Register.jsx
- Changed roles from "freelancer/client" to "jobseeker/employer"
- Removed skills field (can be added to profile later)
- Connects to backend `/api/auth/register`
- Password matching validation
- Shows backend error messages

### AuthContext.jsx
- Updated to handle backend error message format
- Stores token in localStorage and state
- Provides useAuth() hook for all components
- Token automatically sent in API requests

### Jobs.jsx
- Uses new `api.js` utility functions
- Automatically includes token in headers
- Fetches jobs from backend

## Important Notes

### Password Hashing
- ✅ Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ Plain text password NEVER stored in database
- ✅ Password compared with bcrypt.compare() on login
- ✅ Same password always produces different hash (secure)

### Token Management
- ✅ JWT token expires in 7 days
- ✅ Token stored securely in localStorage
- ✅ Token included in all protected requests
- ✅ Backend verifies token signature and expiry

### Database
- ✅ User emails are unique (no duplicate registrations)
- ✅ Job applications tracked per user
- ✅ Timestamps automatically added to records

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB service is running
- Check MongoDB URI in .env
- Verify port 27017 is not blocked

### "CORS error" or "Cannot reach backend"
- Ensure backend server is running on port 5000
- Check that frontend can reach http://localhost:5000
- Verify CORS middleware is enabled in server.js

### "Token invalid or expired"
- Token might have expired (7 days)
- User needs to login again
- Clear localStorage and retry

### "Password doesn't match" after registration
- Frontend validates: passwords must match in form
- Backend validates: password must be 6+ characters
- Check for typos in password

## Next Steps

1. ✅ Backend fully connected with MongoDB
2. ✅ Authentication system working with password verification
3. ✅ Frontend components properly integrated
4. 📝 Add job posting functionality (employers)
5. 📝 Add user profile management
6. 📝 Add job search and filtering
7. 📝 Add job applications viewing

Run both servers and test the login/register flow!
