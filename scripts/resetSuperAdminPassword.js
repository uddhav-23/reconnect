/**
 * Script to reset super admin password
 * This will help you reset your password if you forgot it
 */

import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  try {
    console.log('\n🔐 Super Admin Password Reset Tool\n');
    console.log('This will send a password reset email to your account.\n');
    
    const email = await question('Enter your super admin email: ');
    
    if (!email || !email.includes('@')) {
      console.error('❌ Please enter a valid email address');
      rl.close();
      process.exit(1);
    }
    
    console.log(`\n⏳ Sending password reset email to ${email}...\n`);
    
    await sendPasswordResetEmail(auth, email);
    
    console.log('✅ Password reset email sent successfully!\n');
    console.log('📧 Check your email inbox for the password reset link.');
    console.log('   (Also check spam/junk folder if you don\'t see it)\n');
    console.log('📋 Next steps:');
    console.log('   1. Open the email from Firebase');
    console.log('   2. Click the password reset link');
    console.log('   3. Enter your new password');
    console.log('   4. Login to the app with your new password\n');
    console.log('✅ After resetting, you can login at: http://localhost:5175/login\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 The email address is not registered in Firebase Authentication.');
      console.log('   You may need to create a new super admin account instead.');
      console.log('   See RESET_SUPER_ADMIN_PASSWORD.md for instructions.\n');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Please enter a valid email address.\n');
    } else {
      console.log('\n💡 Alternative: Reset password directly in Firebase Console:');
      console.log('   https://console.firebase.google.com/project/reconnect-8dbfa/authentication/users\n');
    }
    
    rl.close();
    process.exit(1);
  }
}

resetPassword();
