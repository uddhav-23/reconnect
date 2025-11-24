# Check Your User Role in Firestore

## Quick Diagnostic Steps

### Step 1: Find Your Firebase User UID

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Type this and press Enter:
```javascript
firebase.auth().currentUser?.uid
```
4. Copy the UID that appears

### Step 2: Check Your User Document in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Data** tab
4. Look for the `users` collection
5. Find the document with your UID (from Step 1)
6. Check if it has a `role` field
7. Verify the `role` field value is exactly `"superadmin"` (with quotes, lowercase)

### Step 3: If User Document Doesn't Exist or Role is Missing

If your user document doesn't exist or doesn't have the `role` field:

1. In Firestore Database → Data tab
2. Click on `users` collection
3. If your document doesn't exist, click "Add document"
4. Use your Firebase Auth UID as the document ID
5. Add these fields:
   - `email`: (your email)
   - `name`: (your name)
   - `role`: `superadmin` (string, exactly as shown)
   - `createdAt`: (current timestamp)
   - `universityId`: `1` (or your university ID)

### Step 4: Verify Rules Are Published

1. Go to Firestore Database → Rules tab
2. Make sure the rules show the helper functions (getUserRole, isSuperAdmin, etc.)
3. Click "Publish" if you see any unsaved changes

### Step 5: Test Again

After updating your user document:
1. Log out of your app
2. Log back in
3. Try creating a college again

