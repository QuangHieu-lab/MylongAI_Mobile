import { Platform } from 'react-native';
import axios from 'axios';
// (Không import apiClient nữa vì file này chuyên làm việc với Server AI)

// 🚀 ĐỊNH NGHĨA LINK SERVER AI (HUGGING FACE)
// Dùng biến môi trường chuẩn của Expo
const AI_URL = process.env.EXPO_PUBLIC_API_URL || 'https://huntrot-mylongai-backed-modelai.hf.space';

export const aiService = {
  // ==============================
  // 1. KIỂM TRA TRẠNG THÁI SERVER AI
  // Endpoint: GET /health
  // ==============================
  checkHealth: async () => {
    try {
      // Gọi thẳng vào AI_URL
      const response = await axios.get(`${AI_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra Health Check AI:', error);
      throw error;
    }
  },

  // ==============================
  // 2. GỬI ẢNH TỪ THƯ VIỆN LÊN AI
  // Endpoint: POST /ai/detect
  // ==============================
  detectRicePaper: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      
      // Xử lý chuẩn định dạng type cho React Native
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      // Xử lý tiền tố file:// trên iOS để tránh lỗi đường dẫn
      const formattedUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

      formData.append('file', { 
        uri: formattedUri, 
        name: filename, 
        type: type 
      } as any);

      // 🚀 Dùng fetch kết hợp AI_URL
      const response = await fetch(`${AI_URL}/ai/detect`, {
        method: 'POST',
        body: formData,
        // TUYỆT ĐỐI KHÔNG tự set Content-Type ở đây, để fetch tự sinh ra Boundary chuẩn
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ AI: ${response.status}`);
      }

      const data = await response.json();
      return data; 
      
    } catch (error) {
      console.error('Lỗi khi gửi ảnh cho AI (Upload):', error);
      throw error;
    }
  },

  // ==============================
  // 3. QUÉT AI TRỰC TIẾP (CAMERA)
  // Endpoint: POST /ai/detect-realtime
  // ==============================
  detectRealtime: async (base64String: string) => {
    try {
      // Cắt bỏ phần header dư thừa của base64 nếu có
      const pureBase64 = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

      const payload = {
        image: pureBase64
      };

      // 🚀 Dùng axios gọi thẳng vào AI_URL thay vì apiClient
      const response = await axios.post(`${AI_URL}/ai/detect-realtime`, payload);

      return response.data; 
    } catch (error) {
      console.error('Lỗi khi quét AI realtime:', error);
      throw error;
    }
  },

  // ==============================
  // 4. DỰ ĐOÁN THỜI GIAN PHƠI
  // Endpoint: POST /drying/predict
  // ==============================
  predictDryingTime: async (avgTemp: number, avgHumidity: number) => {
    try {
      const payload = {
        avg_temperature: avgTemp,
        avg_humidity: avgHumidity
      };

      // 🚀 Tương tự, gọi lên server AI
      const response = await axios.post(`${AI_URL}/drying/predict`, payload);
      
      // Sẽ trả về { predicted_drying_time: ... }
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi AI dự báo thời gian phơi:', error);
      throw error;
    }
  }
};