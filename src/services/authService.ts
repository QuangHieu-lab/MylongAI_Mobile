// src/services/auth.service.ts
import axios from 'axios';
import { LoginResponse, User } from '../types/auth';

// Lấy biến môi trường. Expo sẽ tự động nạp biến này.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Xóa đoạn này khi bạn có API thật
    console.log(`Đang gọi API tới: ${API_URL}/auth/login`);
    
    // CODE GỌI API THẬT:
    /*
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
    */

    // GIẢ LẬP KẾT QUẢ ĐỂ TEST (Xóa sau):
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { token: 'fake-jwt-token-123', user: { email, role: 'admin' } };
  },

  register: async (name: string, email: string, password: string): Promise<void> => {
    /*
    await axios.post(`${API_URL}/auth/register`, { name, email, password });
    */
    await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập
  },

  getMe: async (token: string): Promise<User> => {
    /*
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
    */
    
    // Giả lập kết quả
    return { email: 'demo@mylongai.com', role: 'admin' };
  }
};