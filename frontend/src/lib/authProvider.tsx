import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, signup as signupApi } from './fetcher';
import { LoginFormInputs } from '@/models/auth';

interface AuthContextType {
  user: string | null; // You can expand this to a user object if needed
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // On mount, load from localStorage
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setUser(res.data.email);
    setToken(res.data.token);
    console.log('login res', res);
    console.log('login res.data', res.data);
    console.log('login res.data.email', res.data.email);
    console.log('login res.data.token', res.data.token);
    localStorage.setItem('auth_user', res.data.email);
    localStorage.setItem('auth_token', res.data.token);
  };

  const signup = async (email: string, password: string) => {
    await signupApi(email, password);
    // Optionally auto-login after signup
    // await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 