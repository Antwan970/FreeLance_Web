# Admin System - Setup & Usage Guide

## Overview

A complete admin management system where only authorized admins can access the admin dashboard to view and manage users.

## Features

✅ **Admin-only Dashboard** - Protected admin panel with authentication
✅ **Admin Collection in MongoDB** - Separate table for admin users
✅ **Role-based Access** - Superadmin and Admin roles with different permissions
✅ **Admin Login Tracking** - Track admin login activity
✅ **User Management** - View all users and statistics
✅ **Admin Creation** - Create and manage admin users
✅ **Permissions System** - Control what admins can do

## Database Structure

### Admin Collection (MongoDB)
```json
{
  "_id": ObjectId,
  "userId": ObjectId,              // Reference to User
  "name": String,                  // Admin name
  "email": String,                 // Admin email (unique)
  "role": String,                  // 'superadmin' or 'admin'
  "permissions": {
    "viewUsers": Boolean,          // Can view users
    "editUsers": Boolean,          // Can edit users
    "deleteUsers": Boolean,        // Can delete users
    "viewJobs": Boolean,           // Can view jobs
    "editJobs": Boolean,           // Can edit jobs
    "viewStats": Boolean           // Can view statistics
  },
  "status": String,                // 'active' or 'inactive'
  "lastAdminLogin": Date,          // Last login to admin panel
  "adminLoginCount": Number,       // Total admin logins
  "createdAt": Date,               // When admin was created
  "updatedAt": Date                // Last update
}
```

## Setup Steps

### Step 1: Start Backend & MongoDB
```bash
# Terminal 1
cd d:\FreeLance3\backend
npm run dev
```

### Step 2: Register a User
- Open frontend: http://localhost:5173
- Click Register
- Fill in: Name, Email, Password, Role
- Register with any email

### Step 3: Create Admin User
Run this command to make the first registered user an admin:
```bash
cd d:\FreeLance3\backend
node scripts/createAdmin.js
```

Output:
```
✓ Connected to MongoDB
Available users:
1. John Doe (john@example.com)

✓ Admin created successfully!
Admin Details:
- Name: John Doe
- Email: john@example.com
- Role: superadmin
- Status: active
```

### Step 4: Login as Admin
- Login with the admin account credentials
- You should now be able to access the admin panel at `/admin`

### Step 5: Add More Admins
Once you have a superadmin, create additional admins through the API:

```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "x-auth-token: <admin_token>" \
  -d '{
    "userId": "user_id_here",
    "role": "admin"
  }'
```

## API Endpoints

### Admin Dashboard (Protected)
```
GET /api/admin/dashboard
Headers: x-auth-token: <token>
```
Returns: Stats, admin info, and permissions

### Get All Users (Admin Only)
```
GET /api/admin/users
Headers: x-auth-token: <token>
```
Returns: All users list with details

### Get All Admins (Admin Only)
```
GET /api/admin/list
Headers: x-auth-token: <token>
```
Returns: All admin users

### Create New Admin (Superadmin Only)
```
POST /api/admin/create
Headers: x-auth-token: <token>
Body: {
  "userId": "user_id",
  "role": "admin"  // or "superadmin"
}
```

### Update Admin Permissions (Superadmin Only)
```
PUT /api/admin/:adminId/permissions
Headers: x-auth-token: <token>
Body: {
  "permissions": {
    "viewUsers": true,
    "editUsers": true,
    "deleteUsers": false,
    "viewJobs": true,
    "editJobs": true,
    "viewStats": true
  }
}
```

### Remove Admin (Superadmin Only)
```
DELETE /api/admin/:adminId
Headers: x-auth-token: <token>
```

### Track Admin Login
```
POST /api/admin/login-track
Headers: x-auth-token: <token>
```

## Admin Panel Access

### URLs
- Admin Dashboard: `http://localhost:5173/admin`
- View Users: Displayed in table on dashboard
- Statistics: Shown in stat cards at top

### What You Can Do
- ✅ View all registered users
- ✅ View user statistics (total users, active users, roles)
- ✅ See last login times for each user
- ✅ Track login counts
- ✅ View admin information
- ✅ Track admin access (admin login count)

### Access Control
- **Only Admins**: Can access the admin dashboard
- **Non-Admins**: Get "Admin access required" error
- **Superadmins**: Can create and manage other admins
- **Regular Admins**: Can only view data based on permissions

## MongoDB Queries

### View All Admins
```javascript
// mongosh
use jobportal
db.admins.find()
```

### View Specific Admin
```javascript
db.admins.findOne({ email: "admin@example.com" })
```

### View Admin with User Details
```javascript
db.admins.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "userDetails"
    }
  }
])
```

### Count Total Admins
```javascript
db.admins.countDocuments()
```

### Find Active Admins
```javascript
db.admins.find({ status: "active" })
```

### Find Superadmins
```javascript
db.admins.find({ role: "superadmin" })
```

## Testing

### Test 1: Create Admin from First User
```bash
node scripts/createAdmin.js
```

### Test 2: Login as Admin
1. Go to http://localhost:5173
2. Login with admin credentials
3. Access admin panel at http://localhost:5173/admin

### Test 3: Test Non-Admin Access
1. Register as a new user
2. Try to access /admin
3. Should see "Admin access required" error

### Test 4: View Admin Data
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "x-auth-token: <admin_token>"
```

## File Structure

```
backend/
├── models/
│   └── Admin.js                    # Admin schema
├── routes/
│   └── admins.js                   # Admin routes
├── scripts/
│   ├── createAdmin.js              # Create first admin
│   └── viewUsers.js                # View all users
└── server.js                       # Updated with admin routes

frontend/
├── components/
│   └── Admin.jsx                   # Admin dashboard (updated)
└── styles/
    └── Admin.css                   # Admin styles
```

## Troubleshooting

### "Admin access required" Error
- Make sure you've created an admin user
- Run: `node scripts/createAdmin.js`
- Make sure you're logged in with admin account

### "Failed to fetch admin data"
- Backend might not be running on port 5000
- Check MongoDB connection
- Verify token is being sent correctly

### Admin panel won't load
- Make sure you have an active admin token
- Check browser console for error details
- Try logging out and logging back in

### Can't create admin
- Make sure the user exists in Users collection
- You must be a superadmin to create new admins
- Run `node scripts/createAdmin.js` for the first admin

## Summary

✅ Admin collection separate from regular users
✅ Protected admin dashboard with role-based access
✅ Create admins using scripts or API
✅ Track admin logins and activity
✅ View all users and statistics
✅ Permission-based access control
✅ Superadmin and Admin roles

**First Admin Created:** Superadmin with all permissions
**Other Admins Created:** Regular admins with customizable permissions
**Security:** Only admins can access admin panel, token required
