# ⚠️ IMPORTANT: Deploy Firestore Rules Now!

The Firestore security rules have been updated to allow public access to the users collection (for the Alumni Directory). **You must deploy these rules to Firebase for the Alumni Directory to work.**

## Quick Deploy Steps:

### Option 1: Firebase Console (Easiest - Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **reconnect-8dbfa**
3. Click **Firestore Database** in the left sidebar
4. Click the **"Rules"** tab
5. **Copy the entire contents** of the `firestore.rules` file
6. **Paste** it into the rules editor in Firebase Console
7. Click **"Publish"** button
8. Wait for confirmation that rules are published

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Make sure you're in the project directory
cd /Users/uddhavjoshi/Downloads/reconnect

# Login to Firebase (if not already)
firebase login

# Deploy the rules
firebase deploy --only firestore:rules
```

## What Changed?

The rules now allow:
- ✅ **Public read access** to the `users` collection (needed for Alumni Directory)
- ✅ Users can still only write their own profile
- ✅ All other security rules remain the same

## After Deploying:

1. Refresh your app
2. Go to the Alumni Directory page
3. You should now see data from Firebase instead of mock data!

## Verify It Worked:

After deploying, check the browser console. You should see:
- No permission errors
- Data loading from Firebase
- The blue "sample data" banner should disappear
