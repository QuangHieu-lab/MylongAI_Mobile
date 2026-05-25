// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

import { User, AuthContextType } from '../types/auth';
// import { authService } from '../services/authService'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// 🚀 MOCK DATABASE TẬP TRUNG TẠI CONTEXT
// ==========================================
// Mảng này đóng vai trò như Database. Chứa cả pass để kiểm tra.
export const MOCK_USERS_DB = [
  { 
    id: 'admin_999', 
    name: 'Đại Ca Quản Đốc', 
    email: 'admin@mylongai.com', 
    password: '123', // Thêm password để test
    role: 'admin' as const 
  },
  { 
    id: 'user_001', 
    name: 'Nhân Viên Phơi Bánh', 
    email: 'nhanvien@mylongai.com', 
    password: '123', // Thêm password để test
    role: 'user' as const 
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  // 1. KIỂM TRA ĐĂNG NHẬP KHI MỞ APP
  const checkLoggedInUser = async () => {
    try {
      // Dùng luôn email làm mock token cho dễ tìm
      const tokenEmail = await SecureStore.getItemAsync('userToken');
      
      if (tokenEmail) {
        // Tìm user trong Mock DB dựa trên token (email)
        const foundUser = MOCK_USERS_DB.find(u => u.email === tokenEmail);
        
        if (foundUser) {
          // Bỏ password ra trước khi set vào state để bảo mật (chuẩn thực tế)
          const { password, ...userData } = foundUser;
          setUser(userData);
        } else {
          // Nếu token là email lạ (bị xóa khỏi DB), xóa token đi
          await SecureStore.deleteItemAsync('userToken');
        }
      }
    } catch (e) {
      console.log('Lỗi kiểm tra token:', e);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. XỬ LÝ ĐĂNG NHẬP (Làm Backend Ảo)
  const login = async (email: string, pass: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập mạng

      // KIỂM TRA ĐĂNG NHẬP TỪ MOCK DB
      const userExists = MOCK_USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!userExists) {
        throw new Error('Tài khoản chưa được đăng ký!');
      }

      if (userExists.password !== pass) {
        throw new Error('Mật khẩu không chính xác!');
      }

      // Đăng nhập thành công -> Lưu email làm Token
      await SecureStore.setItemAsync('userToken', userExists.email);
      
      // Bỏ pass ra khỏi state
      const { password, ...userData } = userExists;
      setUser(userData);

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error; // Ném lỗi ra để useAuthForm bắt và hiện Toast
    }
  };

  // 3. XỬ LÝ ĐĂNG KÝ (Làm Backend Ảo)
  const register = async (name: string, email: string, pass: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 

      // Kiểm tra trùng email
      const isExist = MOCK_USERS_DB.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (isExist) {
        throw new Error('Email này đã được sử dụng!');
      }

      // Lưu user mới vào DB ảo
      MOCK_USERS_DB.push({
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        password: pass,
        role: 'user' // Mặc định đăng ký mới là user thường
      });

      console.log("Mock đăng ký thành công cho:", email);
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  };

  // 4. XỬ LÝ ĐĂNG XUẤT
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