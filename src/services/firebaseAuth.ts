import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { auth, db, credentialProvisionerAuth } from '../config/firebase';
import { emailMatchesInstitutionalDomain } from '../config/env';
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
    
    let cleanedUser = removeUndefined(newUser);
    if (cleanedUser.role === 'alumni' && emailMatchesInstitutionalDomain(cleanedUser.email)) {
      cleanedUser = { ...cleanedUser, verifiedAlumni: true };
    }

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
 * Create a user from super/sub-admin dashboards without switching the current login session.
 * Uses a secondary Firebase Auth app, then signs that session out so the admin stays signed in.
 */
export const createUserAsAdmin = async (
  email: string,
  password: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      credentialProvisionerAuth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name || '',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      ...userData,
    };

    let cleanedUser = removeUndefined(newUser);
    if (cleanedUser.role === 'alumni' && emailMatchesInstitutionalDomain(cleanedUser.email)) {
      cleanedUser = { ...cleanedUser, verifiedAlumni: true };
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), cleanedUser);

    if (userData.name) {
      await updateProfile(firebaseUser, { displayName: userData.name });
    }

    await signOut(credentialProvisionerAuth);
    return cleanedUser as User;
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

/**
 * Re-authenticate and delete the Firebase Auth account and user profile document.
 * Related subcollections may remain until cleaned by a Cloud Function (recommended for production).
 */
export const deleteUserAccount = async (password: string): Promise<void> => {
  const u = auth.currentUser;
  if (!u?.email) throw new Error('Not authenticated');
  const uid = u.uid;
  await signInWithEmailAndPassword(auth, u.email, password);
  await deleteDoc(doc(db, 'users', uid)).catch(() => {});
  await deleteUser(auth.currentUser!);
};

/**
 * Download a JSON snapshot of the user profile and authored content.
 */
export const exportUserDataAsJson = async (userId: string): Promise<void> => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const blogsSnap = await getDocs(
    query(collection(db, 'blogs'), where('authorId', '==', userId))
  );
  const achievementsSnap = await getDocs(
    query(collection(db, 'achievements'), where('userId', '==', userId))
  );
  const payload = {
    user: userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null,
    blogs: blogsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    achievements: achievementsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reconnect-export-${userId}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

