// src/hooks/useYoloVision.ts
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useYoloVision = () => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'upload'>('upload');
  
  // States cho Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 

  // States cho Upload
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null); 

  // Dùng useRef để lưu trữ ID của các hàm chạy ngầm (setTimeout)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // XÓA BỘ NHỚ TRỐNG KHI THOÁT MÀN HÌNH (Tối ưu Memory Leak)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      timerRef.current = setTimeout(() => setIsScanning(true), 2000);
    } else {
      setIsScanning(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập ảnh để sử dụng tính năng này!");
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
      Alert.alert("Lỗi", "Có lỗi xảy ra khi mở thư viện ảnh.");
    }
  };

  const handleAnalyzeImage = () => {
    setIsAnalyzing(true);
    
    // Lưu timer ID lại để có thể hủy nếu cần
    timerRef.current = setTimeout(() => {
      setIsAnalyzing(false);
      setScanResult({
        status: 'success',
        quality: 'Đạt chuẩn',
        confidence: '98.5%',
        dryness: '85%'
      });
    }, 2500);
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setScanResult(null);
  };

  return {
    activeTab, setActiveTab,
    isCameraActive, isScanning, toggleCamera,
    selectedImage, isAnalyzing, scanResult, handlePickImage, handleAnalyzeImage, resetUpload
  };
};