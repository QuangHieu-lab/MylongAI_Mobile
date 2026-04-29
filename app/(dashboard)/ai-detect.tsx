import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Image as ImageIcon, BrainCircuit, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router'
import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function YoloDetectionScreen() {
  const router = useRouter();
  
  // Rút gọn: Chỉ cần lấy các state liên quan đến Upload ảnh tĩnh
  const {
    selectedImage, isAnalyzing, scanResult, handlePickImage, handleAnalyzeImage, resetUpload
  } = useYoloVision();

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fc]" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-slate-900">YOLO AI Vision</Text>
          <Text className="text-slate-500 text-sm mt-1">Hệ thống nhận diện & phân tích chất lượng bánh</Text>
        </View>

        {/* Thanh Tabs Chuyển đổi */}
        <View className="flex-row bg-slate-200 p-1.5 rounded-2xl mb-6">
          
          {/* NÚT CHUYỂN SANG MÀN HÌNH CAMERA THẬT */}
          <TouchableOpacity 
            onPress={() => router.push('/(dashboard)/realtime-scan')}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-transparent"
          >
            <Camera size={18} color={'#64748b'} />
            <Text className="font-bold text-slate-500">
              Quét trực tiếp
            </Text>
          </TouchableOpacity>

          {/* TAB HIỆN TẠI: TẢI ẢNH LÊN */}
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-sm"
          >
            <Upload size={18} color={'#f97316'} />
            <Text className="font-bold text-orange-600">
              Tải ảnh lên
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= KHU VỰC TẢI ẢNH LÊN ================= */}
        <View className="flex-col gap-4">
          
          <View className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-2">
            <Text className="text-orange-800 text-sm">
              Tính năng này cho phép bạn chọn một bức ảnh có sẵn để AI đánh giá chất lượng mẻ bánh ngay lập tức.
            </Text>
          </View>

          {/* Khung Chọn Ảnh (Dashed Border) */}
          <TouchableOpacity 
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="w-full aspect-[4/3] bg-white rounded-[24px] border-2 border-dashed border-slate-300 justify-center items-center overflow-hidden"
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-3">
                  <ImageIcon size={32} color="#64748b" />
                </View>
                <Text className="text-slate-700 font-bold text-base">Bấm để chọn ảnh</Text>
                <Text className="text-slate-400 mt-1 text-xs">Hỗ trợ JPG, PNG (Tối đa 2MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nút gửi ảnh để phân tích */}
          {selectedImage && !scanResult && (
            <TouchableOpacity 
              onPress={handleAnalyzeImage}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-sm ${
                isAnalyzing ? 'bg-orange-400' : 'bg-[#f97316]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white font-bold text-lg">AI đang phân tích...</Text>
                </>
              ) : (
                <>
                  <BrainCircuit size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg">Phân tích ngay</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Khung Kết Quả AI trả về */}
          {scanResult && (
            <View className={`rounded-2xl p-5 border shadow-sm mt-2 ${
              scanResult.status === 'success' ? 'bg-white border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              
              <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                {scanResult.status === 'success' ? (
                  <BrainCircuit size={20} color="#10b981" />
                ) : (
                  <AlertCircle size={20} color="#ef4444" />
                )}
                <Text className="text-slate-800 font-bold text-lg">
                  Kết quả đánh giá AI
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-slate-500">Phát hiện:</Text>
                <Text className={`font-bold ${scanResult.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scanResult.quality}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-slate-500">Độ tin cậy (AI):</Text>
                <Text className="text-slate-800 font-bold">{scanResult.confidence}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-slate-500">Độ khô ước tính:</Text>
                <Text className="text-cyan-600 font-bold">{scanResult.dryness}</Text>
              </View>

              {/* Nút thử lại */}
              <TouchableOpacity onPress={resetUpload} className="mt-6 py-3 bg-slate-100 rounded-xl items-center">
                <Text className="text-slate-600 font-semibold">Chọn ảnh khác</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}