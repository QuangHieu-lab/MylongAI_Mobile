import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as FileSystem from 'expo-file-system/legacy';
import { Room, RoomEvent } from 'livekit-client'; // 🚀 IMPORT THƯ VIỆN LIVEKIT VỪA CÀI

import { aiService } from '@/src/services/ai'; 
import { toast } from '@/src/lib/toast'; 
import { apiClient } from '@/src/services/api'; 

// Từ điển ánh xạ nhãn hệ thống mylongAI
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
  
  // LẤY SẴN ID CAMERA TRONG DATABASE
  const [selectedDbCamera, setSelectedDbCamera] = useState<string>('');

  // 🚀 STATE QUẢN LÝ LIVEKIT
  const [room, setRoom] = useState<Room | null>(null);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);

  useEffect(() => {
    const getDatabaseCameras = async () => {
      try {
        const res: any = await apiClient.get('/camera');
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          setSelectedDbCamera(data[0].id);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách Camera:", err);
      }
    };
    getDatabaseCameras();

    // Dọn dẹp kết nối LiveKit khi component bị unmount
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  // 🚀 HÀM KẾT NỐI VÀO LUỒNG CAMERA CỦA LIVEKIT
  const connectToLiveKit = async (wsUrl: string, token: string) => {
    try {
      const newRoom = new Room();
      
      // Lắng nghe sự kiện ngắt kết nối để cập nhật lại UI
      newRoom.on(RoomEvent.Disconnected, () => {
        setIsLiveKitConnected(false);
        setRoom(null);
        setIsCameraActive(false);
      });

      await newRoom.connect(wsUrl, token);
      setRoom(newRoom);
      setIsLiveKitConnected(true);
      setIsCameraActive(true);
      
      toast.success("Đã kết nối", "Luồng Camera đã sẵn sàng!");
    } catch (error) {
      console.error("Lỗi kết nối LiveKit:", error);
      toast.error("Lỗi Camera", "Không thể kết nối đến máy chủ LiveKit.");
    }
  };

  // 🚀 HÀM NGẮT KẾT NỐI
  const disconnectLiveKit = () => {
    if (room) {
      room.disconnect();
    }
    setIsLiveKitConnected(false);
    setIsCameraActive(false);
    setScanResult(null);
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      disconnectLiveKit();
    } else {
      setIsCameraActive(true);
      // Lưu ý: Việc gọi connectToLiveKit sẽ được thực hiện ở UI component 
      // khi bạn đã lấy được URL và Token từ backend.
    }
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
      
      const base64String = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: 'base64', //  Chỉ cần sửa thành chuỗi chữ thường như thế này
      });

      const response = await aiService.detectRealtime(base64String);
      await processAiResponse(response, selectedImage); 
      
      toast.success("Thành công", "Đã phân tích và lưu kết quả!");
    } catch (error: any) {
      console.error("Lỗi API Phân tích:", error);
      toast.error("Lỗi kết nối", "Không thể phân tích ảnh lúc này.");
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

      toast.success("Hoàn tất", "Đã quét và lưu kết quả!");
    } catch (error) {
      console.error("Lỗi API Camera thủ công:", error);
      toast.error("Lỗi phân tích", "Không thể phân tích ảnh chụp.");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  const processAiResponse = async (response: any, sourceImage: string | null) => {
    if (response && response.objects && response.objects.length > 0) {
      const rawObjects = response.objects;
      
      const validObjects = rawObjects.filter((d: any) => d.confidence >= 0.4);
      const totalCount = validObjects.length;

      let confidenceScore = 0;
      if (totalCount > 0) {
        const totalConf = validObjects.reduce((sum: number, d: any) => sum + d.confidence, 0);
        confidenceScore = Math.round((totalConf / totalCount) * 100);
      } else {
        setScanResult({
          status: 'empty',
          quality: 'Khung hình trống hoặc nhiễu',
          confidence: '0%',
          dryness: 'N/A'
        });
        toast.info("Cảnh báo", "Vật thể phát hiện có độ tin cậy quá thấp.");
        return;
      }

      const mappedDetections = validObjects.map((d: any) => ({
        label: d.label ?? (CLASS_NAMES[d.class] ?? `Lỗi nhãn (${d.class})`),
        confidence: d.confidence
      }));

      setScanResult({
        status: 'success', 
        quality: `Đã phát hiện ${totalCount} bánh`, 
        confidence: `${confidenceScore}%`, 
        dryness: 'N/A',
        count: totalCount,
        detections: mappedDetections 
      });

      if (selectedDbCamera) {
        try {
          await apiClient.post('/iot/detection-result', {
            camera_id: selectedDbCamera,
            detected_count: totalCount,
            confidence: (confidenceScore / 100) 
          });
        } catch (dbErr) {
          console.error("Lỗi lưu Database Detection Upload:", dbErr);
        }
      }

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
    room, // Xuất room ra để UI lấy VideoTrack
    isLiveKitConnected, // Trạng thái để UI hiển thị "Đang kết nối..."
    connectToLiveKit,
    disconnectLiveKit,
    toggleCamera, 
    handlePickImage, 
    handleAnalyzeImage, 
    handleManualCapture, 
    resetUpload
  };
};