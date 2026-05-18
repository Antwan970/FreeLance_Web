# User Management & Tracking System

## Overview

A complete user management system that tracks all registered users and their login activity, with a professional admin dashboard to view user statistics and details.

## Features

### 📊 User Tracking
- **Registration Tracking**: Every registered user is saved to MongoDB
- **Login Tracking**: Records last login time and login count for each user
- **User Status**: Tracks if user is active or inactive
- **Timestamps**: Automatic registration and last update timestamps

### 🎯 Admin Dashboard
- Real-time user statistics
- Complete user list with detailed information
- Role-based user filtering (Job Seeker vs Employer)
- Login history visualization
- User activity tracking

### 🔒 Security
- Passwords are hashed (not stored as plain text)
- Only authenticated admin can view user data
- User email is unique (no duplicate registrations)
- JWT token verification on all protected routes

## Database Schema (MongoDB)

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,              // User's full name
  email: String,             // Unique email (indexed)
  password: String,          // Hashed with bcryptjs
  role: String,              // 'jobseeker' or 'employer'
  profile: {
    bio: String,
    skills: [String],
    experience: String,
    resume: String
  },
  lastLogin: Date,           // Last login timestamp
  loginCount: Number,        // Total times user logged in
  isActive: Boolean,         // Account status
  createdAt: Date,           // Registration timestamp (auto)
  updatedAt: Date            // Last update timestamp (auto)
}
```

## Backend API Endpoints

### View All Users
```bash
GET /api/auth/users/list/all
```
**Response:**
```json
{
  "success": true,
  "totalUsers": 5,
  "users": [
    {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "jobseeker",
      "registeredAt": "2026-05-03T10:30:00Z",
      "lastLogin": "2026-05-03T15:45:00Z",
      "loginCount": 3,
      "isActive": true
    }
  ]
}
```

### View Statistics
```bash
GET /api/auth/stats/logins
```
**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 5,
    "activeUsers": 5,
    "jobseekers": 3,
    "employers": 2,
    "usersWithLogins": 4,
    "neverLoggedIn": 1
  }
}
```

## Frontend Components

### Admin Dashboard Component
File: `src/components/Admin.jsx`

Features:
- Display statistics in card format
- Responsive table with user details
- Real-time data refresh button
- Automatic timestamp formatting
- Role and status badges

Usage:
```jsx
import Admin from '../components/Admin';

// Add to your router or pages
<Route path="/admin" element={<Admin />} />
```

### Admin CSS
File: `src/styles/Admin.css`

Includes:
- Responsive grid layout
- Professional table styling
- Status and role badges
- Mobile-friendly design

## Using the Admin Panel

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Admin Dashboard
```
http://localhost:5173/admin
```

## Viewing Users in Terminal

### Run the User Viewer Script
```bash
cd backend
node scripts/viewUsers.js
```

This will display:
- All registered users with details
- Login statistics
- User activity summary

Example output:
```
=== ALL REGISTERED USERS ===

1. John Doe
   Email: john@example.com
   Role: jobseeker
   Registered: 5/3/2026, 10:30:00 AM
   Last Login: 5/3/2026, 3:45:00 PM
   Login Count: 3
   Status: Active

2. Jane Smith
   Email: jane@example.com
   Role: employer
   Registered: 5/3/2026, 11:00:00 AM
   Last Login: Never
   Login Count: 0
   Status: Active

=== STATISTICS ===
Total Users: 2
Job Seekers: 1
Employers: 1
Users Who Logged In: 1
Never Logged In: 1
```

## How User Tracking Works

### Registration Flow
1. User fills registration form
2. Backend validates input
3. Password is hashed with bcryptjs
4. User saved to MongoDB with:
   - `createdAt`: Current timestamp
   - `loginCount`: 0
   - `lastLogin`: null
   - `isActive`: true

### Login Flow
1. User submits login credentials
2. Backend verifies password
3. If password matches:
   - `lastLogin` updated to current time
   - `loginCount` incremented by 1
   - User data saved to database
4. JWT token generated and sent to frontend

## Data Stored in MongoDB

### Example User Document
```json
{
  "_id": "60d5ec49c1234567890abcde",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",  // Hashed password
  "role": "jobseeker",
  "profile": {
    "bio": "Software developer",
    "skills": ["React", "Node.js"],
    "experience": "5 years",
    "resume": "url_to_resume"
  },
  "lastLogin": "2026-05-03T15:45:00.000Z",
  "loginCount": 3,
  "isActive": true,
  "createdAt": "2026-05-03T10:30:00.000Z",
  "updatedAt": "2026-05-03T15:45:00.000Z"
}
```

## Querying Users with MongoDB

### View all users in MongoDB CLI
```bash
# Connect to MongoDB
mongosh

# Use database
use jobportal

# View all users
db.users.find()

# View specific user
db.users.findOne({ email: "john@example.com" })

# Count total users
db.users.countDocuments()

# Find users who never logged in
db.users.find({ loginCount: 0 })

# Find active employers
db.users.find({ role: "employer", isActive: true })
```

## Test Data

### Create Test Users Manually
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Register users via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@example.com",
    "password": "password123",
    "role": "employer"
  }'

# View all users
http://localhost:5000/api/auth/users/list/all

# View statistics
http://localhost:5000/api/auth/stats/logins
```

## Features Implemented

✅ User registration with password hashing
✅ User login with password verification
✅ Login tracking (date and count)
✅ User status management
✅ Admin dashboard for viewing users
✅ Real-time statistics
✅ MongoDB integration with proper schema
✅ Responsive UI for mobile and desktop
✅ Terminal script for viewing users
✅ API endpoints for admin access

## Next Steps

1. Add admin authentication (only admins can view user list)
2. Add user profile editing capability
3. Add user search and filtering
4. Add export users to CSV/Excel
5. Add user activity logs
6. Add session management
7. Add email verification for new registrations
8. Add password reset functionality

## Troubleshooting

### No users showing in admin panel
- Make sure backend is running on port 5000
- Check MongoDB connection in .env file
- Register at least one user first

### Login count not updating
- Make sure user logs in with correct password
- Check backend console for errors
- Verify MongoDB is running

### Admin page won't load
- Add the Admin route to your router
- Check browser console for errors
- Verify API endpoints are accessible

## Summary

This user management system provides:
- ✅ Complete user registration and login with secure password handling
- ✅ Automatic tracking of user activity (login times and counts)
- ✅ Professional admin dashboard to view all users and statistics
- ✅ Proper MongoDB integration with indexed fields
- ✅ API endpoints for admin access
- ✅ Terminal utility to view users from command line
