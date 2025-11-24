/**
 * Helper script to create a super admin user in Firebase
 * 
 * Usage:
 * 1. Make sure Firebase is installed: npm install
 * 2. Run: npm run create-superadmin
 * 
 * This will prompt you for:
 * - Email
 * - Password
 * - Name
 * - University ID
 */

import readline from 'readline';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Import your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDXSfRWqFWEzOuWEGi6huJrDprYA6WisEk",
  authDomain: "reconnect-8dbfa.firebaseapp.com",
  projectId: "reconnect-8dbfa",
  storageBucket: "reconnect-8dbfa.firebasestorage.app",
  messagingSenderId: "1000288279740",
  appId: "1:1000288279740:web:868891ef9b5868cd0a44b9"
};

// Initialize Firebase
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

async function createSuperAdmin() {
  try {
    console.log('\n🚀 Creating Super Admin User...\n');
    
    // Get user input
    const email = await question('Enter email for super admin: ');
    const password = await question('Enter password (min 6 characters): ');
    const name = await question('Enter name for super admin: ') || 'Super Admin';
    const universityId = await question('Enter university ID (default: 1): ') || '1';
    
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }
    
    console.log('\n⏳ Creating authentication user...');
    
    // Create authentication user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication user created!');
    console.log(`   User UID: ${user.uid}\n`);
    
    console.log('⏳ Creating Firestore document...');
    
    // Create user document in Firestore
    const userData = {
      id: user.uid,
      email: email,
      name: name,
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      universityId: universityId,
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log('✅ Firestore document created!');
    console.log('\n🎉 Super Admin created successfully!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: superadmin`);
    console.log(`   User UID: ${user.uid}`);
    console.log(`   University ID: ${universityId}\n`);
    console.log('✅ You can now login at: http://localhost:5175/login\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('\n💡 This email is already registered.');
      console.error('   Option 1: Use a different email');
      console.error('   Option 2: Go to Firebase Console and update the user role manually');
    }
    
    rl.close();
    process.exit(1);
  }
}

// Check if running in interactive mode
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.length === 0) {
  createSuperAdmin();
} else {
  console.log('Usage: node scripts/createSuperAdmin.js [--interactive]');
  process.exit(1);
}

