import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { aiService } from '@/src/services/ai'; // 🚀 Nhớ check đúng tên file aiService
import { toast } from '@/src/lib/toast'; 

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

        const imageRef = await ImageManipulator.manipulate(originalUri)
          .resize({ width: 640 })
          .renderAsync(); 
          
        const manipResult = await imageRef.saveAsync({
          compress: 0.5,
          format: SaveFormat.JPEG,
        });

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
      await processAiResponse(response, selectedImage); 
      
      toast.success("Thành công", "Đã phân tích và lưu vào Lịch sử!");
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
      await processAiResponse(response, base64String); 

      toast.success("Hoàn tất", "Đã quét, phân tích và lưu kết quả!");
    } catch (error) {
      console.error("Lỗi API Camera thủ công:", error);
      toast.error("Lỗi phân tích", "Không thể phân tích ảnh chụp. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  const processAiResponse = async (response: any, sourceImage: string | null) => {
    if (response && response.objects && response.objects.length > 0) {
      const rawObjects = response.objects;
      
      // 🚀 Lọc bỏ nhiễu (< 40%) và tính Trung bình Độ tin cậy (GIỐNG BẢN WEB)
      const validObjects = rawObjects.filter((d: any) => d.confidence >= 0.4);
      const totalCount = validObjects.length;

      let confidenceScore = 0;
      if (totalCount > 0) {
        const totalConf = validObjects.reduce((sum: number, d: any) => sum + d.confidence, 0);
        confidenceScore = Math.round((totalConf / totalCount) * 100);
      } else {
        // Nếu các vật thể đều < 40% (bị lọc hết)
        setScanResult({
          status: 'empty',
          quality: 'Khung hình trống hoặc nhiễu',
          confidence: '0%',
          dryness: 'N/A'
        });
        toast.info("Cảnh báo", "AI phát hiện vật thể nhưng độ tin cậy quá thấp.");
        return;
      }

      // Cập nhật UI quét
      setScanResult({
        status: 'success', 
        quality: `Đã phát hiện ${totalCount} bánh`, 
        confidence: `${confidenceScore}%`, 
        dryness: 'N/A' 
      });

      try {
        const oldHistoryStr = await AsyncStorage.getItem('@scan_history');
        const oldHistory = oldHistoryStr ? JSON.parse(oldHistoryStr) : [];

        let finalImageUrl = sourceImage; 

        if (response.image) {
          if (response.image.startsWith('data:image')) {
            finalImageUrl = response.image;
          } else {
            finalImageUrl = `data:image/jpeg;base64,${response.image}`;
          }
        }

        // Tạo bản ghi lược giản
        const newRecord = {
          id: `history-${Date.now()}`,
          timestamp: new Date().toISOString(),
          location: activeTab === 'upload' ? 'Ảnh tải lên' : 'Quét Camera trực tiếp',
          notes: `Ghi nhận thành công ${totalCount} bánh tráng trong khung hình.`,
          ai_data: {
            is_detected: true,
            total_objects: totalCount,
            confidence: confidenceScore,
            image_url: finalImageUrl 
          }
        };

        await AsyncStorage.setItem('@scan_history', JSON.stringify([newRecord, ...oldHistory]));
      } catch (storageError) {
        console.error("Lỗi khi lưu lịch sử vào AsyncStorage:", storageError);
      }

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