// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🚀 Dùng AsyncStorage cho đồng bộ với api.ts

import { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService'; // 🚀 Gắn Service thật vào

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  // ==========================================
  // 1. KIỂM TRA ĐĂNG NHẬP KHI MỞ APP (LẤY TỪ SERVER)
  // ==========================================
  const checkLoggedInUser = async () => {
    try {
      // Đọc token từ bộ nhớ (Trùng key với axios interceptor trong api.ts)
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        // Gọi API getMe để lấy thông tin mới nhất từ Backend
        const userData = await authService.getMe(token);
        setUser(userData);
      }
    } catch (e) {
      console.log('Lỗi kiểm tra token (Có thể token hết hạn hoặc lỗi mạng):', e);
      // Xóa token đi nếu không hợp lệ để văng ra màn hình đăng nhập
      await AsyncStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 HÀM REFETCH (Cập nhật lại quyền sau khi mua Premium)
  // ==========================================
  const refetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const userData = await authService.getMe(token);
        setUser(userData);
      }
    } catch (error) {
      console.error("Lỗi khi tải lại thông tin User:", error);
    }
  };

  // ==========================================
  // 2. XỬ LÝ ĐĂNG NHẬP (GỌI API THẬT)
  // ==========================================
  const login = async (email: string, pass: string) => {
    try {
      const response = await authService.login(email, pass);
      
      // Lưu access_token thật vào AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);
      
      // Tạo object user từ thông tin trả về cơ bản để load UI nhanh
      const loggedInUser: User = {
        id: response.user_id,
        name: response.name,
        email: email, // Giữ lại email người dùng nhập
        role: response.role,
      };
      
      setUser(loggedInUser);
      
      // 🚀 Sau khi login, chạy refetchUser để lấy Data đầy đủ (có premium_expired_at...)
      await refetchUser(); 
    } catch (error) {
      console.error('Lỗi đăng nhập (Context):', error);
      throw error; // Ném lỗi để useAuthForm bắt và hiện Toast
    }
  };

  // ==========================================
  // 3. XỬ LÝ ĐĂNG KÝ (GỌI API THẬT)
  // ==========================================
  const register = async (name: string, email: string, pass: string) => {
    try {
      await authService.register(name, email, pass);
      console.log("Đăng ký thành công cho:", email);
    } catch (error) {
      console.error('Lỗi đăng ký (Context):', error);
      throw error;
    }
  };

  // ==========================================
  // 4. XỬ LÝ ĐĂNG XUẤT
  // ==========================================
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token'); 
      setUser(null);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    // 🚀 Bổ sung refetchUser vào Provider
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetchUser }}>
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