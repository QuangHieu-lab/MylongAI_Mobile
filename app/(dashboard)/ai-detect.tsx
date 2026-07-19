import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Image as ImageIcon, BrainCircuit, AlertCircle, ChevronLeft, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function AiDetectScreen() {
  const router = useRouter();
  
  const { 
    selectedImage, 
    isAnalyzing, 
    scanResult, 
    handlePickImage, 
    handleAnalyzeImage, 
    resetUpload 
  } = useYoloVision();

  const isDefect = scanResult?.quality?.includes('Lỗi') || scanResult?.status === 'empty';

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* ================= HEADER ================= */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Giám định Thủ công</Text>
        </View>
        <View className="flex-row items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/50">
          <MapPin size={12} color="#94a3b8" />
          <Text className="text-slate-300 text-xs font-bold">Sân A</Text>
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
            // Bỏ class aspect-[4/3] đi và dùng style gốc của React Native để khóa tỷ lệ
            style={{ aspectRatio: 4 / 3 }} 
            className={`w-full bg-[#1e293b] rounded-[32px] border-2 border-dashed justify-center items-center overflow-hidden transition-all duration-300 ${
              selectedImage ? 'border-blue-500/50' : 'border-slate-700'
            }`}
          >
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage }} 
                // Ép kích thước ảnh bằng style gốc để đảm bảo nó luôn nằm vừa vặn
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover" 
              />
            ) : (
              <View className="items-center">
                <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-slate-700/50 shadow-sm">
                  <ImageIcon size={32} color="#64748b" />
                </View>
                <Text className="text-slate-300 font-bold text-base">Bấm để chọn ảnh</Text>
                <Text className="text-slate-500 mt-1 text-xs">Hỗ trợ JPG, PNG (Tối đa 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ================= KHUNG KẾT QUẢ AI TRẢ VỀ ================= */}
          {scanResult && (
            <View className={`rounded-3xl p-5 border mt-4 shadow-lg ${
              !isDefect ? 'bg-emerald-950/80 border-emerald-500/40' : 'bg-rose-950/80 border-rose-500/40'
            }`}>
              <View className="flex-row items-center gap-2 mb-4 border-b border-slate-700/50 pb-4">
                <View className={`p-2 rounded-xl ${!isDefect ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  {!isDefect ? <BrainCircuit size={20} color="#34d399" /> : <AlertCircle size={20} color="#fb7185" />}
                </View>
                <Text className="text-white font-bold text-lg tracking-tight">Kết quả giám định AI</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-400 font-medium">Chẩn đoán:</Text>
                <Text className={`font-black text-lg uppercase tracking-wider ${!isDefect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scanResult.quality}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-400 font-medium">Độ tin cậy YOLOv8:</Text>
                <View className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <Text className="text-white font-bold">{scanResult.confidence}</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={resetUpload} 
                className="mt-6 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl items-center flex-row justify-center gap-2 shadow-inner"
              >
                <ImageIcon size={18} color="#94a3b8" />
                <Text className="text-slate-300 font-bold">Chọn ảnh khác</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}