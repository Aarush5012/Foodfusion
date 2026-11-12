import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { RoleName, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: RoleName | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, role: RoleName) => Promise<string>;
  logout: () => Promise<void>;
  switchRole: (role: RoleName) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => api.auth.getCurrentUser());

  useEffect(() => {
    const current = api.auth.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string, phone: string, role: RoleName) => {
    const res = await api.auth.register(name, email, pass, phone, role);
    if (res.user.status === 'ACTIVE') {
      setUser(res.user);
    }
    return res.message;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const switchRole = async (targetRole: RoleName) => {
    const switchedUser = await api.auth.switchDemoRole(targetRole);
    setUser(switchedUser);
  };

  const refreshUser = () => {
    setUser(api.auth.getCurrentUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
