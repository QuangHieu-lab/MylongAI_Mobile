import { Platform } from 'react-native';
import axios from 'axios';

// 🚀 ĐỊNH NGHĨA LINK SERVER AI (HUGGING FACE)
const AI_URL = process.env.EXPO_PUBLIC_API_URL || 'https://huntrot-mylongai-backed-modelai.hf.space';

// 🚀 Cấu hình Timeout mặc định (15 giây) để tránh App bị treo khi mất mạng hoặc HF Space đang "ngủ"
const axiosInstance = axios.create({
  baseURL: AI_URL,
  timeout: 15000, 
});

export const aiService = {
  // ==============================
  // 1. KIỂM TRA TRẠNG THÁI SERVER AI
  // ==============================
  checkHealth: async () => {
    try {
      const response = await axiosInstance.get('/health');
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra Health Check AI:', error.message);
      return { status: 'offline' }; // Trả về offline thay vì throw lỗi làm sập app
    }
  },

  // ==============================
  // 2. GỬI ẢNH TỪ THƯ VIỆN LÊN AI
  // ==============================
  detectRicePaper: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      const formattedUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

      formData.append('file', { 
        uri: formattedUri, 
        name: filename, 
        type: type 
      } as any);

      // Dùng AbortController để tạo timeout cho fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s cho upload ảnh

      const response = await fetch(`${AI_URL}/ai/detect`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ AI: ${response.status}`);
      }

      return await response.json(); 
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Lỗi: Upload ảnh quá hạn thời gian (Timeout)');
      } else {
        console.error('Lỗi khi gửi ảnh cho AI (Upload):', error.message);
      }
      throw error;
    }
  },

  // ==============================
  // 3. QUÉT AI TRỰC TIẾP (CAMERA)
  // ==============================
  detectRealtime: async (base64String: string) => {
    try {
      const pureBase64 = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      const payload = { image: pureBase64 };

      const response = await axiosInstance.post('/ai/detect-realtime', payload);
      return response.data; 
    } catch (error: any) {
      console.error('Lỗi khi quét AI realtime:', error.message);
      throw error;
    }
  },

  // ==============================
  // 4. DỰ ĐOÁN THỜI GIAN PHƠI
  // ==============================
  predictDryingTime: async (avgTemp: number, avgHumidity: number) => {
    try {
      const payload = {
        avg_temperature: avgTemp,
        avg_humidity: avgHumidity
      };

      const response = await axiosInstance.post('/drying/predict', payload, {
        timeout: 10000 // Riêng cái này cần nhanh, cho 10s timeout
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi gọi AI dự báo thời gian phơi:', error.message);
      // 🔥 Fallback về null thay vì ném lỗi để Component cha có thể tự kích hoạt công thức Offline dự phòng
      return null; 
    }
  }
};