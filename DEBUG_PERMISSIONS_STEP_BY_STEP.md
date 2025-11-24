# Step-by-Step Guide to Fix "Missing or insufficient permissions" Error

## Step 1: Verify You're Logged In

1. Open your browser's Developer Console (Press F12)
2. Go to the **Console** tab
3. Type this command and press Enter:
```javascript
console.log('Current user:', JSON.stringify(firebase.auth().currentUser, null, 2))
```
4. Check if it shows your user object. If it's `null`, you're not logged in - log in first.

## Step 2: Get Your Firebase User UID

In the same console, type:
```javascript
firebase.auth().currentUser?.uid
```
**Copy this UID** - you'll need it in the next steps.

## Step 3: Check Your User Document in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Data** tab
5. Look for a collection called `users`
6. Find the document with your UID (from Step 2)

### If the document doesn't exist:
1. Click **"Add document"** in the `users` collection
2. Use your UID as the **Document ID** (click "Use a custom ID" and paste your UID)
3. Add these fields:
   - Click **"Add field"**
   - Field name: `email` | Type: `string` | Value: `your-email@example.com`
   - Click **"Add field"**
   - Field name: `name` | Type: `string` | Value: `Your Name`
   - Click **"Add field"**
   - Field name: `role` | Type: `string` | Value: `superadmin` ← **CRITICAL: Must be exactly "superadmin"**
   - Click **"Add field"**
   - Field name: `universityId` | Type: `string` | Value: `1`
   - Click **"Add field"**
   - Field name: `createdAt` | Type: `timestamp` | Value: (click the timestamp icon)
4. Click **"Save"**

### If the document exists:
1. Click on your user document
2. Check if it has a `role` field
3. If `role` is missing or not `"superadmin"`:
   - Click **"Add field"** (or edit existing)
   - Field name: `role`
   - Field type: `string`
   - Field value: `superadmin` (exactly, lowercase, no quotes in the value field)
   - Click **"Update"**

## Step 4: Verify Firestore Rules Are Deployed

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Check if the rules show helper functions like `getUserRole()`, `isSuperAdmin()`, etc.
3. If not, copy the entire content from `firestore.rules` file in your project
4. Paste it into the rules editor
5. Click **"Publish"**
6. Wait for "Rules published successfully" message

## Step 5: Test Authentication in Browser Console

In your browser console (F12), run this to test if your user document is accessible:

```javascript
// First, make sure you're logged in
const user = firebase.auth().currentUser;
if (!user) {
  console.error('Not logged in!');
} else {
  console.log('User UID:', user.uid);
  
  // Try to read your user document
  firebase.firestore().collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log('User document:', data);
        console.log('Role:', data.role);
        if (data.role !== 'superadmin') {
          console.error('❌ Role is not superadmin! Current role:', data.role);
        } else {
          console.log('✅ Role is correct: superadmin');
        }
      } else {
        console.error('❌ User document does not exist!');
      }
    })
    .catch(err => {
      console.error('Error reading user document:', err);
    });
}
```

## Step 6: Log Out and Log Back In

1. Log out of your application
2. Log back in (this refreshes the authentication token)
3. Try creating a college again

## Step 7: Check Browser Console for Detailed Errors

1. Open Developer Console (F12)
2. Go to **Console** tab
3. Try creating a college
4. Look for any error messages
5. Check for messages like:
   - "Loading data for user: ..."
   - "Creating college with user: ..."
   - Any permission errors

## Common Issues and Solutions

### Issue 1: User document doesn't exist
**Solution**: Create it following Step 3 above

### Issue 2: Role field is missing or wrong
**Solution**: Add/update the `role` field to exactly `"superadmin"` (string type, lowercase)

### Issue 3: Rules not deployed
**Solution**: Re-deploy rules following Step 4 above

### Issue 4: User not authenticated
**Solution**: Log out and log back in

### Issue 5: Rules syntax error
**Solution**: Make sure the rules file has no syntax errors. The rules should include the helper functions.

## Quick Test: Try Creating a College with Console

If you want to test if permissions work, try this in the browser console:

```javascript
// This will show you exactly what error Firestore returns
firebase.firestore().collection('colleges').add({
  name: 'Test College',
  description: 'Test',
  universityId: '1',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})
.then(doc => {
  console.log('✅ Success! College created with ID:', doc.id);
  // Delete the test college
  doc.delete();
})
.catch(err => {
  console.error('❌ Error:', err.code, err.message);
  if (err.code === 'permission-denied') {
    console.error('Permission denied! Check:');
    console.error('1. Your user document exists in Firestore');
    console.error('2. Your role field is set to "superadmin"');
    console.error('3. Firestore rules are deployed');
  }
});
```

