import { apiClient } from './api';

export const aiService = {
  detectRicePaper: async (imageUri: string) => {
    try {
      // 1. Đóng gói ảnh thành dạng FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      
      formData.append('file', { 
        uri: imageUri, 
        name: filename, 
        type: 'image/jpeg' 
      } as any);

      // 2. Gửi hỏa tốc sang Backend (Thay '/api/ai/detect' bằng đúng link bên file FastAPI của bạn)
      const response = await apiClient.post('/ai/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 3. Trả về kết quả (Ví dụ: { class: 'Bnh_trng_m_en', confidence: 0.98 })
      return response.data; 
      
    } catch (error) {
      console.error('Lỗi khi gửi ảnh cho AI:', error);
      throw error;
    }
    
  },
  detectRealtime: async (base64String: string) => {
    try {
      // Vì ảnh base64 đôi khi có dính cái đầu "data:image/jpeg;base64," 
      // Nên ta cần cắt bỏ phần đó đi, chỉ lấy chuỗi mã hóa phía sau để gửi BE
      const pureBase64 = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

      // Gói vào cục JSON có key là "image" (phải khớp 100% với chữ image bên class FrameRequest của Python)
      const payload = {
        image: pureBase64
      };

      // Gửi lên đường dẫn Realtime
      const response = await apiClient.post('/ai/detect-realtime', payload);

      return response.data; 
    } catch (error) {
      console.error('Lỗi khi quét realtime:', error);
      throw error;
    }
  }
};