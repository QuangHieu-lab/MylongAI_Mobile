import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Image as ImageIcon, AlertCircle, ChevronLeft, MapPin, CheckCircle2, Sparkles } from 'lucide-react-native';
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

  // 🚀 CHỈ KIỂM TRA XEM CÓ BÁNH HAY KHÔNG (KHÔNG CHECK LỖI NỮA)
  const isSuccess = scanResult?.status === 'success';

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
          <Text className="text-slate-300 text-xs font-bold">Tải ảnh</Text>
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
            style={{ aspectRatio: 4 / 3 }} 
            className={`w-full bg-[#1e293b] rounded-[32px] border-2 border-dashed justify-center items-center overflow-hidden transition-all duration-300 ${
              selectedImage ? 'border-blue-500/50' : 'border-slate-700'
            }`}
          >
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage }} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain" 
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

          {/* ================= 🚀 NÚT BẤM GỌI API PHÂN TÍCH (Đã fix lỗi bị thiếu) ================= */}
          {selectedImage && !scanResult && (
            <TouchableOpacity 
              onPress={handleAnalyzeImage}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
                isAnalyzing ? 'bg-slate-700' : 'bg-blue-600'
              }`}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Sparkles size={20} color="#fff" />
              )}
              <Text className="text-white font-bold text-lg">
                {isAnalyzing ? 'Hệ thống đang phân tích...' : 'Bắt đầu giám định AI'}
              </Text>
            </TouchableOpacity>
          )}

          {/* ================= KHUNG KẾT QUẢ AI TRẢ VỀ ================= */}
          {!isAnalyzing && scanResult && (
            <View className={`rounded-[24px] p-5 border mt-2 shadow-lg ${
              isSuccess ? 'bg-emerald-950/80 border-emerald-500/40' : 'bg-amber-950/80 border-amber-500/40'
            }`}>
              <View className="flex-row items-center gap-3 mb-4 border-b border-white/10 pb-4">
                <View className={`p-2 rounded-xl ${isSuccess ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                  {isSuccess ? <CheckCircle2 size={24} color="#34d399" /> : <AlertCircle size={24} color="#fbbf24" />}
                </View>
                <Text className="text-white font-bold text-xl tracking-tight flex-1">Kết quả giám định</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-300 font-medium">Phát hiện:</Text>
                <Text className={`font-black text-xl uppercase tracking-wider ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scanResult.quality}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-300 font-medium">Độ tin cậy YOLOv8:</Text>
                <View className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                  <Text className="text-white font-bold">{scanResult.confidence}</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={resetUpload} 
                className="mt-6 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl items-center flex-row justify-center gap-2 shadow-inner"
              >
                <ImageIcon size={18} color="#94a3b8" />
                <Text className="text-slate-300 font-bold text-base">Chọn ảnh khác</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}