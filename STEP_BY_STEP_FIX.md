# Step-by-Step Fix for "Missing or insufficient permissions"

## 🎯 The Problem
Firestore security rules check your user's role from the `users` collection, but either:
- Your user document doesn't exist
- Your user document exists but `role` field is missing or wrong
- Firestore rules aren't deployed correctly

## 📋 Step-by-Step Solution

### STEP 1: Get Your User UID (2 minutes)

1. **Open your app** and make sure you're logged in
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type this and press Enter:
```javascript
firebase.auth().currentUser?.uid
```
5. **Copy the UID** that appears (it's a long string like `abc123xyz...`)

### STEP 2: Check Your User Document (3 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **reconnect-8dbfa**
3. Click **Firestore Database** in left sidebar
4. Click **Data** tab
5. Look for collection called **`users`**
6. **Find the document with your UID** (from Step 1)

#### Scenario A: Document DOES NOT exist
**Do this:**
1. Click **"Add document"** button
2. Click **"Use a custom ID"**
3. Paste your UID as the Document ID
4. Click **"Create"**
5. Add these fields one by one:
   - Click **"Add field"**
     - Field name: `email` | Type: `string` | Value: `your-email@example.com`
   - Click **"Add field"**
     - Field name: `name` | Type: `string` | Value: `Your Name`
   - Click **"Add field"**
     - Field name: `role` | Type: `string` | Value: `superadmin` ← **MUST BE EXACTLY THIS**
   - Click **"Add field"**
     - Field name: `universityId` | Type: `string` | Value: `1`
   - Click **"Add field"**
     - Field name: `createdAt` | Type: `timestamp` | Value: (click the clock icon)
6. Click **"Save"**

#### Scenario B: Document EXISTS but missing `role` field
**Do this:**
1. Click on your user document
2. Click **"Add field"**
3. Field name: `role`
4. Field type: `string`
5. Field value: `superadmin` (exactly, lowercase, no quotes)
6. Click **"Update"**

#### Scenario C: Document EXISTS but `role` is wrong
**Do this:**
1. Click on your user document
2. Find the `role` field
3. Click on it to edit
4. Change value to exactly: `superadmin` (string, lowercase)
5. Click **"Update"**

### STEP 3: Verify Firestore Rules (2 minutes)

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Check if you see these helper functions at the top:
   ```javascript
   function getUserRole() { ... }
   function isSuperAdmin() { ... }
   ```
3. **If you DON'T see them:**
   - Open `firestore.rules` file in your project
   - Copy ALL the content
   - Paste it into the Rules editor in Firebase Console
   - Click **"Publish"**
   - Wait for "Rules published successfully"

### STEP 4: Test in Browser Console (1 minute)

1. Go back to your app
2. Open Console (F12)
3. Paste this code and press Enter:

```javascript
// Quick test
const user = firebase.auth().currentUser;
if (user) {
  firebase.firestore().collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log('✅ User document found');
        console.log('Role:', data.role);
        if (data.role === 'superadmin') {
          console.log('✅ Role is correct!');
        } else {
          console.error('❌ Role is wrong:', data.role);
        }
      } else {
        console.error('❌ User document missing!');
      }
    });
} else {
  console.error('❌ Not logged in!');
}
```

### STEP 5: Log Out and Log Back In (1 minute)

1. **Log out** of your app completely
2. **Log back in** (this refreshes your auth token)
3. Try creating a college again

## ✅ Verification Checklist

Before trying to create a college, verify:

- [ ] I'm logged in to the app
- [ ] My user document exists in Firestore `users` collection
- [ ] My user document has a `role` field
- [ ] The `role` field value is exactly `"superadmin"` (string, lowercase)
- [ ] Firestore rules are deployed (I can see helper functions in Rules tab)
- [ ] I logged out and back in after making changes

## 🧪 Test College Creation Directly

If you want to test permissions directly, run this in browser console:

```javascript
firebase.firestore().collection('colleges').add({
  name: 'Test College',
  description: 'Test',
  universityId: '1',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})
.then(doc => {
  console.log('✅ SUCCESS! College created:', doc.id);
  doc.delete(); // Clean up
})
.catch(err => {
  console.error('❌ FAILED:', err.code, err.message);
  if (err.code === 'permission-denied') {
    console.error('Check:');
    console.error('1. User document exists');
    console.error('2. Role = "superadmin"');
    console.error('3. Rules deployed');
  }
});
```

## 🆘 Still Not Working?

If you've done all steps and it still doesn't work:

1. **Check browser console** for the exact error message
2. **Take a screenshot** of:
   - Your user document in Firestore
   - The Firestore Rules tab
   - The browser console error
3. **Verify** your Firebase project ID matches: `reconnect-8dbfa`

## 📞 Quick Reference

- **Firebase Console**: https://console.firebase.google.com/
- **Your Project**: reconnect-8dbfa
- **Collection**: `users`
- **Document ID**: Your Firebase Auth UID
- **Required Field**: `role` = `"superadmin"` (string)

