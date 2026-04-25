import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthContextType } from '../types';
import {
  loginUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword,
  getCurrentUserData,
  createUser,
  deleteUserAccount,
  exportUserDataAsJson,
} from '../services/firebaseAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/** Firestore profile may omit `email`; Auth is the source of truth for sign-in address. */
function sessionUserFromFirestore(firebaseUser: FirebaseAuthUser, userData: User): User {
  const authEmail = firebaseUser.email?.trim() ?? '';
  const docEmail = typeof userData.email === 'string' ? userData.email.trim() : '';
  return {
    ...userData,
    id: firebaseUser.uid,
    email: authEmail || docEmail,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await getCurrentUserData(firebaseUser.uid);
          if (userData) {
            setUser(sessionUserFromFirestore(firebaseUser, userData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const newUser = await createUser(email, password, {
        ...userData,
        role: userData.role || 'user',
      });
      setUser(newUser);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, userData);
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (error: any) {
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return;

    try {
      await changeUserPassword(oldPassword, newPassword);
    } catch (error: any) {
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    await deleteUserAccount(password);
    setUser(null);
  };

  const exportUserData = async () => {
    if (!user) return;
    await exportUserDataAsJson(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        updateProfile,
        changePassword,
        deleteAccount,
        exportUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};