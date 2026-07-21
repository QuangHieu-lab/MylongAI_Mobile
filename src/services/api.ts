import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 1. LẤY BASE_URL LÀ BACKEND CHÍNH (RENDER)
// Mình dùng EXPO_PUBLIC_MAIN_API_URL theo chuẩn file .env mà chúng ta đã thống nhất
const BASE_URL = process.env.EXPO_PUBLIC_MAIN_API_URL || 'https://mylongaiv2.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Giữ nguyên 15s để tránh timeout khi mạng yếu
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
// --- CAMERA MANAGEMENT ---
export const cameraApi = {
  create: (data: any) => apiClient.post('/camera', data),
  getAll: () => apiClient.get('/camera'),
  getById: (id: string) => apiClient.get(`/camera/${id}`),
  update: (id: string, data: any) => apiClient.put(`/camera/${id}`, data),
  delete: (id: string) => apiClient.delete(`/camera/${id}`),
};

// --- SENSOR & ENVIRONMENT ---
export const sensorApi = {
  getLatest: (cameraId: string) => apiClient.get(`/sensor/latest/${cameraId}`),
  getHistory: (cameraId: string, limit: number = 50) => apiClient.get(`/sensor/history/${cameraId}?limit=${limit}`),
  createEspData: (data: { camera_id: string; temperature: number; humidity: number }) => 
    apiClient.post('/iot/sensor-data', data),
};

// --- DETECTION (YOLO AI) ---
export const detectionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/detection/latest/${cameraId}`),
  create: (data: { camera_id: string; detected_count: number; confidence: number }) => 
    apiClient.post('/iot/detection-result', data),
};

// --- PREDICTION (Dryness AI) ---
export const predictionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/prediction/latest/${cameraId}`),
  create: (data: { camera_id: string; temperature: number; humidity: number; predicted_minutes: number }) => 
    apiClient.post('/iot/dryness-result', data),
};

// --- NOTIFICATION & WEATHER ---
export const notificationApi = {
  getByUserId: (userId: string) => apiClient.get(`/notification/${userId}`),
};

export const weatherApi = {
  analyze: (lat: number = 10.226, lon: number = 106.421, save: boolean = true) => 
    apiClient.get(`/weather/analyze?lat=${lat}&lon=${lon}&save=${save}`),
};

// --- ADMIN DASHBOARD & REVENUE ---
export const adminApi = {
  getOverview: () => apiClient.get('/dashboard/overview'),
  getConfidenceChart: () => apiClient.get('/dashboard/admin/confidence-chart'),
  getDrynessChart: () => apiClient.get('/dashboard/admin/dryness-chart'),
  getSubscriptions: () => apiClient.get('/subscriptions'),
  getRevenueStatistics: () => apiClient.get('/subscriptions/statistics'),
};

// --- USER MANAGEMENT ---
export const userApi = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  disableUser: (id: string) => apiClient.patch(`/users/${id}/disable`),
  enableUser: (id: string) => apiClient.patch(`/users/${id}/enable`),
  updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
};

// --- PAYMENT ---
export const paymentApi = {
  createOrder: () => apiClient.post('/payment/create-order'),
  getStatus: () => apiClient.get('/payment/status'),
  getBuyers: () => apiClient.get('/payment/buyers'),
};

// --- VOICE ALERT ---
export const voiceApi = {
  getAlert: (level: 'low' | 'medium' | 'high') => 
    apiClient.get(`/voice/alert`, { 
      params: { level },
      responseType: 'blob' // Bắt buộc để tải MP3
    }),
};