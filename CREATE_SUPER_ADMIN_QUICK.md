# Quick Guide: Create Super Admin

## 🚀 Fastest Method (Using Firebase Console)

### Step 1: Create Auth User
1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users
2. Click **"Add user"**
3. Enter:
   - Email: `superadmin@university.edu`
   - Password: (choose a strong password)
4. Click **"Add user"**
5. **Copy the User UID** (you'll see it after creation)

### Step 2: Create Firestore Document
1. Go to: https://console.firebase.google.com/project/reconnect-8dbfa/firestore/data
2. Click on `users` collection (or create it if it doesn't exist)
3. Click **"Add document"**
4. **Paste the User UID** as the document ID
5. Add these fields:

```
email: "superadmin@university.edu"
name: "Super Admin"
role: "superadmin"
createdAt: [click timestamp icon, select current time]
universityId: "1"
```

6. Click **"Save"**

### Step 3: Login!
- Go to: http://localhost:5175/login
- Use the email and password you created
- You'll be redirected to Super Admin Dashboard! 🎉

---

## Alternative: Use Signup + Update Role

1. Go to `/signup` in your app
2. Sign up with any email/password
3. Go to Firebase Console > Firestore > `users` collection
4. Find your user document
5. Change `role` to `"superadmin"`
6. Add `universityId: "1"`
7. Logout and login again

---

**That's it!** You now have super admin access! 🚀

