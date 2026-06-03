import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, useWindowDimensions, TouchableOpacity,
  Modal, SafeAreaView, RefreshControl 
} from 'react-native';
import { 
  Thermometer, Droplets, Clock, CircleDot, Maximize, 
  Minimize, ChevronRight, Bell, X, CheckCircle, 
  Info, AlertTriangle, CloudRain, ChevronLeft,
  Camera, WifiOff, MapPin 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

// 🚀 IMPORT DATA WRAPPER VÀ HOOK WEATHER
import DataWrapper from '@/src/components/ui/DataWrapper'; 
import { useWeather } from '@/src/hooks/useWeather'; 

// ================= DỮ LIỆU MOCK =================
const INITIAL_HISTORY = [
  { id: '1', time: '13:00', message: 'Mẻ bánh bắt đầu - AI Vision phát hiện bánh tráng', type: 'success' },
];

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
  const [selectedCam, setSelectedCam] = useState(MOCK_CAMERAS[0]);

  // ================= TÍCH HỢP AI TÍNH TOÁN ĐỘ KHÔ =================
  const { currentWeather } = useWeather();
  const [dynamicDryness, setDynamicDryness] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [predictedTimeLeft, setPredictedTimeLeft] = useState<number | null>(null);
  const [logs, setLogs] = useState(INITIAL_HISTORY);

  // ================= STATE TẢI DỮ LIỆU =================
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Giả lập Fetch CCTV
  const fetchCameraData = async () => {
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSelectedCam(MOCK_CAMERAS[0]);
    } catch (err: any) {
      setError(err.message || "Lỗi tải luồng Video AI.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCameraData();
  }, []);

  // 🚀 LOGIC AI: Cập nhật tiến độ khô và ETA theo thời gian thực
  useEffect(() => {
    if (selectedCam.status === 'offline') return;

    const timer = setInterval(() => {
      setElapsedMinutes(prev => prev + 1);

      setDynamicDryness(prevDryness => {
        if (prevDryness >= 100) {
          setPredictedTimeLeft(0);
          return 100;
        }

        // Nếu trời đang mưa -> Tạm dừng bốc hơi nước
        if (currentWeather?.isRaining) {
          setPredictedTimeLeft(null);
          return prevDryness;
        }

        // Tốc độ phơi (Nội suy từ Nhiệt độ, Độ ẩm, Gió)
        const temp = currentWeather?.temperature || 35;
        const humid = currentWeather?.humidity || 50;
        const wind = currentWeather?.windSpeed || 2;

        const baseRate = 100 / 240; 
        const currentRatePerMinute = baseRate * (temp / 35) * (50 / humid) * (1 + (wind * 0.05));
        
        // Cập nhật ETA (Dự báo thời gian còn lại)
        const remainingDryness = 100 - (prevDryness + currentRatePerMinute);
        const minutesLeft = Math.max(0, Math.ceil(remainingDryness / currentRatePerMinute));
        setPredictedTimeLeft(minutesLeft);

        return Math.min(100, prevDryness + currentRatePerMinute);
      });
    }, 1000); // Đặt 1000ms = 1 phút để dễ test UI

    return () => clearInterval(timer);
  }, [currentWeather, selectedCam.status]);

  // 🚀 LOGIC AI: Ghi nhật ký tự động
  useEffect(() => {
    const drynessInt = Math.floor(dynamicDryness);
    if (drynessInt > 0 && drynessInt % 25 === 0) {
      const lastLog = logs[0];
      if (lastLog && lastLog.message.includes(`${drynessInt}%`)) return; // Tránh trùng lặp

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      let message = "";
      let type = "info";

      if (drynessInt >= 100) {
        message = `Độ khô đạt 100% - Yêu cầu thu hoạch ngay!`;
        type = "success";
      } else if (currentWeather?.humidity && currentWeather.humidity > 70) {
        message = `Độ khô đạt ${drynessInt}% - Tiến độ chậm do ẩm cao.`;
        type = "warning";
      } else {
        message = `Độ khô đạt ${drynessInt}% - Tiến độ rất tốt.`;
        type = "info";
      }

      setLogs((prev) => [{ id: Math.random().toString(), time: timeStr, message, type }, ...prev]);
    }
  }, [dynamicDryness]);


  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCameraData();
  };

  const handleSelectCamera = (cam: typeof MOCK_CAMERAS[0]) => {
    setSelectedCam(cam);
    if (cam.status === 'offline') {
      Toast.show({ type: 'error', text1: `🚫 Mất kết nối`, text2: `Không thể kết nối tới ${cam.name}`, position: 'top' });
    } else {
      Toast.show({ type: 'success', text1: `✅ Chuyển luồng thành công`, text2: `Đang giám sát tại ${cam.location}.`, position: 'top' });
    }
  };

  // 🚀 Tính toán chuỗi hiển thị Thời gian dựa trên AI
  let displayTimeLeft = '--';
  let displayTimeEst = '--:--';

  if (selectedCam.status === 'online') {
    if (predictedTimeLeft === null) {
      displayTimeLeft = 'Đang dừng';
      displayTimeEst = 'Chưa xác định';
    } else if (predictedTimeLeft === 0) {
      displayTimeLeft = 'Hoàn tất';
      displayTimeEst = 'Bây giờ';
    } else {
      const h = Math.floor(predictedTimeLeft / 60);
      const m = predictedTimeLeft % 60;
      displayTimeLeft = h > 0 ? `${h}h ${m}p` : `${m}p`;

      // Giả lập thời gian hoàn thành (Hiện tại + số phút)
      const estDate = new Date(Date.now() + predictedTimeLeft * 60000); // 60000 = 1 min in real time, adjust if test interval is 1000
      displayTimeEst = `${estDate.getHours().toString().padStart(2, '0')}:${estDate.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  // ================= TÁCH GIAO DIỆN VIDEO CAMERA =================
  const renderCameraContent = (isFull: boolean) => (
    <>
      <View className="absolute inset-0 items-center justify-center opacity-20 bg-slate-900">
        {selectedCam.status === 'online' ? (
          <View className="w-3/4 h-3/4 border border-cyan-500/50 rounded-[40px] scale-y-50" />
        ) : (
          <View className="items-center justify-center opacity-50">
            <WifiOff size={60} color="#94a3b8" />
          </View>
        )}
      </View>

      <View className="absolute top-4 left-4 right-4 flex-row justify-between pointer-events-none">
        <View className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg">
          <View className={`w-2 h-2 rounded-full ${selectedCam.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
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

      {selectedCam.status === 'online' && (
        <View className="absolute bottom-5 self-center bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-cyan-500/30 shadow-lg flex-row items-center gap-2">
          <Text className="text-cyan-400 font-semibold text-sm">Độ khô hiện tại: {dynamicDryness.toFixed(1)}%</Text>
          <ChevronRight size={16} color="#22d3ee" />
        </View>
      )}
      
      {!isFull && (
        <TouchableOpacity onPress={() => setIsFullscreen(true)} className="absolute bottom-5 right-4 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-full border border-slate-700 shadow-lg">
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#22d3ee" colors={['#22d3ee']} />}
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
          
          <TouchableOpacity onPress={() => setIsNotificationModalOpen(true)} className="p-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-sm relative">
            <Bell size={20} color="#e2e8f0" />
            <View className="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-800" />
          </TouchableOpacity>
        </View>

        {/* 🚀 DATA WRAPPER */}
        <DataWrapper 
          isLoading={isLoading} 
          error={error} 
          onRetry={fetchCameraData}
          loadingMessage="Đang kết nối đến hệ thống CCTV AI..."
        >
          {/* Thanh Chọn Camera */}
          <View className="mb-6 -mx-5 px-5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {MOCK_CAMERAS.map(cam => (
                <TouchableOpacity
                  key={cam.id}
                  onPress={() => handleSelectCamera(cam)}
                  className={`mr-3 p-3 rounded-[20px] border flex-row items-center gap-3 shadow-sm ${
                    selectedCam.id === cam.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-[#1e293b] border-slate-700/50'
                  }`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${selectedCam.id === cam.id ? 'bg-cyan-500/20' : 'bg-slate-800/80'}`}>
                    <Camera size={18} color={selectedCam.id === cam.id ? '#22d3ee' : '#94a3b8'} />
                  </View>
                  <View className="pr-3">
                    <Text className={`font-bold text-sm ${selectedCam.id === cam.id ? 'text-cyan-400' : 'text-slate-300'}`}>{cam.name}</Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <MapPin size={10} color={selectedCam.id === cam.id ? '#67e8f9' : '#64748b'} />
                      <Text className={`text-[10px] ${selectedCam.id === cam.id ? 'text-cyan-200/70' : 'text-slate-500'}`}>{cam.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className={isTablet ? 'flex-row gap-8' : 'flex-col gap-6'}>
            {/* Phần Trái: Camera Video */}
            <View className={isTablet ? 'flex-[2]' : 'w-full'}>
              <View className="w-full aspect-[4/3] bg-[#1e293b] rounded-[32px] border border-slate-700/50 overflow-hidden relative shadow-lg shadow-black/50">
                {renderCameraContent(false)}
              </View>
            </View>

            {/* Phần Phải: Chỉ số IoT Tích hợp Dữ liệu Thời Tiết */}
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
                  <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-orange-500' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? (currentWeather?.temperature || selectedCam.temp) : '--'}
                    {selectedCam.status === 'online' && '°C'}
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
                  <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? (currentWeather?.humidity || selectedCam.hum) : '--'}
                    {selectedCam.status === 'online' && '%'}
                  </Text>
                </View>
              </View>

              <View className="bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg w-full mt-2">
                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-slate-400 text-sm font-medium mb-1">Dự kiến hoàn thành</Text>
                    <Text className="text-white text-3xl font-extrabold tracking-tight">{displayTimeEst}</Text>
                  </View>
                  <View className={`p-3 rounded-2xl border ${selectedCam.status === 'online' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <Clock size={24} color={selectedCam.status === 'online' ? '#818cf8' : '#64748b'} />
                  </View>
                </View>

                <View className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3 border border-slate-700/50">
                  <View 
                    className={`h-full rounded-full ${selectedCam.status === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} 
                    style={{ width: `${selectedCam.status === 'online' ? dynamicDryness : 0}%` }} 
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className={`font-bold text-sm ${selectedCam.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? dynamicDryness.toFixed(1) : 0}% Khô
                  </Text>
                  <Text className="text-slate-500 font-medium text-xs">Còn {displayTimeLeft}</Text>
                </View>
              </View>
            </View>
          </View>
        </DataWrapper>
      </ScrollView>

      {/* ================= MODAL LỊCH SỬ & CẢNH BÁO AI ================= */}
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
              
              {/* Box cảnh báo linh động theo Weather */}
              {currentWeather?.isRaining || (currentWeather?.rainChance ?? 0) > 60 ? (
                <View className="bg-rose-900/20 border border-rose-500/30 p-4 rounded-2xl mb-6 shadow-sm">
                  <View className="flex-row items-center gap-2 mb-2">
                    <CloudRain size={20} color="#fb7185" />
                    <Text className="text-rose-400 font-bold text-lg">Cảnh báo mưa (Nguy cơ Cao)</Text>
                  </View>
                  <Text className="text-slate-300 text-sm mb-3">Khả năng mưa {currentWeather?.rainChance}%. Nguy cơ ướt bánh.</Text>
                  <View className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex-row gap-2">
                    <AlertTriangle size={16} color="#fb7185" className="mt-0.5" />
                    <Text className="text-rose-300 text-xs flex-1 leading-5">Khuyến nghị: Yêu cầu thu hoạch bánh ngay lập tức!</Text>
                  </View>
                </View>
              ) : null}

              <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Lịch sử mẻ bánh (AI Log)</Text>

              <View className="pl-3">
                {logs.map((item) => {
                  let Icon = Info; let colorClass = 'text-blue-400'; let bgClass = 'bg-blue-500/10 border-blue-500/20';
                  if (item.type === 'success') { Icon = CheckCircle; colorClass = 'text-emerald-400'; bgClass = 'bg-emerald-500/10 border-emerald-500/20'; } 
                  else if (item.type === 'warning') { Icon = AlertTriangle; colorClass = 'text-amber-400'; bgClass = 'bg-amber-500/10 border-amber-500/20'; }

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