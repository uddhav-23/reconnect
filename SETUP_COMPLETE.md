# 🎉 ReConnect - Complete Setup Guide

## ✅ Your Super Admin Account

**Email:** `uddhavjoshi24@gmail.com`  
**Default Password:** `Reconnect2024!`

⚠️ **IMPORTANT:** Change this password after first login!

### To Set Up Your Super Admin:

**Option 1: Run the Setup Script**
```bash
node scripts/setSuperAdmin.js
```

**Option 2: Manual Setup (Firebase Console)**
1. Go to Firebase Console → Authentication → Users
2. Add user: `uddhavjoshi24@gmail.com` with password `Reconnect2024!`
3. Copy the User UID
4. Go to Firestore → `users` collection
5. Create document with User UID as document ID
6. Add fields:
   - `email`: "uddhavjoshi24@gmail.com"
   - `name`: "Super Admin"
   - `role`: "superadmin"
   - `universityId`: "1"
   - `createdAt`: [current timestamp]

---

## 🚀 Complete Feature List

### ✅ Authentication & User Management
- [x] User Signup (with role selection)
- [x] User Login
- [x] Password Management
- [x] Profile Updates
- [x] Super Admin Account Setup

### ✅ Super Admin Features
- [x] Create Super Admins
- [x] Create Sub-Admins
- [x] Create Alumni
- [x] Create Students
- [x] Create Colleges
- [x] Assign Demo Credentials to Users
- [x] View All Colleges
- [x] View All Alumni
- [x] Manage System

### ✅ Sub-Admin Features
- [x] Create Alumni (with demo credentials)
- [x] Edit Alumni Profiles
- [x] Delete Alumni
- [x] View College Alumni
- [x] Manage Blogs
- [x] Delete Blogs

### ✅ CRUD Operations
- [x] **CREATE**: Alumni, Blogs, Colleges, Achievements, Users
- [x] **READ**: All entities with filtering
- [x] **UPDATE**: Edit forms for all entities
- [x] **DELETE**: Delete with confirmation

### ✅ User Features
- [x] View Alumni Directory
- [x] View Blogs
- [x] View Alumni Profiles
- [x] Signup & Login

---

## 📋 How to Create Users (Super Admin)

### Create Super Admin
1. Login as super admin
2. Click "CREATE SUPER ADMIN" button
3. Fill in:
   - Name
   - Email
   - Demo Password (assigned to user)
   - Phone (optional)
4. Click "CREATE SUPER ADMIN"
5. **Copy the credentials** shown and share with the new super admin

### Create Sub-Admin
1. Click "ADD COLLEGE" button
2. Fill college details
3. Fill sub-admin details:
   - Director Name
   - Email (must match college domain)
   - Demo Password
   - Contact Number
4. College and sub-admin are created together
5. **Credentials are shown** - share with sub-admin

### Create Alumni
1. Click "CREATE ALUMNI" button
2. Fill in:
   - Personal Information
   - Academic Information
   - Professional Information
   - **Demo Password** (for login)
3. Click "CREATE ALUMNI"
4. **Credentials are displayed** - share with alumni

---

## 🔐 Demo Credentials System

When you create any user (super admin, sub-admin, alumni, student), you assign:
- **Email**: User's email address
- **Demo Password**: Password they'll use to login

After creation, the system shows:
```
✅ USER CREATED SUCCESSFULLY!

DEMO LOGIN CREDENTIALS
Email: user@example.com
Password: DemoPass123

Share these credentials with the user.
```

Users can then:
1. Go to `/login`
2. Use the provided email and password
3. Login and access their dashboard

---

## 🎯 Quick Start

1. **Set Up Super Admin**
   ```bash
   node scripts/setSuperAdmin.js
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Login**
   - Go to: http://localhost:5175/login
   - Email: `uddhavjoshi24@gmail.com`
   - Password: `Reconnect2024!`

4. **Start Creating Users**
   - Use "CREATE SUPER ADMIN" for new super admins
   - Use "CREATE ALUMNI" for alumni
   - Use "ADD COLLEGE" for colleges and sub-admins

---

## 📁 Project Structure

```
reconnect/
├── src/
│   ├── components/
│   │   ├── forms/
│   │   │   ├── AddAlumniForm.tsx      # Create alumni
│   │   │   ├── AddCollegeForm.tsx     # Create college
│   │   │   ├── CreateUserForm.tsx     # Create any user type
│   │   │   ├── EditAlumniForm.tsx     # Edit alumni
│   │   │   └── CreateSubAdminForm.tsx # Create sub-admin
│   │   └── ...
│   ├── pages/
│   │   ├── dashboards/
│   │   │   ├── SuperAdminDashboard.tsx # Super admin panel
│   │   │   ├── SubAdminDashboard.tsx   # Sub-admin panel
│   │   │   └── AlumniDashboard.tsx    # Alumni panel
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ...
│   ├── services/
│   │   ├── firebaseAuth.ts            # Authentication
│   │   ├── firebaseFirestore.ts        # Database operations
│   │   └── crudExamples.ts            # CRUD examples
│   └── config/
│       └── firebase.ts                # Firebase config
├── scripts/
│   ├── setSuperAdmin.js               # Setup super admin
│   └── createSuperAdmin.js            # Create super admin helper
└── ...
```

---

## 🔥 Firebase Collections

- `users` - All users (superadmin, subadmin, alumni, students, users)
- `colleges` - College information
- `blogs` - Blog posts
- `achievements` - User achievements
- `connections` - User connections

---

## 🎨 Features by Role

### Super Admin
- ✅ Create super admins, sub-admins, alumni, students
- ✅ Create and manage colleges
- ✅ View all system data
- ✅ Assign demo credentials
- ✅ Full system control

### Sub-Admin
- ✅ Create alumni (with demo credentials)
- ✅ Edit/Delete alumni
- ✅ View college alumni
- ✅ Manage blogs
- ✅ College management

### Alumni
- ✅ View profile
- ✅ Edit profile
- ✅ Create blogs
- ✅ View connections

### Student/User
- ✅ View alumni directory
- ✅ View blogs
- ✅ Basic profile

---

## 🚨 Important Notes

1. **Demo Credentials**: Always share the credentials shown after user creation
2. **Password Security**: Users should change passwords after first login
3. **Email Domains**: Sub-admin emails must match college domain
4. **Firebase Rules**: Security rules are set for authenticated users
5. **First Login**: Super admin should change default password

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console for errors
2. Verify user exists in Authentication
3. Verify user document exists in Firestore
4. Check browser console for errors
5. Ensure Firebase config is correct

---

**🎉 Your ReConnect platform is fully set up and ready to use!**

Start by logging in as super admin and creating your first users! 🚀

