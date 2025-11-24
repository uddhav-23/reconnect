/**
 * Script to create missing Firestore profile for existing Firebase Auth user
 * 
 * This fixes: "User account exists but profile is missing"
 * 
 * Usage: node scripts/createMissingProfile.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
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

async function createMissingProfile() {
  try {
    console.log('\n🔧 Create Missing Profile Tool\n');
    console.log('This will create a Firestore profile for your existing Firebase Auth account.\n');
    
    const email = await question('Enter your email: ');
    const password = await question('Enter your password: ');
    const role = await question('Enter your role (superadmin/subadmin/alumni/student/user) [superadmin]: ') || 'superadmin';
    const name = await question('Enter your name [Super Admin]: ') || 'Super Admin';
    const universityId = await question('Enter university ID [1]: ') || '1';
    
    console.log('\n⏳ Signing in to Firebase Authentication...');
    
    // Sign in to get the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Successfully signed in!');
    console.log(`   User UID: ${user.uid}\n`);
    
    console.log('⏳ Checking Firestore profile...');
    
    // Check if profile exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('⚠️  Profile already exists in Firestore!');
      const existingData = userDoc.data();
      console.log(`   Current role: ${existingData.role || 'not set'}`);
      console.log(`   Current name: ${existingData.name || 'not set'}`);
      
      const update = await question('\n   Do you want to update it? (y/n) [y]: ') || 'y';
      if (update.toLowerCase() === 'y') {
        await setDoc(userDocRef, {
          ...existingData,
          email: email,
          name: name,
          role: role,
          universityId: universityId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log('✅ Profile updated!');
      } else {
        console.log('ℹ️  Profile not updated.');
      }
    } else {
      console.log('⚠️  Profile NOT found in Firestore');
      console.log('   Creating profile...');
      
      await setDoc(userDocRef, {
        id: user.uid,
        email: email,
        name: name,
        role: role,
        universityId: universityId,
        createdAt: new Date().toISOString(),
      });
      
      console.log('✅ Profile created successfully!');
    }
    
    console.log('\n🎉 Profile Setup Complete!\n');
    console.log('📋 Your Profile:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    console.log(`   User UID: ${user.uid}`);
    console.log(`   University ID: ${universityId}\n`);
    console.log('✅ You can now login at: http://localhost:5175/login\n');
    console.log('   Use the same email and password you just entered.\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('\n💡 User not found in Firebase Authentication.');
      console.error('   First create the user in Firebase Console:');
      console.error('   https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users');
    } else if (error.code === 'auth/wrong-password') {
      console.error('\n💡 Incorrect password.');
      console.error('   Please enter the correct password or reset it in Firebase Console.');
    } else if (error.code === 'auth/invalid-credential') {
      console.error('\n💡 Invalid credentials.');
      console.error('   Please check your email and password.');
    }
    
    rl.close();
    process.exit(1);
  }
}

createMissingProfile();

