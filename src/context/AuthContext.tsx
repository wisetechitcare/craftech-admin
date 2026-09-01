import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface Admin {
  [key: string]: any;
}

interface AuthContextValue {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Admin>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem('craftech_admin_user');
    const token = localStorage.getItem('adminToken');
    return stored && token ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (admin) {
        try {
          await authApi.getMe();
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { admin: adminData, token } = res.data;
    localStorage.setItem('craftech_admin_user', JSON.stringify(adminData));
    localStorage.setItem('adminToken', token);
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('craftech_admin_user');
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
