import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Image as ImageIcon, BrainCircuit, AlertCircle, ChevronLeft, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useYoloVision } from '@/src/hooks/useYoloVision'; // 👈 Import Hook của bạn

export default function AiDetectScreen() {
  const router = useRouter();
  
  // 🚀 Gọi Hook lấy các hàm cần thiết cho phần Upload
  const { 
    selectedImage, 
    isAnalyzing, 
    scanResult, 
    handlePickImage, 
    handleAnalyzeImage, 
    resetUpload 
  } = useYoloVision();

  // Xác định bánh Đạt hay Lỗi để đổi màu UI
  const isDefect = scanResult?.quality?.includes('Lỗi') || scanResult?.status === 'empty';

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* ================= HEADER ================= */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Giám định Thủ công</Text>
        </View>
        <View className="flex-row items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full">
          <MapPin size={12} color="#94a3b8" />
          <Text className="text-slate-300 text-xs font-medium">Sân A</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* ================= THANH TABS CHUYỂN ĐỔI ================= */}
        <View className="flex-row bg-[#1e293b] p-1.5 rounded-2xl mb-6 border border-slate-800">
          <TouchableOpacity 
            onPress={() => router.push('/(dashboard)/realtime-scan' as any)}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-transparent"
          >
            <Camera size={18} color="#64748b" />
            <Text className="font-bold text-slate-400">Quét Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 shadow-sm">
            <Upload size={18} color="#60a5fa" />
            <Text className="font-bold text-blue-400">Tải ảnh lên</Text>
          </TouchableOpacity>
        </View>

        {/* ================= KHU VỰC TẢI ẢNH LÊN ================= */}
        <View className="flex-col gap-5">
          <TouchableOpacity 
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="w-full aspect-[4/3] bg-[#1e293b] rounded-[32px] border-2 border-dashed border-slate-700 justify-center items-center overflow-hidden"
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4">
                  <ImageIcon size={32} color="#475569" />
                </View>
                <Text className="text-slate-300 font-bold text-base">Bấm để chọn ảnh</Text>
                <Text className="text-slate-500 mt-1 text-xs">JPG, PNG (Tối đa 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nút gửi ảnh để phân tích */}
          {selectedImage && !scanResult && (
            <TouchableOpacity 
              onPress={handleAnalyzeImage}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg mt-2 ${
                isAnalyzing ? 'bg-blue-500/50 border border-blue-500/30' : 'bg-blue-600'
              }`}
            >
              {isAnalyzing ? (
                <><ActivityIndicator color="#fff" size="small" /><Text className="text-white font-bold text-lg">AI đang phân tích...</Text></>
              ) : (
                <><BrainCircuit size={20} color="#fff" /><Text className="text-white font-bold text-lg">Phân tích ngay</Text></>
              )}
            </TouchableOpacity>
          )}

          {/* ================= KHUNG KẾT QUẢ AI TRẢ VỀ ================= */}
          {scanResult && (
            <View className={`rounded-3xl p-5 border mt-4 ${
              !isDefect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <View className="flex-row items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                {!isDefect ? <BrainCircuit size={20} color="#34d399" /> : <AlertCircle size={20} color="#fb7185" />}
                <Text className="text-white font-bold text-lg">Kết quả giám định AI</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-400 font-medium">Chẩn đoán:</Text>
                <Text className={`font-bold text-base ${!isDefect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scanResult.quality}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-400 font-medium">Độ tin cậy YOLOv8:</Text>
                <View className="bg-slate-800/80 px-2.5 py-1 rounded-lg">
                  <Text className="text-white font-bold">{scanResult.confidence}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={resetUpload} className="mt-6 py-3.5 bg-[#1e293b] border border-slate-700 rounded-xl items-center flex-row justify-center gap-2">
                <ImageIcon size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-semibold">Chọn ảnh khác</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}