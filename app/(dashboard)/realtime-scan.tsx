import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Scan, Camera } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Import Hook YOLO AI
import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function RealtimeScanScreen() {
  const router = useRouter();
  
  // 1. Quyền truy cập Camera
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 2. Lấy bộ xử lý AI từ Hook
  const { scanResult, isAnalyzing, handleManualCapture } = useYoloVision();

  // ==============================
  // 🚀 HÀM CHỤP VÀ GỬI ẢNH LÊN AI (THỦ CÔNG)
  // ==============================
  const takePhotoAndAnalyze = async () => {
    // Chặn bấm spam khi AI đang xử lý
    if (isAnalyzing || !cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2, // Giảm chất lượng ảnh để Base64 nhẹ đi
      });

      if (photo?.base64) {
        // Gửi chuỗi Base64 thẳng vào Hook để gọi API
        await handleManualCapture(photo.base64);
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh AI:", error);
    }
  };

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
  // GIAO DIỆN CAMERA CHÍNH (ĐÃ SỬA LỖI CẤU TRÚC)
  // ==============================
  return (
    <View className="flex-1 bg-black relative">
      
      {/* 1. LỚP BACKGROUND: Ống kính Camera nằm dưới cùng */}
      <CameraView 
        ref={cameraRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
        facing="back"
      />

      {/* 2. LỚP OVERLAY: Giao diện nổi lên trên Camera */}
      {/* Dùng pointerEvents="box-none" để các vùng trống không cản thao tác chạm vào camera (nếu cần focus) */}
      <SafeAreaView className="flex-1 justify-between" pointerEvents="box-none">
        
        {/* Header với nút Back */}
        <View className="flex-row items-center justify-between p-4 z-50">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-slate-600"
          >
            <ArrowLeft size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg drop-shadow-md">YOLO Vision AI</Text>
          <View className="w-10" /> 
        </View>

        {/* Khung Ngắm Trực Diện */}
        <View className="flex-1 justify-center items-center relative" pointerEvents="none">
          <View className={`w-72 h-72 border-2 border-dashed rounded-3xl items-center justify-center relative ${
            isAnalyzing ? 'border-sky-400 bg-sky-400/10' : 'border-emerald-400 bg-emerald-400/10'
          }`}>
            
            {/* 4 Góc ngắm */}
            <View className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl ${isAnalyzing ? 'border-sky-500' : 'border-emerald-500'}`} />
            <View className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl ${isAnalyzing ? 'border-sky-500' : 'border-emerald-500'}`} />
            <View className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl ${isAnalyzing ? 'border-sky-500' : 'border-emerald-500'}`} />
            <View className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl ${isAnalyzing ? 'border-sky-500' : 'border-emerald-500'}`} />
            
            <Scan size={48} color={isAnalyzing ? "#38bdf8" : "#34d399"} className={isAnalyzing ? "opacity-100" : "opacity-50"} />
            <Text className={`mt-4 font-mono font-bold text-xs ${isAnalyzing ? 'text-sky-400' : 'text-emerald-400'}`}>
              {isAnalyzing ? 'ĐANG XỬ LÝ KHUNG HÌNH...' : 'CĂN CHỈNH BÁNH VÀ BẤM CHỤP'}
            </Text>
          </View>

          {/* HIỂN THỊ KẾT QUẢ AI TRẢ VỀ TRÊN MÀN HÌNH */}
          {!isAnalyzing && scanResult && (
            <View className={`absolute bottom-10 px-6 py-3 rounded-full border shadow-lg ${
              scanResult.status === 'success' ? 'bg-emerald-900/90 border-emerald-400 shadow-emerald-500/30' : 'bg-slate-900/90 border-slate-500'
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
            onPress={takePhotoAndAnalyze}
            disabled={isAnalyzing} 
            className={`w-20 h-20 rounded-full items-center justify-center border-4 shadow-xl ${
              isAnalyzing ? 'bg-slate-700 border-slate-500' : 'bg-emerald-500 border-slate-800'
            }`}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <Camera size={32} color="white" />
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}