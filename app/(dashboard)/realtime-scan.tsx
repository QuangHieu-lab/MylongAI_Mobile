import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Scan, Camera, MapPin, BrainCircuit, AlertCircle, XCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Import Hook YOLO AI
import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function RealtimeScanScreen() {
  const router = useRouter();
  
  // 1. Quyền truy cập Camera
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 2. Lấy bộ xử lý AI từ Hook
  const { scanResult, isAnalyzing, handleManualCapture, resetUpload } = useYoloVision();

  // 3. Phân tích kết quả (Đạt hay Lỗi)
  const isDefect = scanResult?.quality?.includes('Lỗi') || scanResult?.status === 'empty';

  // ==============================
  // 🚀 HÀM CHỤP VÀ GỬI ẢNH LÊN AI (THỦ CÔNG)
  // ==============================
  const takePhotoAndAnalyze = async () => {
    if (isAnalyzing || !cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2, // Giảm chất lượng ảnh để Base64 nhẹ đi, API xử lý nhanh hơn
      });

      if (photo?.base64) {
        await handleManualCapture(photo.base64);
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh AI:", error);
    }
  };

  // ==============================
  // GIAO DIỆN XIN QUYỀN CAMERA
  // ==============================
  if (!permission) return <View className="flex-1 bg-[#0f172a]" />;
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f172a] justify-center items-center px-6">
        <AlertCircle size={60} color="#fb7185" className="mb-4" />
        <Text className="text-white font-bold text-center text-lg mb-2">Cần cấp quyền Camera</Text>
        <Text className="text-slate-400 text-center mb-8">
          Hệ thống AI cần sử dụng Camera để quét và phân tích chất lượng mẻ bánh trực tiếp tại xưởng.
        </Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 px-8 py-4 rounded-2xl w-full items-center">
          <Text className="text-white font-bold text-lg">Cho phép truy cập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ==============================
  // MÀU SẮC KHUNG NGẮM THEO TRẠNG THÁI
  // ==============================
  const getTargetColor = () => {
    if (isAnalyzing) return { border: 'border-sky-400', bg: 'bg-sky-400/10', text: 'text-sky-400' };
    if (scanResult) {
      return isDefect 
        ? { border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400' }
        : { border: 'border-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' };
    }
    return { border: 'border-white/50', bg: 'bg-white/5', text: 'text-white/70' }; // Mặc định
  };

  const targetStyle = getTargetColor();

  // ==============================
  // GIAO DIỆN CAMERA CHÍNH
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
      <SafeAreaView className="flex-1 justify-between" pointerEvents="box-none">
        
        {/* HEADER */}
        <View className="flex-row items-center justify-between p-6 z-50">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
            >
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xl drop-shadow-md">YOLO Vision</Text>
          </View>
          
          <View className="flex-row items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <MapPin size={12} color="#38bdf8" />
            <Text className="text-slate-200 text-xs font-bold">Sân A</Text>
          </View>
        </View>

        {/* KHUNG NGẮM TRỰC DIỆN (VIEWFINDER) */}
        <View className="flex-1 justify-center items-center relative" pointerEvents="none">
          <View className={`w-72 h-72 border-2 border-dashed rounded-[32px] items-center justify-center relative transition-colors duration-300 ${targetStyle.border} ${targetStyle.bg}`}>
            
            {/* 4 Góc ngắm */}
            <View className={`absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 rounded-tl-[32px] ${targetStyle.border.replace('border-', 'border-t-').replace('border-', 'border-l-')}`} />
            <View className={`absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 rounded-tr-[32px] ${targetStyle.border.replace('border-', 'border-t-').replace('border-', 'border-r-')}`} />
            <View className={`absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 rounded-bl-[32px] ${targetStyle.border.replace('border-', 'border-b-').replace('border-', 'border-l-')}`} />
            <View className={`absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 rounded-br-[32px] ${targetStyle.border.replace('border-', 'border-b-').replace('border-', 'border-r-')}`} />
            
            <Scan size={48} color={isAnalyzing ? "#38bdf8" : (scanResult ? (isDefect ? "#f43f5e" : "#34d399") : "#ffffff")} className={isAnalyzing || scanResult ? "opacity-100" : "opacity-30"} />
            
            <Text className={`mt-6 font-bold text-xs tracking-widest uppercase px-4 text-center ${targetStyle.text}`}>
              {isAnalyzing ? 'Đang phân tích khung hình...' : (scanResult ? 'Hoàn tất đánh giá' : 'Căn bánh vào giữa khung')}
            </Text>
          </View>
        </View>

        {/* VÙNG ĐIỀU KHIỂN BÊN DƯỚI */}
        <View className="px-6 pb-10 pt-4">
          
          {/* HIỂN THỊ KẾT QUẢ AI TRẢ VỀ */}
          {!isAnalyzing && scanResult && (
            <View className={`mb-6 p-4 rounded-3xl border backdrop-blur-xl relative overflow-hidden ${
              !isDefect ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-rose-950/80 border-rose-500/50'
            }`}>
              <View className="flex-row items-center gap-2 mb-2">
                {!isDefect ? <BrainCircuit size={18} color="#34d399" /> : <AlertCircle size={18} color="#fb7185" />}
                <Text className="text-white font-bold text-base">Kết quả AI</Text>
              </View>
              
              <Text className={`font-bold text-xl mb-1 ${!isDefect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scanResult.quality}
              </Text>
              <Text className="text-slate-300 text-xs">
                Độ tin cậy: <Text className="font-bold text-white">{scanResult.confidence}</Text>
              </Text>

              {/* Nút tắt kết quả */}
              <TouchableOpacity onPress={resetUpload}   className="absolute top-4 right-4 p-2">
  <XCircle size={20} color="#cbd5e1" />
</TouchableOpacity>
            </View>
          )}

          {/* NÚT CHỤP / QUÉT KHỔNG LỒ */}
          <View className="items-center">
            <TouchableOpacity 
              onPress={takePhotoAndAnalyze}
              disabled={isAnalyzing} 
              className={`w-20 h-20 rounded-full items-center justify-center border-4 shadow-2xl ${
                isAnalyzing ? 'bg-slate-700 border-slate-500' : 'bg-blue-600 border-slate-800'
              }`}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Camera size={32} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
        </View>
      </SafeAreaView>
    </View>
  );
}