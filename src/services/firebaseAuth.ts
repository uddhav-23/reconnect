import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

// Helper to remove undefined fields (Firestore doesn't allow undefined)
const removeUndefined = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

/**
 * Login with email and password
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.data() as User;
    return { ...userData, id: firebaseUser.uid };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Create a new user account
 */
export const createUser = async (
  email: string,
  password: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name || '',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      ...userData,
    };
    
    // Remove undefined fields before saving to Firestore
    const cleanedUser = removeUndefined(newUser);
    
    await setDoc(doc(db, 'users', firebaseUser.uid), cleanedUser);
    
    // Update Firebase Auth profile
    if (userData.name) {
      await updateProfile(firebaseUser, { displayName: userData.name });
    }
    
    return newUser;
  } catch (error: any) {
    throw new Error(error.message || 'User creation failed');
  }
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Update user password
 */
export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Re-authenticate with current password
    await signInWithEmailAndPassword(auth, user.email!, currentPassword);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message || 'Password change failed');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Password reset failed');
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    // Also update Firebase Auth profile if name changed
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.name });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Profile update failed');
  }
};

/**
 * Get current user from Firestore
 */
export const getCurrentUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    return { ...userDoc.data(), id: userDoc.id } as User;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user data');
  }
};

