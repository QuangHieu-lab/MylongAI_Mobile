import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { aiService } from '@/src/services/ai'; 
import { toast } from '@/src/lib/toast'; // 👈 Import thư viện Toast siêu mượt của bạn

// ==============================
// TỪ ĐIỂN DỊCH ID SANG CHỮ
// ==============================
const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

export const useYoloVision = () => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'upload'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [scanResult, setScanResult] = useState<any>(null); 

  // ==============================
  // ĐIỀU KHIỂN NÚT BẬT/TẮT CAMERA
  // ==============================
  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    setScanResult(null); 
  };

  // ==============================
  // XỬ LÝ CHỌN ẢNH TỪ THƯ VIỆN
  // ==============================
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // 🚀 Đổi Alert thành Toast Error
        toast.error("Từ chối quyền", "Ứng dụng cần quyền truy cập thư viện ảnh!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setScanResult(null);
      }
    } catch (error) {
      // 🚀 Đổi Alert thành Toast Error
      toast.error("Lỗi thư viện", "Không thể mở thư viện ảnh lúc này.");
    }
  };

  // ==============================
  // [API] HÀM QUÉT ẢNH UPLOAD
  // ==============================
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      setScanResult(null);
      
      const response = await aiService.detectRicePaper(selectedImage);
      processAiResponse(response); 
      
      // 🚀 Thêm thông báo thành công cho mượt
      toast.success("Thành công", "Đã phân tích xong ảnh mẻ bánh!");

    } catch (error: any) {
      console.error("Lỗi API Tải ảnh:", error);
      // 🚀 Đổi Alert thành Toast Error
      toast.error("Mất kết nối", "Không thể gửi ảnh đến Máy chủ AI.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  // ==============================
  // [API] HÀM CHỤP & QUÉT THỦ CÔNG
  // ==============================
  const handleManualCapture = async (base64String: string) => {
    try {
      setIsAnalyzing(true);
      setScanResult(null);  

      const response = await aiService.detectRealtime(base64String);
      processAiResponse(response);

      // 🚀 Thêm thông báo thành công
      toast.success("Hoàn tất", "Đã quét và phân tích xong khung hình!");

    } catch (error) {
      console.error("Lỗi API Camera thủ công:", error);
      // 🚀 Đổi Alert thành Toast Error
      toast.error("Lỗi phân tích", "Không thể phân tích ảnh chụp. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  // ==============================
  // HÀM CHUNG: XỬ LÝ JSON TỪ BACKEND
  // ==============================
  const processAiResponse = (response: any) => {
    if (response && response.objects && response.objects.length > 0) {
      const detectedObj = response.objects[0]; 
      
      const translatedName = CLASS_NAMES[detectedObj.class] || `Nhãn lạ (ID: ${detectedObj.class})`;

      setScanResult({
        status: 'success',
        quality: translatedName, 
        confidence: `${(detectedObj.confidence * 100).toFixed(1)}%`, 
        dryness: 'N/A' 
      });
    } else {
      setScanResult({
        status: 'empty',
        quality: 'Khung hình trống',
        confidence: '0%',
        dryness: 'N/A'
      });
      // 🚀 Báo info cho user biết là AI không thấy gì
      toast.info("Không tìm thấy", "Không phát hiện thấy bánh tráng trong ảnh.");
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
    activeTab, setActiveTab,
    isCameraActive, 
    selectedImage, 
    isAnalyzing, 
    scanResult,
    toggleCamera, 
    handlePickImage, 
    handleAnalyzeImage, 
    handleManualCapture, 
    resetUpload
  };
};