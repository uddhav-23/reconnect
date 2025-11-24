# Deploy Firestore Security Rules

## Important: You need to deploy the updated Firestore rules to Firebase

The Firestore security rules have been updated to check user roles from Firestore instead of auth tokens. You need to deploy these rules to your Firebase project.

## Option 1: Deploy via Firebase Console (Recommended for Quick Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** in the left sidebar
4. Click on the **"Rules"** tab
5. Copy the contents of `firestore.rules` file
6. Paste it into the rules editor
7. Click **"Publish"** button

## Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What Changed?

The rules now check the user's role from the Firestore `users` collection instead of from Firebase Auth custom claims. This means:

- Super admins can create, update, and delete colleges
- Sub-admins can create and update colleges (but not delete)
- The role is read from `/users/{userId}` document in Firestore

## Verify Your User Has the Correct Role

Make sure your super admin user document in Firestore has:
- Collection: `users`
- Document ID: Your Firebase Auth UID
- Field: `role` = `"superadmin"`

If the role is missing or incorrect, update it in Firestore Database.

