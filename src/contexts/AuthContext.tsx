// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

import { User, AuthContextType } from '../types/auth';
// Tạm thời comment service thật lại vì chưa có Backend
// import { authService } from '../services/authService'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// 🚀 MOCK DATA: TÀI KHOẢN GIẢ LẬP (VÌ CHƯA CÓ BACKEND)
// ==========================================
const MOCK_ADMIN: User = {
  id: 'admin_999',
  name: 'Đại Ca Quản Đốc',
  email: 'admin@mylongai.com',
  role: 'admin', 
};

const MOCK_USER: User = {
  id: 'user_001',
  name: 'Nhân Viên Phơi Bánh',
  email: 'nhanvien@mylongai.com',
  role: 'user', 
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  // 1. KIỂM TRA ĐĂNG NHẬP KHI MỞ APP
  const checkLoggedInUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Kiểm tra xem token đang lưu là của Sếp hay Nhân viên
        if (token === 'mock_admin_token') {
          setUser(MOCK_ADMIN);
        } else if (token === 'mock_user_token') {
          setUser(MOCK_USER);
        }
        
        // CODE THẬT SAU NÀY BẬT LÊN:
        // const userData = await authService.getMe(token);
        // setUser(userData);
      }
    } catch (e) {
      console.log('Lỗi kiểm tra token:', e);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. XỬ LÝ ĐĂNG NHẬP (KHÔNG CẦN BACKEND)
  const login = async (email: string, pass: string) => {
    try {
      // Giả lập thời gian load mạng (800ms) để UI hiện vòng xoay cho chân thực
      await new Promise(resolve => setTimeout(resolve, 800));

      // TRƯỜNG HỢP 1: NẾU GÕ 'admin' -> VÀO ADMIN
      if (email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@mylongai.com') {
        await SecureStore.setItemAsync('userToken', 'mock_admin_token');
        setUser(MOCK_ADMIN);
        return; 
      }

      // TRƯỜNG HỢP 2: GÕ BẤT KỲ CÁI GÌ KHÁC -> VÀO USER THƯỜNG
      // Tự động lấy cái email bạn vừa gõ để hiển thị lên Profile cho giống thật
      const dynamicUser = { ...MOCK_USER, email: email || 'nhanvien@mylongai.com' };
      await SecureStore.setItemAsync('userToken', 'mock_user_token');
      setUser(dynamicUser);
      
      // CODE THẬT SAU NÀY BẬT LÊN:
      // const { token, user: userData } = await authService.login(email, pass);
      // await SecureStore.setItemAsync('userToken', token);
      // setUser(userData);

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  // 3. XỬ LÝ ĐĂNG KÝ (KHÔNG CẦN BACKEND)
  const register = async (name: string, email: string, pass: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập mạng
      console.log("Mock đăng ký thành công cho:", email);
      
      // CODE THẬT SAU NÀY BẬT LÊN:
      // await authService.register(name, email, pass);
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