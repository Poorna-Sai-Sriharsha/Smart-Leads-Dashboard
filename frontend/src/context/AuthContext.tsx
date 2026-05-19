import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axios';
import { IUser, IAuthState } from '../types';

interface AuthContextType extends IAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<IAuthState>(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;
    let isAuthenticated = false;

    if (token && userStr) {
      try {
        user = JSON.parse(userStr) as IUser;
        isAuthenticated = true;
      } catch {
        localStorage.clear();
      }
    }

    return {
      user,
      token,
      isAuthenticated,
      isLoading: false,
    };
  });

  const login = async (email: string, password: string): Promise<void> => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token } = data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = 'sales'
  ): Promise<void> => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    const { user, token } = data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
