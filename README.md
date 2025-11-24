# 🎓 ReConnect - Alumni Network Platform

A complete, fully-fledged alumni networking platform built with React, TypeScript, and Firebase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Super Admin

**Option A: Using Script (Recommended)**
```bash
npm run setup-superadmin
```

**Option B: Manual Setup**
1. Go to Firebase Console → Authentication → Users
2. Add user: `uddhavjoshi24@gmail.com` with password `Reconnect2024!`
3. Copy User UID
4. Go to Firestore → `users` collection
5. Create document with User UID as ID
6. Add fields: `email`, `name: "Super Admin"`, `role: "superadmin"`, `universityId: "1"`

### 3. Start Development Server
```bash
npm run dev
```

### 4. Login
- URL: http://localhost:5175/login
- Email: `uddhavjoshi24@gmail.com`
- Password: `Reconnect2024!` (change after first login)

---

## ✨ Features

### 🔐 Authentication
- User Signup with role selection
- Secure Login/Logout
- Password management
- Profile updates

### 👑 Super Admin
- Create Super Admins, Sub-Admins, Alumni, Students
- Create and manage Colleges
- Assign demo login credentials to users
- View all system data
- Full system control

### 🏫 Sub-Admin (College Admin)
- Create Alumni with demo credentials
- Edit/Delete Alumni profiles
- Manage College blogs
- View college statistics

### 🎓 Alumni
- View and edit profile
- Create blogs
- View connections
- Showcase achievements

### 👥 Users
- Browse alumni directory
- Read blogs
- Connect with alumni

---

## 📋 Creating Users

### As Super Admin:

1. **Create Super Admin**
   - Click "CREATE SUPER ADMIN" button
   - Fill in name, email, demo password
   - Credentials are displayed after creation

2. **Create Alumni**
   - Click "CREATE ALUMNI" button
   - Fill in all details including demo password
   - Credentials are displayed after creation

3. **Create Sub-Admin**
   - Click "ADD COLLEGE" button
   - Fill college and sub-admin details
   - Demo password is assigned
   - Credentials are shown after creation

### Demo Credentials System

When you create any user, you assign:
- **Email**: User's email address
- **Demo Password**: Password for login

After creation, credentials are displayed in a modal with:
- Copy to clipboard button
- Clear display for sharing
- Instructions for user

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Routing**: React Router
- **Build Tool**: Vite

---

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/          # All form components
│   ├── layout/         # Header, Layout
│   └── common/         # Reusable components
├── pages/
│   ├── dashboards/     # Role-specific dashboards
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── ...
├── services/
│   ├── firebaseAuth.ts      # Authentication
│   ├── firebaseFirestore.ts # Database operations
│   └── crudExamples.ts      # CRUD examples
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
└── config/
    └── firebase.ts     # Firebase configuration
```

---

## 🔥 Firebase Setup

1. **Enable Authentication**
   - Firebase Console → Authentication
   - Enable Email/Password

2. **Set Up Firestore**
   - Create database in test mode
   - Deploy security rules: `firebase deploy --only firestore:rules`

3. **Configure App**
   - Update `src/config/firebase.ts` with your credentials
   - Or use the existing config (already set up)

---

## 📚 Documentation

- `SETUP_COMPLETE.md` - Complete setup guide
- `FIREBASE_SETUP.md` - Firebase configuration
- `CREATE_SUPER_ADMIN.md` - Super admin creation
- `CRUD_OPERATIONS.md` - All CRUD operations

---

## 🎯 Key Features

✅ Complete CRUD operations for all entities  
✅ Role-based access control  
✅ Demo credentials assignment  
✅ Real-time Firebase integration  
✅ Beautiful, modern UI  
✅ Responsive design  
✅ Secure authentication  

---

## 🚨 Important Notes

1. **Default Super Admin Password**: Change `Reconnect2024!` after first login
2. **Demo Credentials**: Always share credentials shown after user creation
3. **Firebase Rules**: Security rules are configured for authenticated users
4. **Email Domains**: Sub-admin emails must match college domain

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check Firestore security rules
4. Review documentation files

---

**🎉 Your ReConnect platform is ready!**

Start by logging in as super admin and creating your first users! 🚀

