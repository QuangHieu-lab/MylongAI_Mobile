import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { aiService } from '@/src/services/ai'; 

// ==============================
// TỪ ĐIỂN DỊCH ID SANG CHỮ (Quy tắc 3)
// ==============================
const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

export const useYoloVision = () => {
  // 1. STATE ĐIỀU HƯỚNG TAB
  const [activeTab, setActiveTab] = useState<'realtime' | 'upload'>('upload');
  
  // 2. STATE CHO TÍNH NĂNG CAMERA REALTIME
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 

  // 3. STATE CHO TÍNH NĂNG TẢI ẢNH TĨNH
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 4. STATE LƯU KẾT QUẢ CHUNG
  const [scanResult, setScanResult] = useState<any>(null); 

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==============================
  // DỌN DẸP BỘ NHỚ (Chống Crash App)
  // ==============================
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ==============================
  // ĐIỀU KHIỂN NÚT BẬT/TẮT CAMERA
  // ==============================
  const toggleCamera = () => {
    const newState = !isCameraActive;
    setIsCameraActive(newState);
    
    if (newState) {
      // Khi vừa bật, giả lập chờ 1.5s để Camera khởi động xong rồi mới báo "Đang quét"
      timerRef.current = setTimeout(() => setIsScanning(true), 1500);
      setScanResult(null); // Xóa kết quả cũ trên màn hình
    } else {
      // Khi tắt
      setIsScanning(false);
      setScanResult(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  // ==============================
  // XỬ LÝ CHỌN ẢNH TỪ THƯ VIỆN
  // ==============================
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Từ chối quyền", "Ứng dụng cần quyền truy cập ảnh để kiểm định mẻ bánh!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Giữ dung lượng ảnh nhỏ hơn 2MB (Quy tắc 1 của Backend)
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setScanResult(null);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh lúc này.");
    }
  };

  // ==============================
  // [API] HÀM QUÉT ẢNH TĨNH (Upload)
  // ==============================
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      setScanResult(null);
      
      // Bắn file ảnh lên cổng /ai/detect (FormData)
      const response = await aiService.detectRicePaper(selectedImage);
      
      processAiResponse(response); // Đưa cục JSON vào hàm xử lý chung

    } catch (error: any) {
      console.error("Lỗi API Tải ảnh:", error);
      Alert.alert("Mất kết nối", "Không thể gửi ảnh đến Máy chủ AI. Hãy kiểm tra lại IP/WiFi.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  // ==============================
  // [API] HÀM QUÉT TRỰC TIẾP (Realtime)
  // ==============================
  const handleRealtimeScan = async (base64String: string) => {
    try {
      // Bắn chuỗi Base64 lên cổng /ai/detect-realtime (JSON)
      const response = await aiService.detectRealtime(base64String);
      processAiResponse(response); // Đưa cục JSON vào hàm xử lý chung
    } catch (error) {
      console.error("Lỗi API Realtime:", error);
      // Realtime thường chạy ngầm liên tục nên ta KHÔNG dùng Alert.alert để tránh spam màn hình
    }
  };

  // ==============================
  // HÀM CHUNG: XỬ LÝ JSON TỪ BACKEND
  // ==============================
  const processAiResponse = (response: any) => {
    if (response && response.objects && response.objects.length > 0) {
      const detectedObj = response.objects[0]; // Chỉ lấy bánh tráng rõ nét nhất
      
      // Dịch ID số (0, 1) thành Chữ. Nếu gặp số lạ thì in ra kèm ID để dễ sửa lỗi
      const translatedName = CLASS_NAMES[detectedObj.class] || `Nhãn lạ (ID: ${detectedObj.class})`;

      setScanResult({
        status: 'success',
        quality: translatedName, 
        confidence: `${(detectedObj.confidence * 100).toFixed(1)}%`, // Đổi 0.985 thành 98.5%
        dryness: 'N/A' // Tính năng độ ẩm chưa có trên Backend
      });
    } else {
      // Rơi vào đây nếu gửi ảnh lên mà AI nói "Trong ảnh không có cái bánh nào cả"
      setScanResult({
        status: 'empty',
        quality: 'Khung hình trống',
        confidence: '0%',
        dryness: 'N/A'
      });
    }
  };

  // ==============================
  // LÀM MỚI (CHỌN ẢNH KHÁC)
  // ==============================
  const resetUpload = () => {
    setSelectedImage(null);
    setScanResult(null);
  };

  return {
    // Trả ra State
    activeTab, setActiveTab,
    isCameraActive, isScanning, 
    selectedImage, isAnalyzing, scanResult,
    
    // Trả ra Action
    toggleCamera, handlePickImage, handleAnalyzeImage, handleRealtimeScan, resetUpload
  };
};