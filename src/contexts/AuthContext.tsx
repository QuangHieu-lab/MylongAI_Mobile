// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Import các module ta vừa tách ra
import { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Dùng service để gọi API
        const userData = await authService.getMe(token);
        setUser(userData);
      }
    } catch (e) {
      console.log('Lỗi kiểm tra token:', e);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      // Gọi qua Service Layer thay vì hardcode axios ở đây
      const { token, user: userData } = await authService.login(email, pass);
      
      await SecureStore.setItemAsync('userToken', token);
      setUser(userData);
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      await authService.register(name, email, pass);
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};