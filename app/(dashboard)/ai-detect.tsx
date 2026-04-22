import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Target, Power, Focus, Image as ImageIcon, AlertCircle, Zap, BrainCircuit } from 'lucide-react-native';
import { useRouter } from 'expo-router'
import { useYoloVision } from '@/src/hooks/useYoloVision';

export default function YoloDetectionScreen() {
  // Chỉ việc lấy các state và function ra để xài, không cần code logic ở đây nữa
  const router = useRouter();
  const {
    activeTab, setActiveTab,
    isCameraActive, isScanning, toggleCamera,
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

        {/* Thanh Tabs Chuyển đổi - Tối ưu cho người dùng không rành công nghệ */}
        <View className="flex-row bg-slate-200 p-1.5 rounded-2xl mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/(dashboard)/realtime-scan')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'realtime' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
          >
            <Camera size={18} color={activeTab === 'realtime' ? '#9333ea' : '#64748b'} />
            <Text className={`font-bold ${activeTab === 'realtime' ? 'text-purple-700' : 'text-slate-500'}`}>
              Quét trực tiếp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('upload')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'upload' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
          >
            <Upload size={18} color={activeTab === 'upload' ? '#f97316' : '#64748b'} />
            <Text className={`font-bold ${activeTab === 'upload' ? 'text-orange-600' : 'text-slate-500'}`}>
              Tải ảnh lên
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= TAB 1: CAMERA REALTIME ================= */}
        {activeTab === 'realtime' && (
          <View className="flex-col gap-4">
            
            {/* Nút Bật/Tắt to, rõ ràng */}
            <TouchableOpacity 
              onPress={toggleCamera}
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm ${
                isCameraActive 
                  ? 'bg-rose-100 border border-rose-200' 
                  : 'bg-purple-100 border border-purple-200'
              }`}
            >
              <Power size={20} color={isCameraActive ? '#e11d48' : '#9333ea'} />
              <Text className={`text-lg font-bold ${isCameraActive ? 'text-rose-600' : 'text-purple-700'}`}>
                {isCameraActive ? 'Dừng Camera' : 'Bật Camera AI'}
              </Text>
            </TouchableOpacity>

            {/* Khung Camera */}
            <View className="w-full aspect-[4/3] bg-slate-900 rounded-[24px] overflow-hidden justify-center items-center shadow-lg shadow-slate-300">
              {isCameraActive ? (
                // Trạng thái đang bật
                <View className="absolute inset-0 bg-slate-800 justify-center items-center">
                  <Focus size={48} color="#22d3ee" className="opacity-40" />
                  
                  {isScanning && (
                    <View className="absolute items-center">
                      {/* Bounding Box giả lập của AI YOLO */}
                      <View className="w-40 h-40 border-2 border-emerald-400 rounded-lg bg-emerald-400/10 mb-2 items-start justify-start p-1">
                        <View className="bg-emerald-500 px-1.5 py-0.5 rounded text-[10px]">
                          <Text className="text-white text-[8px] font-bold">BÁNH ĐẠT - 99%</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <Text className="text-cyan-400 mt-4 font-mono text-xs bg-slate-900/50 px-3 py-1 rounded-full">
                    {isScanning ? '● Đang phân tích realtime...' : 'Đang khởi động Camera...'}
                  </Text>
                </View>
              ) : (
                // Trạng thái tắt
                <View className="items-center">
                  <Camera size={56} color="#475569" strokeWidth={1.5} />
                  <Text className="text-slate-400 mt-4 font-medium">Camera đang tắt</Text>
                </View>
              )}
            </View>

            {/* Thông báo kết quả trực tiếp */}
            <View className="bg-white rounded-2xl p-5 border border-slate-200 items-center justify-center min-h-[100px] shadow-sm">
              {isScanning ? (
                 <View className="flex-row items-center gap-4 w-full">
                   <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
                     <Target size={24} color="#10b981" />
                   </View>
                   <View className="flex-1">
                     <Text className="text-emerald-600 font-bold text-base mb-1">Hệ thống đang hoạt động tốt</Text>
                     <Text className="text-slate-500 text-sm">Chưa phát hiện bánh lỗi trong khung hình.</Text>
                   </View>
                 </View>
              ) : (
                <View className="items-center">
                  <AlertCircle size={24} color="#94a3b8" className="mb-2" />
                  <Text className="text-slate-500 text-center text-sm">
                    Hãy bật camera để AI bắt đầu công việc
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= TAB 2: TẢI ẢNH LÊN ================= */}
        {activeTab === 'upload' && (
          <View className="flex-col gap-4">
            
            <View className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-2">
              <Text className="text-orange-800 text-sm">
                Tính năng này cho phép bạn chụp một mẻ bánh bất kỳ và gửi lên để AI đánh giá chất lượng ngay lập tức.
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
                  <Text className="text-slate-400 mt-1 text-xs">Hỗ trợ JPG, PNG</Text>
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
              <View className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm mt-2">
                <Text className="text-slate-800 font-bold text-lg mb-4 border-b border-slate-100 pb-2">
                  Kết quả đánh giá AI
                </Text>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-slate-500">Trạng thái:</Text>
                  <Text className="text-emerald-600 font-bold">{scanResult.quality}</Text>
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
        )}

      </ScrollView>
    </SafeAreaView>
  );
}