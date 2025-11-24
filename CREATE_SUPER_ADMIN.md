# How to Create a Super Admin User

There are two ways to create a super admin user in Firebase:

## Method 1: Using Firebase Console (Recommended for First Time)

### Step 1: Create Authentication User

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **reconnect-8dbfa**
3. Navigate to **Authentication** > **Users** in the left sidebar
4. Click **"Add user"** button
5. Enter:
   - **Email**: `superadmin@university.edu` (or your preferred email)
   - **Password**: Choose a strong password
6. Click **"Add user"**
7. **IMPORTANT**: Copy the **User UID** that appears (you'll need this)

### Step 2: Create User Document in Firestore

1. Go to **Firestore Database** > **Data** in Firebase Console
2. Make sure you have a collection called `users` (if not, create it)
3. Click **"Add document"** or click on the `users` collection
4. In the document ID field, paste the **User UID** you copied in Step 1
5. Click **"Create"**
6. Add the following fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `superadmin@university.edu` (same email from Step 1) |
| `name` | string | `Super Admin` (or your name) |
| `role` | string | `superadmin` |
| `createdAt` | timestamp | Click the timestamp icon and select current time |
| `universityId` | string | `1` (or your university ID) |

7. Click **"Save"**

### Step 3: Test Login

1. Go to your app: `http://localhost:5175/login`
2. Login with:
   - Email: `superadmin@university.edu`
   - Password: (the password you set)
3. You should be redirected to the Super Admin Dashboard!

---

## Method 2: Using the Helper Script (Faster)

I've created a helper script that automates this process. See `scripts/createSuperAdmin.js`

---

## Method 3: Using Signup Page (Then Update Role)

1. Go to `/signup` in your app
2. Sign up with your email and password
3. Choose any role (it doesn't matter)
4. After signup, go to Firebase Console > Firestore Database
5. Find your user document in the `users` collection
6. Edit the document and change the `role` field to `superadmin`
7. Add `universityId` field with value `1` (if not present)
8. Save the document
9. Logout and login again - you'll now have super admin access!

---

## Quick Reference

**Super Admin Features:**
- Access to Super Admin Dashboard (`/dashboard/superadmin`)
- Can create colleges
- Can assign sub-admins to colleges
- Can view all alumni across all colleges
- Full system management capabilities

**Required Fields in Firestore:**
- `email`: string
- `name`: string
- `role`: "superadmin" (must be exactly this)
- `createdAt`: timestamp
- `universityId`: string (optional but recommended)

---

## Troubleshooting

**Can't login after creating super admin?**
- Make sure the User UID in Firestore matches the Authentication UID exactly
- Check that `role` is exactly `"superadmin"` (case-sensitive)
- Verify the email matches in both Authentication and Firestore

**Don't see Super Admin Dashboard?**
- Check browser console for errors
- Verify Firestore security rules allow reading user data
- Make sure you're logged in with the correct account

**Need to create multiple super admins?**
- Repeat Method 1 for each super admin
- Each needs a unique email and User UID

---

**That's it!** You now have a super admin account ready to manage your Reconnect platform! 🚀

