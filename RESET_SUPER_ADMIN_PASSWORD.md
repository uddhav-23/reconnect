# 🔐 Reset Super Admin Password

You have **3 options** to regain access to your super admin account:

---

## ✅ Option 1: Reset Password in Firebase Console (EASIEST - Recommended)

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Find your super admin email in the users list
3. Click on the email/user to open details

### Step 2: Reset Password
1. Click the **"Reset password"** button (or three dots menu → Reset password)
2. Enter a **new password** (minimum 6 characters)
3. Click **"Reset password"** or **"Save"**

### Step 3: Login
1. Go to your app: http://localhost:5175/login
2. Enter:
   - **Email**: Your super admin email
   - **Password**: The new password you just set
3. Click **"LOGIN"**

**✅ Done!** You should now be logged in as super admin.

---

## ✅ Option 2: Create a New Super Admin Account

If you don't remember which email you used, create a new one:

### Step 1: Create Authentication User
1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Click **"Add user"**
3. Enter:
   - **Email**: `superadmin@reconnect.com` (or any email you prefer)
   - **Password**: Choose a strong password
4. Click **"Add user"**
5. **Copy the User UID** that appears

### Step 2: Create Firestore Document
1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection
3. Click **"Add document"**
4. **Paste the User UID** as the document ID
5. Add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `superadmin@reconnect.com` |
| `name` | string | `Super Admin` |
| `role` | string | `superadmin` |
| `createdAt` | timestamp | Click timestamp icon → current time |
| `universityId` | string | `1` |

6. Click **"Save"**

### Step 3: Login
1. Go to: http://localhost:5175/login
2. Use the email and password you just created
3. You'll be redirected to Super Admin Dashboard!

---

## ✅ Option 3: Use the Reset Script (If you know the email)

If you know your super admin email but forgot the password:

### Step 1: Run the Script
```bash
cd /Users/uddhavjoshi/Downloads/reconnect
node scripts/fixSuperAdminLogin.js
```

### Step 2: Follow Prompts
1. Enter your email: `uddhavjoshi24@gmail.com` (or your super admin email)
2. Enter a new password (minimum 6 characters)
3. The script will:
   - Reset the password in Firebase Auth
   - Update/create the Firestore document
   - Set role to `superadmin`

### Step 3: Login
1. Go to: http://localhost:5175/login
2. Use your email and the new password

---

## 🔍 Find Your Super Admin Email

If you don't remember which email you used:

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection
3. Look for documents where `role` = `superadmin`
4. Note the `email` field - that's your super admin email

---

## ⚠️ Important Notes

- **Password Requirements**: Minimum 6 characters
- **After Reset**: Make sure to note down your new password
- **Security**: Consider using a password manager
- **Multiple Super Admins**: You can have multiple super admin accounts

---

## 🆘 Still Having Issues?

If none of the above work:

1. **Check Browser Console** (F12) for error messages
2. **Verify Firebase Config** in `src/config/firebase.ts`
3. **Check Firestore Rules** - make sure they allow reading users
4. **Clear Browser Cache** and try again

---

## 📝 Quick Checklist

- [ ] Found your super admin email in Firebase Console
- [ ] Reset password in Firebase Authentication
- [ ] Verified user document exists in Firestore with `role: "superadmin"`
- [ ] Tried logging in with new password
- [ ] Successfully accessed Super Admin Dashboard

---

**Need more help?** Check the error message in the browser console and share it for further assistance.
