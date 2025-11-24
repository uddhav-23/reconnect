# 🔧 Fix Super Admin Login Issue

If you're getting "Invalid credentials" error when trying to login as super admin, follow these steps:

## 🔍 Common Causes

1. **User exists in Firestore but NOT in Firebase Authentication**
2. **Password mismatch** - Password in Firebase Auth doesn't match what you're entering
3. **User document missing** - User exists in Auth but not in Firestore
4. **Email mismatch** - Email in Auth doesn't match Firestore

---

## ✅ Solution 1: Use the Fix Script (Recommended)

Run the diagnostic and fix script:

```bash
node scripts/fixSuperAdminLogin.js
```

This script will:
- Check if user exists in Firebase Authentication
- Check if user document exists in Firestore
- Create missing accounts
- Set correct role to superadmin
- Fix any mismatches

**Follow the prompts:**
1. Enter your email: `uddhavjoshi24@gmail.com`
2. Enter your password (the one you want to use)
3. Script will fix everything automatically

---

## ✅ Solution 2: Manual Fix via Firebase Console

### Step 1: Check Firebase Authentication

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Look for your email: `uddhavjoshi24@gmail.com`
3. **If user exists:**
   - Click on the user
   - Click "Reset password" if needed
   - Note the User UID

4. **If user does NOT exist:**
   - Click "Add user"
   - Email: `uddhavjoshi24@gmail.com`
   - Password: (choose a password)
   - Click "Add user"
   - Copy the User UID

### Step 2: Check Firestore

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection
3. **If document exists with your User UID:**
   - Click on the document
   - Verify these fields:
     - `email`: `uddhavjoshi24@gmail.com`
     - `role`: `superadmin` (must be exactly this)
     - `name`: Your name
     - `universityId`: `1`
   - If `role` is not `superadmin`, edit it

4. **If document does NOT exist:**
   - Click "Add document"
   - Use the User UID from Step 1 as the document ID
   - Add these fields:
     ```
     email: "uddhavjoshi24@gmail.com"
     name: "Super Admin"
     role: "superadmin"
     universityId: "1"
     createdAt: [current timestamp]
     ```
   - Click "Save"

### Step 3: Test Login

1. Go to: http://localhost:5175/login
2. Enter:
   - Email: `uddhavjoshi24@gmail.com`
   - Password: (the password from Firebase Auth)
3. Click "LOGIN"

---

## ✅ Solution 3: Reset Password

If you know the email but forgot/changed the password:

1. Go to Firebase Console → Authentication → Users
2. Find your email
3. Click on the user
4. Click "Reset password"
5. Enter new password
6. Try logging in with new password

---

## ✅ Solution 4: Create Fresh Super Admin

If nothing works, create a fresh account:

1. **In Firebase Console → Authentication:**
   - Delete existing user (if exists)
   - Add new user with email and password

2. **In Firebase Console → Firestore:**
   - Delete existing user document (if exists)
   - Create new document with User UID

3. **Or use the setup script:**
   ```bash
   npm run setup-superadmin
   ```

---

## 🐛 Debugging Steps

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages
5. Common errors:
   - `auth/user-not-found` → User doesn't exist in Auth
   - `auth/wrong-password` → Password is incorrect
   - `auth/invalid-credential` → Email/password combination is wrong
   - `User data not found` → User exists in Auth but not in Firestore

### Verify Firebase Config

Check `src/config/firebase.ts` has correct credentials:
- apiKey
- authDomain
- projectId
- etc.

### Check Firestore Rules

Make sure Firestore rules allow reading user data:
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
}
```

---

## 📋 Quick Checklist

- [ ] User exists in Firebase Authentication
- [ ] Password is correct (try resetting if unsure)
- [ ] User document exists in Firestore `users` collection
- [ ] Document ID matches User UID from Authentication
- [ ] `role` field is exactly `"superadmin"` (case-sensitive)
- [ ] `email` field matches the email you're using to login
- [ ] Firebase config is correct
- [ ] Email/Password auth is enabled in Firebase Console

---

## 🚨 Still Not Working?

1. **Clear browser cache and cookies**
2. **Try incognito/private window**
3. **Check network tab** in DevTools for API errors
4. **Verify Firebase project** is correct
5. **Check Firebase Console** for any error logs

---

## 💡 Pro Tip

The easiest way is to use the fix script:
```bash
node scripts/fixSuperAdminLogin.js
```

It will diagnose and fix all issues automatically! 🚀

