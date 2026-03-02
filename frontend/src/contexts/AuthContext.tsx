import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setUnauthorizedCallback } from '@/config/api';

type User = {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: 'USER' | 'COMPANY_HR' | 'EVENT_HOST' | 'ADMIN' | 'SUPER_ADMIN';
  profilePicture?: string;
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  signOut: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('dc_user');
      const parsed = raw ? JSON.parse(raw) : null;
      console.log('🔧 AuthProvider initialized:', parsed ? `User: ${parsed.username}, Token: ${parsed.token ? 'YES' : 'NO'}` : 'No user');
      return parsed;
    } catch {
      console.error('❌ Failed to parse dc_user from localStorage');
      return null;
    }
  });

  const setUserAndPersist = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('dc_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('dc_user');
    }
  };

  const signOut = (reason?: string) => {
    console.log('🚪 Signing out user...', reason ? `Reason: ${reason}` : '');
    setUserAndPersist(null);
    localStorage.removeItem('dc_user');
    
    // Store logout reason in sessionStorage to show after redirect
    if (reason) {
      sessionStorage.setItem('logout_reason', reason);
    }
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const isAuthenticated = !!user && !!user.token;

  // Set up the unauthorized callback when the component mounts
  useEffect(() => {
    console.log('🔧 Setting up auto-logout callback');
    setUnauthorizedCallback(() => {
      console.log('🔒 Token expired - auto logout triggered');
      console.log('⏸️  Auto-logout DISABLED for debugging');
      
      // TEMPORARILY DISABLED - uncomment to re-enable
      // setTimeout(() => {
      //   signOut('Your session has expired. Please login again.');
      // }, 500);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndPersist, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
