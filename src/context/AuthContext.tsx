
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log("AuthContext: Auth state changed, user:", currentUser ? currentUser.uid : 'null');
    });

    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    console.log("AuthContext: Attempting login for email:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      console.log("AuthContext: Login successful for user:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      setUser(null);
      throw error; // Re-throw for the login page to handle
    } finally {
      // setLoading(false); // onAuthStateChanged will handle this
    }
  };

  const logout = async () => {
    setLoading(true);
    console.log("AuthContext: Attempting logout.");
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login'); // Redirect to login after logout
      console.log("AuthContext: Logout successful.");
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      // setLoading(false); // onAuthStateChanged might not fire if error during signout, ensure loading stops
    }
    // setLoading(false) will be handled by onAuthStateChanged if successful, or here if error
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
