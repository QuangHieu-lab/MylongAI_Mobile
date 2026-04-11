import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  useWindowDimensions,
  Platform
} from 'react-native';
import { Thermometer, Droplets, Clock, Activity, Video, CircleDot } from 'lucide-react-native';

export default function CameraMonitoringScreen() {
  // Lấy kích thước màn hình để làm Responsive
  const { width } = useWindowDimensions();
  
  // Điểm neo (breakpoint): Nếu rộng hơn 768px thì coi là Tablet (iPad)
  const isTablet = width >= 768;

  return (
    <ScrollView 
      className="flex-1 bg-[#0f172a]" 
      contentContainerStyle={{ padding: isTablet ? 24 : 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header nội dung */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <Video size={24} color="#22d3ee" />
          <Text className="text-white text-xl font-bold">Camera AI Vision</Text>
        </View>
        <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Text className="text-emerald-400 text-xs font-semibold">Đang theo dõi</Text>
        </View>
      </View>

      {/* BỐ CỤC RESPONSIVE: Row cho iPad, Column cho Smartphone */}
      <View className={isTablet ? 'flex-row gap-6' : 'flex-col gap-6'}>
        
        {/* ================= PHẦN TRÁI/TRÊN: CAMERA ================= */}
        <View className={isTablet ? 'flex-[2]' : 'w-full'}>
          {/* Khung Camera tỷ lệ 16:9 */}
          <View className="w-full aspect-video bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden relative shadow-lg">
            
            {/* Giả lập Luồng Video (Bạn sẽ thay bằng Video Player thật) */}
            <View className="absolute inset-0 items-center justify-center opacity-20">
               <View className="w-3/4 h-3/4 border border-cyan-500/50 rounded-full scale-y-50" />
            </View>

            {/* Overlays trên Camera */}
            {/* Tag REC */}
            <View className="absolute top-4 right-4 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 flex-row items-center gap-1">
              <CircleDot size={10} color="#f87171" />
              <Text className="text-red-400 text-[10px] font-bold">REC</Text>
            </View>

            {/* Thông tin Zone */}
            <View className="absolute top-4 left-4 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Text className="text-white text-xs font-mono font-bold">CAM-01 | ZONE-A</Text>
              <Text className="text-cyan-400 text-[10px] font-mono mt-0.5">13:10:23</Text>
            </View>

            {/* Tag Nhận diện AI */}
            <View className="absolute top-14 left-4 bg-emerald-500 px-2 py-1 rounded">
              <Text className="text-slate-900 text-[10px] font-bold">DETECTED</Text>
            </View>

            {/* Overlay Độ khô trực tiếp */}
            <View className="absolute bottom-4 right-4 bg-slate-900/80 px-3 py-1.5 rounded-full border border-cyan-500/50">
              <Text className="text-cyan-400 text-xs font-semibold">Dryness: 31%</Text>
            </View>

          </View>
        </View>

        {/* ================= PHẦN PHẢI/DƯỚI: CHỈ SỐ (METRICS) ================= */}
        <View className={isTablet ? 'flex-[1]' : 'w-full'}>
          <Text className="text-slate-400 text-sm font-semibold mb-3">Chỉ số hiện tại</Text>
          
          <View className="flex-row flex-wrap gap-3">
            
            {/* Thẻ Nhiệt độ (Chiếm nửa màn hình điện thoại, full trên iPad nếu cột phải nhỏ) */}
            <View className={`bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 ${isTablet ? 'w-full' : 'w-[48%] flex-grow'}`}>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-orange-500/20 p-1.5 rounded-lg">
                  <Thermometer size={16} color="#f97316" />
                </View>
                <Text className="text-slate-400 text-xs">Nhiệt độ</Text>
              </View>
              <Text className="text-white text-2xl font-bold">33.9°C</Text>
            </View>

            {/* Thẻ Độ ẩm */}
            <View className={`bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 ${isTablet ? 'w-full' : 'w-[48%] flex-grow'}`}>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-cyan-500/20 p-1.5 rounded-lg">
                  <Droplets size={16} color="#06b6d4" />
                </View>
                <Text className="text-slate-400 text-xs">Độ ẩm</Text>
              </View>
              <Text className="text-white text-2xl font-bold">50%</Text>
            </View>

            {/* Thẻ Dự kiến hoàn thành (Luôn chiếm full chiều ngang) */}
            <View className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 w-full mt-1">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-indigo-500/20 p-1.5 rounded-lg">
                  <Clock size={16} color="#818cf8" />
                </View>
                <Text className="text-slate-400 text-xs">Dự kiến hoàn thành</Text>
              </View>
              <View className="flex-row items-end justify-between">
                <Text className="text-white text-2xl font-bold">16:41</Text>
                <Text className="text-slate-400 text-xs mb-1">Còn 3h 31p</Text>
              </View>
            </View>

            {/* Thẻ Thanh tiến độ Độ khô (Luôn chiếm full chiều ngang) */}
            <View className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 w-full mt-1">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Activity size={16} color="#34d399" />
                  <Text className="text-slate-400 text-xs">Độ khô</Text>
                </View>
                <Text className="text-emerald-400 text-xl font-bold">31%</Text>
              </View>
              
              {/* Thanh Progress */}
              <View className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <View className="h-full bg-emerald-400 rounded-full" style={{ width: '31%' }} />
              </View>
              <Text className="text-slate-500 text-[10px] mt-2">Giai đoạn đầu</Text>
            </View>

          </View>
        </View>

      </View>
    </ScrollView>
  );
}