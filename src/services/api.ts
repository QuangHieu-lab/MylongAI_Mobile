import axios from 'axios';

// Đổi IP này thành IP máy tính của bạn
// Bắt buộc phải có http:// và cổng :8000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // AI xử lý ảnh có thể hơi lâu, nên để thời gian chờ khoảng 15s
});