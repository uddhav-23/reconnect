# Firebase Setup Guide

This guide will help you set up Firebase for the Reconnect application. Once configured, all data will be stored in Firebase Firestore and authentication will be handled by Firebase Auth.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. The project dependencies installed (`npm install`)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Reconnect App")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Reconnect Web")
3. **Do NOT** check "Also set up Firebase Hosting" (unless you want to use it)
4. Click **"Register app"**
5. You'll see your Firebase configuration object. **Copy these values** - you'll need them in the next step.

## Step 3: Configure Firebase in Your Project

1. Open `src/config/firebase.ts` in your project
2. Replace the placeholder values with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // Replace with your apiKey
  authDomain: "YOUR_AUTH_DOMAIN",            // Replace with your authDomain
  projectId: "YOUR_PROJECT_ID",              // Replace with your projectId
  storageBucket: "YOUR_STORAGE_BUCKET",       // Replace with your storageBucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messagingSenderId
  appId: "YOUR_APP_ID"                       // Replace with your appId
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** in the left sidebar
2. Click **"Get started"** if you haven't enabled it yet
3. Go to the **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click **"Save"**

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - **Note:** For production, you'll need to set up proper security rules
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

## Step 6: Set Up Firestore Security Rules (Important!)

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the default rules with these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Colleges collection
    match /colleges/{collegeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'superadmin' || 
         request.auth.token.role == 'subadmin');
    }
    
    // Blogs collection
    match /blogs/{blogId} {
      allow read: if request.auth != null || request.auth == null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.authorId == request.auth.uid || 
         request.auth.token.role == 'subadmin' || 
         request.auth.token.role == 'superadmin');
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      allow read: if request.auth != null || request.auth == null;
      allow create, update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'subadmin' || 
         request.auth.token.role == 'superadmin');
    }
    
    // Connections collection
    match /connections/{connectionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        (resource.data.requesterId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
    }
  }
}
```

3. Click **"Publish"**

**⚠️ Important:** These rules allow authenticated users to read/write. For production, you should implement more restrictive rules based on your security requirements.

## Step 7: Create Indexes (If Needed)

Firestore may require composite indexes for some queries. If you see errors about missing indexes:

1. Click the error link in the browser console
2. It will take you to Firebase Console with the index creation form
3. Click **"Create index"**
4. Wait for the index to build (usually takes a few minutes)

## Step 8: Create Your First Super Admin User

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **"Add user"**
3. Enter an email and password for your super admin
4. Click **"Add user"**
5. Note the User UID that's generated

6. Go to **Firestore Database** > **Data**
7. Create a new collection called `users`
8. Create a document with the User UID as the document ID
9. Add these fields:
   - `email`: (the email you used)
   - `name`: "Your Name"
   - `role`: "superadmin"
   - `createdAt`: (current timestamp)
   - `universityId`: "1" (or your university ID)

## Step 9: Install Dependencies

If you haven't already, install the Firebase package:

```bash
npm install
```

## Step 10: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with your super admin credentials
3. Check the browser console for any errors
4. If everything works, you should be able to:
   - Log in successfully
   - See the super admin dashboard
   - Add colleges
   - Create sub-admins

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've correctly copied all Firebase config values in `src/config/firebase.ts`

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure the user is authenticated
- Verify the user's role in the Firestore `users` collection

### "Index not found" errors
- Create the required indexes as described in Step 7

### Data not loading
- Check the browser console for specific error messages
- Verify your Firestore security rules allow read access
- Make sure collections exist in Firestore

## Production Considerations

Before deploying to production:

1. **Update Security Rules**: Implement more restrictive Firestore rules
2. **Enable App Check**: Add app verification
3. **Set up Custom Domains**: For authentication emails
4. **Configure CORS**: If needed for your domain
5. **Set up Monitoring**: Enable Firebase Performance Monitoring
6. **Backup Strategy**: Set up regular Firestore backups

## Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Review the browser console for detailed error messages
3. Verify all configuration values are correct
4. Ensure all Firebase services are enabled

---

**That's it!** Your Firebase backend is now set up and ready to use. Just add your credentials and start building! 🚀

