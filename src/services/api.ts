import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 1. LẤY BASE_URL LÀ BACKEND CHÍNH (RENDER)
// Mình dùng EXPO_PUBLIC_MAIN_API_URL theo chuẩn file .env mà chúng ta đã thống nhất
const BASE_URL = process.env.EXPO_PUBLIC_MAIN_API_URL || 'https://mylongaiv2.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Giữ nguyên 15s để tránh timeout khi mạng yếu
});

// 🚀 2. THÊM INTERCEPTOR: TỰ ĐỘNG ĐÍNH KÈM TOKEN
// Đoạn này giúp tự động lấy token từ bộ nhớ điện thoại và gắn vào Header cho các API có 🔒
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Mobile sử dụng AsyncStorage thay vì localStorage như trên Web
      const token = await AsyncStorage.getItem('access_token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi khi lấy token từ AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tùy chọn: Interceptor xử lý lỗi chung (Ví dụ hết hạn Token thì báo lỗi)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Token đã hết hạn hoặc không hợp lệ!");
      // Sau này bạn có thể dispatch một event để đẩy user về trang Login ở đây
    }
    return Promise.reject(error);
  }
);