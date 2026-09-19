import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { User, UserRole } from '../types.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  unreadNotifications: number;
  login: (identifier: string, password: string, role?: UserRole) => Promise<User>;
  googleLogin: (email: string, name?: string, avatar?: string, roleHint?: UserRole) => Promise<User>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
        setUnreadNotifications(res.data.unreadNotifications || 0);
      }
    } catch (err) {
      console.warn('Invalid stored session, resetting auth', err);
      localStorage.removeItem('cc_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (identifier: string, password: string, role?: UserRole): Promise<User> => {
    const res = await api.post('/auth/login', { identifier, password, role });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('cc_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const googleLogin = async (email: string, name?: string, avatar?: string, roleHint?: UserRole): Promise<User> => {
    const res = await api.post('/auth/google', { email, name, avatar, roleHint });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('cc_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Google Login failed');
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    let id = '';
    if (role === 'student') id = 'student@campusconnect.edu';
    else if (role === 'faculty') id = 'faculty@campusconnect.edu';
    else id = 'admin@campusconnect.edu';

    try {
      await login(id, 'Password@123', role);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  };

  const refreshUserData = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        unreadNotifications,
        login,
        googleLogin,
        switchDemoRole,
        logout,
        updateUser,
        refreshUserData,
        setUnreadNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
