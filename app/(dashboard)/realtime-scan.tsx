import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import{SafeAreaView} from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { ArrowLeft, Scan, Camera, Square } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function RealtimeScanScreen() {
  const router = useRouter();
  
  // 1. Quyền truy cập Camera
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 2. Lấy bộ xử lý AI từ Hook
  const { scanResult } = useYoloVision();

  // 3. Trạng thái Bật/Tắt vòng lặp quét
  const [isAutoScanning, setIsAutoScanning] = useState(false);

  // Handler để gửi ảnh quét lên server
  const handleRealtimeScan = async (base64: string) => {
    try {
      // Gửi base64 ảnh đến server/API endpoint
      const response = await fetch('/api/realtime-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      // Xử lý response nếu cần
      return await response.json();
    } catch (error) {
      console.error("Lỗi gửi dữ liệu quét:", error);
    }
  };

  // ==============================
  // VÒNG LẶP QUÉT 3.5 GIÂY (Quy tắc 2 của Backend)
  // ==============================
  const scanFrame = async () => {
    if (!isAutoScanning || !cameraRef.current) return;

    try {
      // Chụp nháy 1 tấm ảnh với chất lượng nén thấp nhất để gửi siêu tốc
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.1, 
      });

      if (photo?.base64) {
        // Gửi chuỗi Base64 lên cổng Realtime
        await handleRealtimeScan(photo.base64);
      }
    } catch (error) {
      console.error("Lỗi khi quét Realtime:", error);
    } finally {
      // Đợi 3.5 giây rồi mới chụp tấm tiếp theo (Tránh lỗi 429 Too many requests)
      if (isAutoScanning) {
        setTimeout(scanFrame, 3500);
      }
    }
  };

  // Kích hoạt vòng lặp mỗi khi Quản đốc bấm nút Bật/Tắt
  useEffect(() => {
    if (isAutoScanning) {
      scanFrame();
    }
  }, [isAutoScanning]);

  // ==============================
  // GIAO DIỆN XIN QUYỀN CAMERA
  // ==============================
  if (!permission) return <View className="flex-1 bg-slate-900" />;
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-slate-300 text-center mb-6 px-6 text-lg">
          Ứng dụng cần quyền sử dụng Camera để quét mẻ bánh trực tiếp tại xưởng.
        </Text>
        <TouchableOpacity onPress={requestPermission} className="bg-emerald-500 px-8 py-4 rounded-full">
          <Text className="text-white font-bold text-lg">Cấp quyền Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ==============================
  // GIAO DIỆN CAMERA CHÍNH
  // ==============================
  return (
    <View className="flex-1 bg-black">
      {/* Ống kính Camera bao phủ toàn màn hình */}
      <CameraView 
        ref={cameraRef}
        style={{ flex: 1 }} 
        facing="back"
      >
        <SafeAreaView className="flex-1 justify-between">
          
          {/* Header với nút Back */}
          <View className="flex-row items-center justify-between p-4 z-50">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-slate-600"
            >
              <ArrowLeft size={20} color="#cbd5e1" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg drop-shadow-md">Quét AI Trực tiếp</Text>
            <View className="w-10" /> 
          </View>

          {/* Khung Ngắm Trực Diện */}
          <View className="flex-1 justify-center items-center">
            <View className={`w-72 h-72 border-2 border-dashed rounded-3xl items-center justify-center relative ${
              isAutoScanning ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-500 bg-slate-800/30'
            }`}>
              
              {/* 4 Góc ngắm */}
              <View className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl ${isAutoScanning ? 'border-emerald-500' : 'border-slate-400'}`} />
              <View className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl ${isAutoScanning ? 'border-emerald-500' : 'border-slate-400'}`} />
              <View className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl ${isAutoScanning ? 'border-emerald-500' : 'border-slate-400'}`} />
              <View className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl ${isAutoScanning ? 'border-emerald-500' : 'border-slate-400'}`} />
              
              <Scan size={48} color={isAutoScanning ? "#34d399" : "#94a3b8"} className="opacity-50" />
              <Text className={`mt-4 font-mono font-bold text-xs ${isAutoScanning ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isAutoScanning ? 'ĐANG QUÉT (3.5s/lần)...' : 'ĐÃ TẠM DỪNG'}
              </Text>
            </View>

            {/* HIỂN THỊ KẾT QUẢ AI TRẢ VỀ TRÊN MÀN HÌNH */}
            {isAutoScanning && scanResult && (
              <View className={`absolute bottom-10 px-6 py-3 rounded-full border ${
                scanResult.status === 'success' ? 'bg-emerald-900/80 border-emerald-400' : 'bg-slate-900/80 border-slate-500'
              }`}>
                <Text className={`font-bold text-lg text-center ${scanResult.status === 'success' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {scanResult.quality}
                </Text>
                {scanResult.status === 'success' && (
                  <Text className="text-white text-center text-xs mt-1">
                    Độ tin cậy: {scanResult.confidence}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Nút Chụp/Quét dưới cùng */}
          <View className="pb-10 pt-4 items-center">
            <TouchableOpacity 
              onPress={() => setIsAutoScanning(!isAutoScanning)}
              className={`w-16 h-16 rounded-full items-center justify-center border-4 border-slate-800 shadow-xl ${
                isAutoScanning ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            >
              {isAutoScanning ? (
                <Square size={24} color="white" fill="white" /> // Nút Dừng màu Đỏ
              ) : (
                <Camera size={24} color="white" /> // Nút Bắt đầu màu Xanh
              )}
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </CameraView>
    </View>
  );
}