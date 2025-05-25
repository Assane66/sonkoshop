
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence // or browserSessionPersistence
} from 'firebase/auth';
// import { useRouter } from 'next/navigation'; // Not used here directly

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter(); 

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("AuthContext: User is signed in:", currentUser.uid);
      } else {
        console.log("AuthContext: User is signed out.");
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChanged listener.");
      unsubscribe(); 
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log("AuthContext: Attempting login for email:", email);
    setLoading(true); // Set loading true before login attempt
    try {
      await setPersistence(auth, browserLocalPersistence); 
      await signInWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: signInWithEmailAndPassword successful.");
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error("AuthContext: Login failed.", error);
      setLoading(false); // Ensure loading is set to false on error
      throw error; // Re-throw error to be caught by calling component
    }
    // setLoading(false) will be handled by onAuthStateChanged
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout.");
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      console.log("AuthContext: Logout successful.");
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error("AuthContext: Logout failed.", error);
      setLoading(false);
      throw error;
    }
    // setLoading(false) will be handled by onAuthStateChanged
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
