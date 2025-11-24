# Fix "Missing or insufficient permissions" Error

## The Problem

The error occurs because Firestore security rules check your user's role from the `users` collection, but either:
1. Your user document doesn't exist in Firestore
2. Your user document exists but doesn't have the `role` field
3. Your `role` field is not set to `"superadmin"`

## Solution Steps

### Step 1: Get Your Firebase User UID

Open your browser console (F12) and run:
```javascript
// If you're using the app, check the console for user info
// Or check localStorage/sessionStorage
```

Or check in Firebase Console:
1. Go to Firebase Console → Authentication → Users
2. Find your user email
3. Copy the UID shown

### Step 2: Check/Create Your User Document

1. Go to Firebase Console → Firestore Database → Data
2. Look for `users` collection
3. Check if a document with your UID exists

**If document doesn't exist:**
1. Click "Add document" in the `users` collection
2. Use your Firebase Auth UID as the document ID
3. Add these fields:
   ```
   email: "your-email@example.com" (string)
   name: "Your Name" (string)
   role: "superadmin" (string) ← THIS IS CRITICAL
   createdAt: (timestamp - use the timestamp button)
   universityId: "1" (string)
   ```

**If document exists but missing `role` field:**
1. Click on your user document
2. Click "Add field"
3. Field name: `role`
4. Field type: `string`
5. Field value: `superadmin`
6. Click "Update"

### Step 3: Verify the Role Field

Make sure:
- Field name is exactly: `role` (lowercase)
- Field type is: `string` (not number, not boolean)
- Field value is exactly: `superadmin` (lowercase, no spaces)

### Step 4: Re-deploy Firestore Rules

1. Go to Firestore Database → Rules tab
2. Copy the entire content from `firestore.rules` file
3. Paste it into the rules editor
4. Click "Publish"
5. Wait for "Rules published successfully" message

### Step 5: Log Out and Log Back In

1. Log out of your application
2. Log back in (this refreshes the authentication token)
3. Try creating a college again

## Alternative: Temporary Development Rules (NOT FOR PRODUCTION)

If you need to test quickly, you can temporarily use these rules (ONLY FOR DEVELOPMENT):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING**: These rules allow any authenticated user to read/write everything. Only use for development/testing!

## Still Having Issues?

1. Check browser console for any error messages
2. Verify you're logged in (check if `user` object exists in your app)
3. Check Firebase Console → Firestore Database → Usage tab for any errors
4. Make sure your Firebase project is correctly configured in `src/config/firebase.ts`

