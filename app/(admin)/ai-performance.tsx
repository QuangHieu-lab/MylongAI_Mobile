import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, Target, BrainCircuit, CheckCircle, 
  AlertTriangle, Camera, UploadCloud, RefreshCw, Database
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function AiPerformanceScreen() {
  const router = useRouter();

  // Mock Data (Sau này sẽ lấy từ API Backend trả về)
  const aiConfidence = 96.8;
  const totalScans = "1,240";
  const falsePositives = 12; // Báo lỗi nhầm
  const falseNegatives = 8;  // Bỏ sót lỗi

  // State xử lý loading cho các nút hành động
  const [isTraining, setIsTraining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Xử lý mở Camera để quét test (Tương lai tích hợp expo-camera)
  const handleLiveScan = () => {
    Toast.show({
      type: 'info',
      text1: 'Mở Camera AI',
      text2: 'Đang khởi tạo luồng camera để quét bánh trực tiếp...',
      position: 'top'
    });
    // TODO: Navigate sang màn hình Camera Test
  };

  // Xử lý tải ảnh lên để test/thêm vào tập dữ liệu (Tương lai tích hợp expo-image-picker)
  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      Toast.show({
        type: 'success',
        text1: 'Tải ảnh thành công',
        text2: 'Đã thêm ảnh vào tập dữ liệu chờ duyệt.',
        position: 'top'
      });
    }, 1500);
  };

  // Xử lý gọi API Train lại mô hình YOLO
  const handleRetrainAI = () => {
    setIsTraining(true);
    Toast.show({
      type: 'info',
      text1: 'Bắt đầu Fine-tuning',
      text2: 'Đang nạp 20 ảnh sai lệch vào mô hình YOLO...',
      position: 'top'
    });

    setTimeout(() => {
      setIsTraining(false);
      Toast.show({
        type: 'success',
        text1: 'Huấn luyện hoàn tất!',
        text2: 'Độ tin cậy dự kiến tăng thêm 0.2%.',
        position: 'top'
      });
    }, 3000);
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
        {/* HEADER */}
        <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Hiệu suất & Độ tin cậy</Text>
            <Text className="text-purple-400 text-xs mt-0.5">YOLO Vision AI Workspace</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* CARD TỔNG QUAN HIỆU SUẤT */}
          <View className="w-full bg-[#1e293b] p-6 rounded-[32px] border border-slate-700/50 shadow-lg mb-6 relative overflow-hidden">
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            
            <View className="flex-row justify-between items-center mb-6 z-10">
              <View className="bg-purple-500/20 p-3 rounded-2xl border border-purple-500/30">
                <Target size={24} color="#c084fc" />
              </View>
              <BrainCircuit size={28} color="#64748b" />
            </View>

            <Text className="text-slate-400 text-sm font-semibold mb-1 z-10">Độ tin cậy tổng thể</Text>
            <View className="flex-row items-end gap-1 mb-4 z-10">
              <Text className="text-white text-6xl font-extrabold tracking-tight">{aiConfidence}</Text>
              <Text className="text-purple-400 text-2xl font-bold mb-1.5">%</Text>
            </View>

            <View className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700/50 z-10">
              <View className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${aiConfidence}%` }} />
            </View>
            
            <Text className="text-slate-400 text-xs z-10">Đánh giá trên <Text className="font-bold text-slate-200">{totalScans}</Text> mẻ bánh trong 30 ngày qua</Text>
          </View>

          {/* PHÂN TÍCH SAI SỐ */}
          <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Phân tích sai số (Mẫu nạp lại)</Text>
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
              <CheckCircle size={24} color="#34d399" className="mb-3" />
              <Text className="text-emerald-400/80 text-[10px] font-bold uppercase mb-1">Nhận diện đúng</Text>
              <Text className="text-emerald-500 font-extrabold text-2xl">1,220</Text>
            </View>
            <View className="flex-1 bg-rose-500/10 p-5 rounded-3xl border border-rose-500/20">
              <AlertTriangle size={24} color="#fb7185" className="mb-3" />
              <Text className="text-rose-400/80 text-[10px] font-bold uppercase mb-1">Sai lệch (Cần Train)</Text>
              <Text className="text-rose-500 font-extrabold text-2xl">{falsePositives + falseNegatives}</Text>
            </View>
          </View>

          {/* ================= KHU VỰC MỚI: WORKSPACE CỦA AI ================= */}
          <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Công cụ nạp dữ liệu & Huấn luyện</Text>
          
          <View className="bg-[#1e293b] rounded-[32px] border border-slate-700/50 p-2 shadow-lg mb-6">
            
            {/* Nút 1: Quét trực tiếp */}
            <TouchableOpacity 
              onPress={handleLiveScan}
              className="flex-row items-center p-4 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700/50"
            >
              <View className="w-12 h-12 bg-cyan-500/10 rounded-xl items-center justify-center border border-cyan-500/20">
                <Camera size={20} color="#22d3ee" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-base">Quét bánh trực tiếp</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Dùng camera điện thoại test độ nhận diện</Text>
              </View>
            </TouchableOpacity>

            {/* Nút 2: Tải ảnh lên */}
            <TouchableOpacity 
              onPress={handleUploadImage}
              disabled={isUploading}
              className="flex-row items-center p-4 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700/50"
            >
              <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center border border-blue-500/20">
                {isUploading ? <ActivityIndicator color="#60a5fa" /> : <UploadCloud size={20} color="#60a5fa" />}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-base">Tải ảnh mẫu bánh lên</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Bổ sung vào tập Dataset của YOLO</Text>
              </View>
            </TouchableOpacity>

            {/* Nút 3: Train lại AI */}
            <TouchableOpacity 
              onPress={handleRetrainAI}
              disabled={isTraining || (falsePositives + falseNegatives === 0)}
              className="flex-row items-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 relative overflow-hidden"
            >
              {isTraining && <View className="absolute inset-0 bg-amber-500/5 animate-pulse" />}
              <View className="w-12 h-12 bg-amber-500/20 rounded-xl items-center justify-center border border-amber-500/30">
                {isTraining ? <ActivityIndicator color="#fbbf24" /> : <RefreshCw size={20} color="#fbbf24" />}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-amber-400 font-bold text-base">Huấn luyện lại AI (Fine-tune)</Text>
                <Text className="text-amber-400/70 text-xs mt-0.5">
                  Đang có {falsePositives + falseNegatives} ảnh sai lệch chờ nạp lại
                </Text>
              </View>
            </TouchableOpacity>

          </View>
          
          <View className="flex-row items-center justify-center gap-2 mb-4">
            <Database size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs font-mono">Dataset version: yolo-rice-v2.1</Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Component Toast để hiển thị popup thông báo */}
      <Toast />
    </>
  );
}