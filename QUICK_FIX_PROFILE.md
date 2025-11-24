# ⚡ Quick Fix: Missing Profile

Your account exists in Firebase Auth but profile is missing in Firestore.

## 🚀 Fastest Fix (2 minutes)

### Step 1: Get Your User UID

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Find: `uddhavjoshi24@gmail.com`
3. Click on it
4. **Copy the User UID** (it's shown at the top)

### Step 2: Create Profile in Firestore

1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection
3. Click **"Add document"**
4. **Paste the User UID** as the document ID
5. Add these fields (click "Add field" for each):

```
Field: email
Type: string
Value: uddhavjoshi24@gmail.com

Field: name
Type: string
Value: Super Admin

Field: role
Type: string
Value: superadmin

Field: universityId
Type: string
Value: 1

Field: createdAt
Type: timestamp
Value: [click timestamp icon, select current time]
```

6. Click **"Save"**

### Step 3: Login!

Go to http://localhost:5175/login and login with:
- Email: `uddhavjoshi24@gmail.com`
- Password: (your password)

**Done!** 🎉

---

## 🔧 Alternative: Use Script

Run this and follow prompts:
```bash
npm run create-profile
```

Enter:
- Email: `uddhavjoshi24@gmail.com`
- Password: (your password)
- Role: `superadmin` (or press Enter)
- Name: `Super Admin` (or press Enter)
- University ID: `1` (or press Enter)

