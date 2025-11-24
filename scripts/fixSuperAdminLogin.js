/**
 * Script to fix super admin login issues
 * This will check and fix common login problems
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import readline from 'readline';

const firebaseConfig = {
  apiKey: "AIzaSyDXSfRWqFWEzOuWEGi6huJrDprYA6WisEk",
  authDomain: "reconnect-8dbfa.firebaseapp.com",
  projectId: "reconnect-8dbfa",
  storageBucket: "reconnect-8dbfa.firebasestorage.app",
  messagingSenderId: "1000288279740",
  appId: "1:1000288279740:web:868891ef9b5868cd0a44b9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixSuperAdmin() {
  try {
    console.log('\n🔍 Super Admin Login Fix Tool\n');
    
    const email = await question('Enter your super admin email: ');
    const password = await question('Enter the password you want to use: ');
    
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }
    
    console.log('\n⏳ Checking Firebase Authentication...');
    
    // Try to sign in first
    let user;
    let needsAuthCreation = false;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('✅ User exists in Firebase Authentication');
      console.log(`   User UID: ${user.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('⚠️  User NOT found in Firebase Authentication');
        console.log('   Creating new authentication user...');
        needsAuthCreation = true;
      } else if (authError.code === 'auth/wrong-password') {
        console.log('⚠️  Password is incorrect');
        console.log('   Options:');
        console.log('   1. Reset password via email');
        console.log('   2. Create new account with this password');
        
        const choice = await question('\n   Enter choice (1 or 2): ');
        
        if (choice === '1') {
          console.log('\n📧 Sending password reset email...');
          await sendPasswordResetEmail(auth, email);
          console.log('✅ Password reset email sent! Check your inbox.');
          console.log('   After resetting, run this script again to fix Firestore.');
          rl.close();
          process.exit(0);
        } else {
          // Need to get the user first, then we'll update password
          console.log('   Please reset password in Firebase Console first, then run this script again.');
          rl.close();
          process.exit(0);
        }
      } else {
        throw authError;
      }
    }
    
    if (needsAuthCreation) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log('✅ Created new authentication user');
        console.log(`   User UID: ${user.uid}`);
      } catch (createError) {
        console.error('❌ Error creating user:', createError.message);
        if (createError.code === 'auth/email-already-in-use') {
          console.log('\n💡 The email exists but password is wrong.');
          console.log('   Please reset password in Firebase Console:');
          console.log('   https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users');
          console.log('   Then run this script again.');
        }
        rl.close();
        process.exit(1);
      }
    }
    
    console.log('\n⏳ Checking Firestore...');
    
    // Check Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document exists in Firestore');
      console.log(`   Current role: ${userData.role || 'not set'}`);
      
      // Update to super admin
      await updateDoc(userDocRef, {
        email: email,
        name: userData.name || 'Super Admin',
        role: 'superadmin',
        universityId: userData.universityId || '1',
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Updated user to superadmin role');
    } else {
      console.log('⚠️  User document NOT found in Firestore');
      console.log('   Creating user document...');
      
      await setDoc(userDocRef, {
        id: user.uid,
        email: email,
        name: 'Super Admin',
        role: 'superadmin',
        universityId: '1',
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Created user document in Firestore');
    }
    
    console.log('\n🎉 Super Admin Setup Complete!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User UID: ${user.uid}\n`);
    console.log('✅ You can now login at: http://localhost:5175/login\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure Firebase is properly configured');
    console.error('   2. Check that Email/Password auth is enabled in Firebase Console');
    console.error('   3. Verify your email and password are correct');
    rl.close();
    process.exit(1);
  }
}

fixSuperAdmin();

