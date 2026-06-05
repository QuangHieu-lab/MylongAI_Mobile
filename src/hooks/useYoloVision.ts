import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// 🚀 1. Đổi cách import theo chuẩn API mới
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'; 
import { aiService } from '@/src/services/ai'; 
import { toast } from '@/src/lib/toast'; 

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

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    setScanResult(null); 
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error("Từ chối quyền", "Ứng dụng cần quyền truy cập thư viện ảnh!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, 
      });

      if (!result.canceled) {
        const originalUri = result.assets[0].uri;

        // ==========================================
        // 🚀 2. API MỚI (Object-Oriented) CỦA EXPO
        // ==========================================
        // Bước A: Đưa ảnh vào Context và thay đổi kích thước
        const imageRef = await ImageManipulator.manipulate(originalUri)
          .resize({ width: 640 })
          .renderAsync(); // Render ảnh ra bộ nhớ tạm
          
        // Bước B: Lưu lại ảnh đã thu nhỏ thành dạng JPEG nén 50%
        const manipResult = await imageRef.saveAsync({
          compress: 0.5,
          format: SaveFormat.JPEG,
        });

        // Lúc này cảnh báo gạch ngang @deprecated đã hoàn toàn biến mất!
        setSelectedImage(manipResult.uri);
        setScanResult(null);
      }
    } catch (error) {
      console.error("Lỗi khi chọn/ép ảnh:", error);
      toast.error("Lỗi thư viện", "Không thể mở thư viện ảnh lúc này.");
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      setScanResult(null);
      
      const response = await aiService.detectRicePaper(selectedImage);
      processAiResponse(response); 
      
      toast.success("Thành công", "Đã phân tích xong ảnh mẻ bánh!");
    } catch (error: any) {
      console.error("Lỗi API Tải ảnh:", error);
      toast.error("Mất kết nối", "Không thể gửi ảnh đến Máy chủ AI.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  const handleManualCapture = async (base64String: string) => {
    if (isAnalyzing) return; 

    try {
      setIsAnalyzing(true);
      setScanResult(null);  

      const response = await aiService.detectRealtime(base64String);
      processAiResponse(response);

      toast.success("Hoàn tất", "Đã quét và phân tích xong khung hình!");
    } catch (error) {
      console.error("Lỗi API Camera thủ công:", error);
      toast.error("Lỗi phân tích", "Không thể phân tích ảnh chụp. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

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
      toast.info("Không tìm thấy", "Không phát hiện thấy bánh tráng trong khung hình.");
    }
  };

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