import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView 
} from 'react-native';
import { 
  Thermometer, Droplets, Clock, CircleDot, Maximize, 
  Minimize, ChevronRight, Bell, Settings, X, CheckCircle, 
  Info, AlertTriangle, CloudRain, ChevronLeft,
  Camera, WifiOff, MapPin // 👈 Import thêm icon Camera và Wifi
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

// ================= DỮ LIỆU MOCK =================
const trackingHistory = [
  { id: '1', time: '13:00', message: 'Mẻ bánh bắt đầu - AI Vision phát hiện bánh tráng', type: 'success' },
  { id: '2', time: '14:15', message: 'Độ khô đạt 45% - Tiến độ tốt', type: 'info' },
  { id: '3', time: '15:00', message: 'Độ ẩm tăng nhẹ', type: 'warning' },
];

// 🚀 Thêm Mock Data cho danh sách Camera
const MOCK_CAMERAS = [
  { id: 'cam1', name: 'Camera Góc Trái', location: 'Sân phơi Khu A', status: 'online', temp: '36.5', hum: '45', progress: 31, timeLeft: '3h 31p', timeEst: '16:41' },
  { id: 'cam2', name: 'Camera Toàn Cảnh', location: 'Khu sấy nhiệt', status: 'online', temp: '45.0', hum: '30', progress: 85, timeLeft: '0h 45p', timeEst: '14:20' },
  { id: 'cam3', name: 'Camera Cổng Rào', location: 'Khu vực bốc dỡ', status: 'offline', temp: '--', hum: '--', progress: 0, timeLeft: '--', timeEst: '--' },
];

export default function CameraMonitoringScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  // 🚀 State quản lý Camera đang chọn
  const [selectedCam, setSelectedCam] = useState(MOCK_CAMERAS[0]);

  // ================= GIẢ LẬP BẮN TOAST CẢNH BÁO MƯA (Ban đầu) =================
  useEffect(() => {
    setTimeout(() => {
      Toast.show({
        type: 'error', 
        text1: '🌧️ Cảnh báo mưa (Nguy cơ Cao)',
        text2: 'Khả năng mưa 79%. Khung giờ: 14:00 - 16:00. Vui lòng chuẩn bị thu bánh!',
        visibilityTime: 6000, 
        position: 'top',
      });
    }, 2000); 
  }, []);

  // 🚀 Hàm xử lý khi chọn Camera khác
  const handleSelectCamera = (cam: typeof MOCK_CAMERAS[0]) => {
    setSelectedCam(cam);
    
    // Bắn Toast thông báo dựa trên trạng thái và vị trí
    if (cam.status === 'offline') {
      Toast.show({
        type: 'error',
        text1: `🚫 Mất kết nối Camera`,
        text2: `Không thể kết nối tới ${cam.name} tại ${cam.location}.`,
        position: 'top',
      });
    } else if (cam.location.includes('Sân phơi')) {
      Toast.show({
        type: 'info',
        text1: `⛅ Cập nhật thời tiết`,
        text2: `Khu vực ${cam.location} đang có nắng tốt.`,
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: `✅ Đã chuyển luồng Camera`,
        text2: `Đang giám sát tại ${cam.location}.`,
        position: 'top',
      });
    }
  };

  // ================= TÁCH GIAO DIỆN CAMERA (DARK NEON) =================
  const renderCameraContent = (isFull: boolean) => (
    <>
      {/* Luồng Video / Trạng thái Offline */}
      <View className="absolute inset-0 items-center justify-center opacity-20 bg-slate-900">
        {selectedCam.status === 'online' ? (
          <View className="w-3/4 h-3/4 border border-cyan-500/50 rounded-[40px] scale-y-50" />
        ) : (
          <View className="items-center justify-center opacity-50">
            <WifiOff size={60} color="#94a3b8" />
          </View>
        )}
      </View>

      {/* Tag Status (Trái) & REC (Phải) */}
      <View className="absolute top-4 left-4 right-4 flex-row justify-between pointer-events-none">
        <View className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg">
          <View className={`w-2 h-2 rounded-full ${selectedCam.status === 'online' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
          <Text className="text-white text-xs font-bold">{selectedCam.status === 'online' ? 'Online' : 'Offline'}</Text>
          <Text className="text-cyan-400/70 text-xs">· {selectedCam.location}</Text>
        </View>

        {selectedCam.status === 'online' && (
          <View className="bg-red-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30 flex-row items-center gap-1.5 shadow-lg">
            <CircleDot size={12} color="#f87171" />
            <Text className="text-red-400 text-xs font-bold">REC</Text>
          </View>
        )}
      </View>

      {/* Nút nổi ở đáy Camera */}
      {selectedCam.status === 'online' && (
        <View className="absolute bottom-5 self-center bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-cyan-500/30 shadow-lg flex-row items-center gap-2">
          <Text className="text-cyan-400 font-semibold text-sm">Độ khô hiện tại: {selectedCam.progress}%</Text>
          <ChevronRight size={16} color="#22d3ee" />
        </View>
      )}
      
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
        className="flex-1 bg-[#0f172a]" 
        contentContainerStyle={{ padding: isTablet ? 32 : 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View className="flex-row items-center justify-between mb-4 mt-2">
          <View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={() => router.back()} className="mr-2 p-1 bg-slate-800 rounded-full">
                 <ChevronLeft size={24} color="#f8fafc" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-extrabold tracking-tight">Camera AI</Text>
            </View>
            <Text className="text-cyan-500/80 text-xs font-bold uppercase tracking-widest mt-1">XƯỞNG PHƠI MỸ LỒNG</Text>
          </View>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => setIsNotificationModalOpen(true)}
              className="p-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-sm relative"
            >
              <Bell size={20} color="#e2e8f0" />
              <View className="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-800" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 🚀 ================= THANH CHỌN CAMERA THÊM MỚI Ở ĐÂY ================= */}
        <View className="mb-6 -mx-5 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {MOCK_CAMERAS.map(cam => (
              <TouchableOpacity
                key={cam.id}
                onPress={() => handleSelectCamera(cam)}
                className={`mr-3 p-3 rounded-[20px] border flex-row items-center gap-3 shadow-sm ${
                  selectedCam.id === cam.id
                    ? 'bg-cyan-500/10 border-cyan-500/40'
                    : 'bg-[#1e293b] border-slate-700/50'
                }`}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${selectedCam.id === cam.id ? 'bg-cyan-500/20' : 'bg-slate-800/80'}`}>
                  <Camera size={18} color={selectedCam.id === cam.id ? '#22d3ee' : '#94a3b8'} />
                </View>
                <View className="pr-3">
                  <Text className={`font-bold text-sm ${selectedCam.id === cam.id ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {cam.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MapPin size={10} color={selectedCam.id === cam.id ? '#67e8f9' : '#64748b'} />
                    <Text className={`text-[10px] ${selectedCam.id === cam.id ? 'text-cyan-200/70' : 'text-slate-500'}`}>
                      {cam.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* ====================================================================== */}

        <View className={isTablet ? 'flex-row gap-8' : 'flex-col gap-6'}>
          {/* ================= PHẦN TRÁI: CAMERA ================= */}
          <View className={isTablet ? 'flex-[2]' : 'w-full'}>
            <View className="w-full aspect-[4/3] bg-[#1e293b] rounded-[32px] border border-slate-700/50 overflow-hidden relative shadow-lg shadow-black/50">
              {renderCameraContent(false)}
            </View>
          </View>

          {/* ================= PHẦN PHẢI: CHỈ SỐ ================= */}
          <View className={isTablet ? 'flex-[1]' : 'w-full'}>
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-white text-xl font-bold">Thông số khu vực</Text>
              <Text className="text-cyan-400 text-sm font-bold">{selectedCam.location}</Text>
            </View>
            
            <View className="flex-row flex-wrap gap-4 mb-4">
              <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-slate-300 font-bold text-base">Nhiệt độ</Text>
                  <View className={`p-1.5 rounded-lg ${selectedCam.status === 'online' ? 'bg-orange-500/20' : 'bg-slate-700/50'}`}>
                    <Thermometer size={16} color={selectedCam.status === 'online' ? '#f97316' : '#64748b'} />
                  </View>
                </View>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">MỨC HIỆN TẠI</Text>
                <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-orange-500 shadow-orange-500/20' : 'text-slate-500'}`}>
                  {selectedCam.temp}{selectedCam.temp !== '--' ? '°C' : ''}
                </Text>
              </View>

              <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-slate-300 font-bold text-base">Độ ẩm</Text>
                  <View className={`p-1.5 rounded-lg ${selectedCam.status === 'online' ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                    <Droplets size={16} color={selectedCam.status === 'online' ? '#06b6d4' : '#64748b'} />
                  </View>
                </View>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">HIỆN TẠI</Text>
                <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-cyan-400 shadow-cyan-400/20' : 'text-slate-500'}`}>
                  {selectedCam.hum}{selectedCam.hum !== '--' ? '%' : ''}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 mb-4 px-1">
              <Text className="text-white text-xl font-bold">Tiến độ phơi</Text>
              <Text className="text-cyan-400 font-medium text-sm">Chi tiết <ChevronRight size={14} color="#22d3ee" className="inline" /></Text>
            </View>

            <View className="bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg w-full">
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-slate-400 text-sm font-medium mb-1">Dự kiến hoàn thành</Text>
                  <Text className="text-white text-3xl font-extrabold tracking-tight">{selectedCam.timeEst}</Text>
                </View>
                <View className={`p-3 rounded-2xl border ${selectedCam.status === 'online' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <Clock size={24} color={selectedCam.status === 'online' ? '#818cf8' : '#64748b'} />
                </View>
              </View>

              <View className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3 border border-slate-700/50">
                <View 
                  className={`h-full rounded-full ${selectedCam.status === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} 
                  style={{ width: `${selectedCam.progress}%` }} 
                />
              </View>
              <View className="flex-row justify-between items-center">
                <Text className={`font-bold text-sm ${selectedCam.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {selectedCam.progress}% Khô
                </Text>
                <Text className="text-slate-500 font-medium text-xs">
                  Còn {selectedCam.timeLeft}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= MODAL LỊCH SỬ & CẢNH BÁO ================= */}
      <Modal visible={isNotificationModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsNotificationModalOpen(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#1e293b] h-[80%] rounded-t-3xl border-t border-slate-700 p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Lịch sử & Cảnh báo</Text>
              <TouchableOpacity onPress={() => setIsNotificationModalOpen(false)} className="w-8 h-8 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="bg-rose-900/20 border border-rose-500/30 p-4 rounded-2xl mb-6 shadow-sm">
                <View className="flex-row items-center gap-2 mb-2">
                  <CloudRain size={20} color="#fb7185" />
                  <Text className="text-rose-400 font-bold text-lg">Cảnh báo mưa (Cao)</Text>
                </View>
                <Text className="text-slate-300 text-sm mb-3">Khả năng mưa 79% - Khung giờ 14:00 - 16:00</Text>
                <View className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex-row gap-2">
                  <AlertTriangle size={16} color="#fb7185" className="mt-0.5" />
                  <Text className="text-rose-300 text-xs flex-1 leading-5">Khuyến nghị: Chuẩn bị thu bánh nếu tình hình xấu đi.</Text>
                </View>
              </View>

              <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Lịch sử mẻ bánh</Text>

              <View className="pl-3">
                {trackingHistory.map((item, index) => {
                  let Icon = Info;
                  let colorClass = 'text-blue-400';
                  let bgClass = 'bg-blue-500/10 border-blue-500/20';

                  if (item.type === 'success') {
                    Icon = CheckCircle; colorClass = 'text-emerald-400'; bgClass = 'bg-emerald-500/10 border-emerald-500/20';
                  } else if (item.type === 'warning') {
                    Icon = AlertTriangle; colorClass = 'text-amber-400'; bgClass = 'bg-amber-500/10 border-amber-500/20';
                  }

                  return (
                    <View key={item.id} className="relative pl-6 pb-6 border-l border-slate-700 last:border-0 last:pb-0">
                      <View className="absolute -left-[9px] top-0 bg-[#1e293b] p-0.5">
                        <View className={`w-4 h-4 rounded-full border-2 ${item.type === 'success' ? 'border-emerald-500 bg-emerald-900' : item.type === 'warning' ? 'border-amber-500 bg-amber-900' : 'border-blue-500 bg-blue-900'}`} />
                      </View>
                      <View className={`p-4 rounded-2xl border ${bgClass} ml-2 shadow-sm`}>
                        <View className="flex-row items-center gap-2 mb-1.5">
                          <Icon size={14} color={item.type === 'success' ? '#34d399' : item.type === 'warning' ? '#fbbf24' : '#60a5fa'} />
                          <Text className={`${colorClass} font-bold text-xs`}>{item.time}</Text>
                        </View>
                        <Text className="text-slate-300 text-sm leading-5">{item.message}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL FULLSCREEN CAMERA ================= */}
      <Modal visible={isFullscreen} animationType="fade" transparent={false} onRequestClose={() => setIsFullscreen(false)}>
        <SafeAreaView className="flex-1 bg-black">
          <View className="absolute top-12 left-0 right-0 z-50 flex-row justify-between items-start px-6 pointer-events-box-none">
            <View className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 flex-row items-center gap-2 mt-2">
              <View className={`w-2.5 h-2.5 rounded-full ${selectedCam.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <Text className="text-white text-sm font-bold tracking-wider">{selectedCam.status === 'online' ? 'LIVE' : 'OFFLINE'}</Text>
            </View>

            <TouchableOpacity onPress={() => setIsFullscreen(false)} className="bg-slate-900/80 backdrop-blur-md p-3 px-4 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg">
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