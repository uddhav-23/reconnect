/**
 * Script to set uddhavjoshi24@gmail.com as super admin
 * 
 * Usage: node scripts/setSuperAdmin.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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

async function setSuperAdmin() {
  const email = 'uddhavjoshi24@gmail.com';
  const password = 'Reconnect2024!'; // Default password - user should change this
  
  try {
    console.log('\n🚀 Setting up Super Admin: uddhavjoshi24@gmail.com\n');
    
    // Try to create user or sign in if exists
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('✅ Created new authentication user');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  User already exists, signing in...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log('✅ Signed in to existing user');
      } else {
        throw error;
      }
    }
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing user to super admin
      await updateDoc(userDocRef, {
        role: 'superadmin',
        email: email,
        name: 'Super Admin',
        universityId: '1',
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Updated existing user to super admin');
    } else {
      // Create new user document
      await setDoc(userDocRef, {
        id: user.uid,
        email: email,
        name: 'Super Admin',
        role: 'superadmin',
        universityId: '1',
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Created new super admin user document');
    }
    
    console.log('\n🎉 Super Admin Setup Complete!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User UID: ${user.uid}\n`);
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('✅ You can now login at: http://localhost:5175/login\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 If user exists but password is different, reset it in Firebase Console');
    process.exit(1);
  }
}

setSuperAdmin();

