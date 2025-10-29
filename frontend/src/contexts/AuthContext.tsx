import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id?: string;
  email?: string;
  username?: string; // frontend-only username
  token?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('dc_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
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

  const signOut = () => setUserAndPersist(null);

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndPersist, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
