# 🔧 Fix "User Account Exists But Profile Is Missing"

This error means:
- ✅ Your account exists in **Firebase Authentication**
- ❌ Your profile is **missing** in **Firestore Database**

---

## ✅ Quick Fix (Recommended)

Run this command:

```bash
npm run create-profile
```

Or directly:
```bash
node scripts/createMissingProfile.js
```

**Follow the prompts:**
1. Enter your email: `uddhavjoshi24@gmail.com`
2. Enter your password: (the password you use to login)
3. Enter role: `superadmin` (or press Enter for default)
4. Enter name: `Super Admin` (or press Enter for default)
5. Enter university ID: `1` (or press Enter for default)

The script will:
- Sign in to verify your account
- Get your User UID
- Create the missing Firestore profile
- Set your role to superadmin

---

## ✅ Manual Fix (Firebase Console)

### Step 1: Get Your User UID

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Find your email: `uddhavjoshi24@gmail.com`
3. Click on the user
4. **Copy the User UID** (it's at the top, looks like: `abc123xyz...`)

### Step 2: Create Firestore Profile

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection (or create it if it doesn't exist)
3. Click **"Add document"**
4. **Paste the User UID** as the document ID (important!)
5. Click **"Create"**
6. Add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `uddhavjoshi24@gmail.com` |
| `name` | string | `Super Admin` |
| `role` | string | `superadmin` ← **Must be exactly this** |
| `universityId` | string | `1` |
| `createdAt` | timestamp | Click timestamp icon, select current time |

7. Click **"Save"**

### Step 3: Test Login

1. Go to: http://localhost:5175/login
2. Enter your email and password
3. You should now be able to login! 🎉

---

## 🔍 Why This Happens

This usually happens when:
- User was created in Firebase Auth but Firestore document wasn't created
- User document was accidentally deleted
- User was created manually in Firebase Console without creating Firestore document

---

## ✅ Verification Checklist

After fixing, verify:
- [ ] User exists in Firebase Authentication
- [ ] User document exists in Firestore `users` collection
- [ ] Document ID matches User UID exactly
- [ ] `role` field is exactly `"superadmin"` (case-sensitive, no spaces)
- [ ] `email` field matches your login email
- [ ] All required fields are present

---

## 🚨 Still Not Working?

1. **Clear browser cache** and try again
2. **Check browser console** (F12) for detailed errors
3. **Verify Firestore rules** allow reading user data
4. **Try incognito mode** to rule out cache issues

---

**The easiest way is to run the script: `npm run create-profile`** 🚀

