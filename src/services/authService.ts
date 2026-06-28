// src/services/auth.service.ts
import axios from 'axios';
import { LoginResponse, User } from '../types/auth';

// 🚀 LẤY ĐÚNG LINK BACKEND CHÍNH (RENDER) TỪ FILE .ENV
// Lưu ý: Nếu Expo chưa nhận file .env, nó sẽ tự lấy link Render làm mặc định để không bị sập app.
const MAIN_API_URL = process.env.EXPO_PUBLIC_MAIN_API_URL || 'https://mylongaiv2.onrender.com';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log(`Đang gọi API Login tới: ${MAIN_API_URL}/auth/login`);
      
      const response = await axios.post(`${MAIN_API_URL}/auth/login`, { 
        email, 
        password 
      });
      
      return response.data;
    } catch (error: any) {
      console.error(" Lỗi Login:", error.response?.data || error.message);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string): Promise<void> => {
    try {
      console.log(`Đang gọi API Register tới: ${MAIN_API_URL}/auth/register`);
      
      await axios.post(`${MAIN_API_URL}/auth/register`, { 
        name, 
        email, 
        password 
      });
    } catch (error: any) {
      console.error(" Lỗi Register:", error.response?.data || error.message);
      throw error;
    }
  },

  getMe: async (token: string): Promise<User> => {
    try {
      const response = await axios.get(`${MAIN_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      console.error(" Lỗi lấy Profile:", error.response?.data || error.message);
      throw error;
    }
  }
};