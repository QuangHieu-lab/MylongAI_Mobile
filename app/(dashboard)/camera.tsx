import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView 
} from 'react-native';
import { Thermometer, Droplets, Clock, Activity, Video, CircleDot, Maximize, Minimize, ChevronRight, Bell, Settings } from 'lucide-react-native';

export default function CameraMonitoringScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ================= TÁCH GIAO DIỆN CAMERA (DARK NEON) =================
  const renderCameraContent = (isFull: boolean) => (
    <>
      {/* Giả lập Luồng Video */}
      <View className="absolute inset-0 items-center justify-center opacity-20">
        <View className="w-3/4 h-3/4 border border-cyan-500/50 rounded-[40px] scale-y-50" />
      </View>

      {/* Tag Status (Trái) & REC (Phải) - Bo tròn, viền Neon */}
      <View className="absolute top-4 left-4 right-4 flex-row justify-between pointer-events-none">
        <View className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg">
          <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <Text className="text-white text-xs font-bold">Online</Text>
          <Text className="text-cyan-400/70 text-xs">· Zone A</Text>
        </View>

        <View className="bg-red-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30 flex-row items-center gap-1.5 shadow-lg">
          <CircleDot size={12} color="#f87171" />
          <Text className="text-red-400 text-xs font-bold">REC</Text>
        </View>
      </View>

      {/* Nút nổi ở đáy Camera (Giống form Tilda, nhưng màu Dark Neon) */}
      <View className="absolute bottom-5 self-center bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20 flex-row items-center gap-2">
        <Text className="text-cyan-400 font-semibold text-sm">Độ khô hiện tại: 31%</Text>
        <ChevronRight size={16} color="#22d3ee" />
      </View>
      
      {/* Nút Phóng To */}
      {!isFull && (
        <TouchableOpacity 
          onPress={() => setIsFullscreen(true)}
          className="absolute bottom-5 right-4 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-full border border-slate-700 shadow-lg"
        >
          <Maximize size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <>
      <ScrollView 
        className="flex-1 bg-[#0f172a]" // Giữ nguyên nền Navy đậm của bạn
        contentContainerStyle={{ padding: isTablet ? 32 : 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View className="flex-row items-center justify-between mb-6 mt-2">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-3xl font-extrabold tracking-tight">Camera AI</Text>
            </View>
            <Text className="text-cyan-500/80 text-xs font-bold uppercase tracking-widest mt-1">XƯỞNG PHƠI MỸ LỒNG</Text>
          </View>
          
          <View className="flex-row gap-3">
            <TouchableOpacity className="p-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-sm">
              <Bell size={20} color="#e2e8f0" />
            </TouchableOpacity>
          </View>
        </View>

        <View className={isTablet ? 'flex-row gap-8' : 'flex-col gap-6'}>
          
          {/* ================= PHẦN TRÁI: CAMERA ================= */}
          <View className={isTablet ? 'flex-[2]' : 'w-full'}>
            {/* Khung Camera bo góc cực lớn [32px] chuẩn UI mới */}
            <View className="w-full aspect-[4/3] bg-[#1e293b] rounded-[32px] border border-slate-700/50 overflow-hidden relative shadow-lg shadow-black/50">
              {renderCameraContent(false)}
            </View>
          </View>

          {/* ================= PHẦN PHẢI: CHỈ SỐ ================= */}
          <View className={isTablet ? 'flex-[1]' : 'w-full'}>
            
            {/* Tiêu đề Section */}
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-white text-xl font-bold">Hôm nay</Text>
              <Text className="text-slate-400 text-sm font-medium">Trực tiếp</Text>
            </View>
            
            {/* Grid 2 Cột (Nhiệt độ & Độ ẩm) bo góc lớn */}
            <View className="flex-row flex-wrap gap-4 mb-4">
              {/* Thẻ Nhiệt Độ */}
              <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-slate-300 font-bold text-base">Nhiệt độ</Text>
                  <View className="bg-orange-500/20 p-1.5 rounded-lg">
                    <Thermometer size={16} color="#f97316" />
                  </View>
                </View>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">MỨC TRUNG BÌNH</Text>
                <Text className="text-orange-500 text-3xl font-extrabold shadow-orange-500/20">33.9°C</Text>
              </View>

              {/* Thẻ Độ Ẩm */}
              <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-slate-300 font-bold text-base">Độ ẩm</Text>
                  <View className="bg-cyan-500/20 p-1.5 rounded-lg">
                    <Droplets size={16} color="#06b6d4" />
                  </View>
                </View>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">HIỆN TẠI</Text>
                <Text className="text-cyan-400 text-3xl font-extrabold shadow-cyan-400/20">50%</Text>
              </View>
            </View>

            {/* Thẻ Rộng (Tiến độ phơi) */}
            <View className="flex-row items-center justify-between mt-2 mb-4 px-1">
              <Text className="text-white text-xl font-bold">Tiến độ phơi</Text>
              <Text className="text-cyan-400 font-medium text-sm">Chi tiết <ChevronRight size={14} color="#22d3ee" className="inline" /></Text>
            </View>

            <View className="bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg w-full">
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-slate-400 text-sm font-medium mb-1">Dự kiến hoàn thành</Text>
                  <Text className="text-white text-3xl font-extrabold tracking-tight">16:41</Text>
                </View>
                <View className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
                  <Clock size={24} color="#818cf8" />
                </View>
              </View>

              <View className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3 border border-slate-700/50">
                <View className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: '31%' }} />
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-emerald-400 font-bold text-sm">31% Khô</Text>
                <Text className="text-slate-500 font-medium text-xs">Còn 3h 31p</Text>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>

      {/* ================= MODAL FULLSCREEN ================= */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsFullscreen(false)} 
      >
        <SafeAreaView className="flex-1 bg-black">
          <View className="absolute top-12 left-0 right-0 z-50 flex-row justify-between items-start px-6 pointer-events-box-none">
            <View className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 flex-row items-center gap-2 mt-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <Text className="text-white text-sm font-bold tracking-wider">LIVE</Text>
            </View>

            <TouchableOpacity 
              onPress={() => setIsFullscreen(false)}
              className="bg-slate-900/80 backdrop-blur-md p-3 px-4 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg"
            >
              <Minimize size={20} color="#e2e8f0" />
              <Text className="text-white font-semibold">Thu nhỏ</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center w-full relative">
            {renderCameraContent(true)}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}