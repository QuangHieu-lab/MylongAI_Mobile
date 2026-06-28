import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, useWindowDimensions, TouchableOpacity,
  Modal, SafeAreaView, RefreshControl, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Thermometer, Droplets, Clock, CircleDot, Maximize, 
  Minimize, ChevronRight, Bell, X, CheckCircle, 
  Info, AlertTriangle, CloudRain, ChevronLeft,
  Camera, WifiOff, MapPin, Plus, Link, Loader2
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import DataWrapper from '@/src/components/ui/DataWrapper'; 

// =========================================================================
// 🚀 CẤU HÌNH API
// =========================================================================
const WEATHER_API_URL = process.env.EXPO_PUBLIC_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';
const STORAGE_KEY_CAMERAS = process.env.EXPO_PUBLIC_STORAGE_KEY_CAMERAS || '@saved_cameras_v1';

const INITIAL_HISTORY = [
  { id: '1', time: '13:00', message: 'Mẻ bánh bắt đầu - AI Vision phát hiện bánh tráng', type: 'success' },
];

const MOCK_CAMERAS = [
  { id: 'cam1', name: 'Camera Góc Trái', location: 'Sân phơi Khu A', status: 'online', streamUrl: '' },
  { id: 'cam2', name: 'Camera Toàn Cảnh', location: 'Khu sấy nhiệt', status: 'online', streamUrl: '' },
];

export default function CameraMonitoringScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  const [cameras, setCameras] = useState(MOCK_CAMERAS);
  const [selectedCam, setSelectedCam] = useState(cameras[0]);

  const [isAddCamModalOpen, setIsAddCamModalOpen] = useState(false);
  const [newCamData, setNewCamData] = useState({ name: '', location: '', ip: '' });

  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [logs, setLogs] = useState(INITIAL_HISTORY);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // 🧠 ĐỒNG BỘ CÔNG THỨC DỰ ĐOÁN THỜI GIAN KHÔ (Từ Web sang Mobile)
  // =========================================================================
  const [batchStartTime] = useState<Date>(new Date(Date.now() - 3 * 60 * 60 * 1000)); // Giả lập đã phơi 3 tiếng

  const baseTime = 720; 
  const tempFactor = 35 / Math.max(weatherData.temp, 10); 
  const humFactor = Math.max(weatherData.hum, 10) / 60;   
  
  const totalPredictedMinutes = Math.round(baseTime * tempFactor * humFactor);
  const elapsedMinutes = Math.floor((Date.now() - batchStartTime.getTime()) / 60000);
  
  const calculatedDryness = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalPredictedMinutes) * 100)));
  const estimatedCompletion = new Date(batchStartTime.getTime() + totalPredictedMinutes * 60000);
  const minutesLeft = Math.max(0, totalPredictedMinutes - elapsedMinutes);

  const loadSavedCameras = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY_CAMERAS);
      if (savedData) {
        const parsedCameras = JSON.parse(savedData);
        if (parsedCameras.length > 0) {
          setCameras(parsedCameras);
          setSelectedCam(parsedCameras[0]);
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc Camera từ AsyncStorage:", e);
    }
  };

  const fetchRealtimeData = async () => {
    if (selectedCam.status === 'offline') return;
    setIsUsingMockData(false); 

    try {
      let currentTemp = 35.0; 
      let currentHum = 60.0;  
      let rainLabel = '';
      let isRaining = false;

      try {
        const weatherRes = await fetch(`${WEATHER_API_URL}/weather/analyze`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (weatherRes.ok) {
          const weatherJson = await weatherRes.json();
          currentTemp = weatherJson.sensor_data?.temperature_c || weatherJson.api_weather?.temperature_c || 35.0;
          currentHum = weatherJson.sensor_data?.humidity_percent || weatherJson.api_weather?.humidity_percent || 60;
          rainLabel = weatherJson.prediction?.rain_label || '';
          isRaining = weatherJson.prediction?.currently_raining || false;
        } else {
          setIsUsingMockData(true);
        }
      } catch (weatherErr) {
        setIsUsingMockData(true);
      }

      setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
    } catch (error) {
      console.error("Lỗi đồng bộ Dữ liệu:", error);
    }
  };

  const initialLoad = async () => {
    setError(null);
    try {
      await loadSavedCameras(); 
      await new Promise(resolve => setTimeout(resolve, 500)); 
      await fetchRealtimeData(); 
    } catch (err: any) {
      setError(err.message || "Lỗi khởi tạo hệ thống.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    initialLoad();
    const interval = setInterval(fetchRealtimeData, 300000); 
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRealtimeData().then(() => setIsRefreshing(false));
  };

  const handleSelectCamera = (cam: any) => {
    setSelectedCam(cam);
    if (cam.status === 'offline') {
      Toast.show({ type: 'error', text1: `🚫 Mất kết nối`, text2: `Không thể kết nối tới ${cam.name}`, position: 'top' });
    } else {
      Toast.show({ type: 'success', text1: `✅ Chuyển luồng thành công`, text2: `Đang giám sát tại ${cam.location}.`, position: 'top' });
      fetchRealtimeData(); 
    }
  };

  const handleConnectCamera = async () => {
    if (!newCamData.name || !newCamData.ip) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên và IP Camera!', position: 'top' });
      return;
    }
    
    const newCamera = {
      id: `cam_${Date.now()}`,
      name: newCamData.name,
      location: newCamData.location || 'Khu vực mới',
      status: 'online', 
      streamUrl: newCamData.ip 
    };

    const updatedCameras = [...cameras, newCamera];
    
    setCameras(updatedCameras);
    setSelectedCam(newCamera);
    setIsAddCamModalOpen(false);
    setNewCamData({ name: '', location: '', ip: '' }); 

    try {
      await AsyncStorage.setItem(STORAGE_KEY_CAMERAS, JSON.stringify(updatedCameras));
      Toast.show({ type: 'success', text1: 'Đã lưu Camera', text2: 'Camera này sẽ được giữ lại ở lần mở app sau!', position: 'top' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi bộ nhớ', text2: 'Không thể lưu camera vĩnh viễn.', position: 'top' });
    }
  };

  let displayTimeLeft = '--';
  let displayTimeEst = '--:--';

  if (selectedCam.status === 'online') {
    if (minutesLeft === 0) {
      displayTimeLeft = 'Đã hoàn thành!';
      displayTimeEst = estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      const h = Math.floor(minutesLeft / 60);
      const m = minutesLeft % 60;
      displayTimeLeft = h > 0 ? `${h}h ${m}p` : `${m}p`;
      displayTimeEst = estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  }

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
          <Text className="text-cyan-400 font-semibold text-sm">Độ khô: {calculatedDryness}%</Text>
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
            {weatherData.rainLabel ? <View className="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-800" /> : null}
          </TouchableOpacity>
        </View>

        <DataWrapper isLoading={isLoading} error={error} onRetry={initialLoad} loadingMessage="Đang kết nối đến hệ thống CCTV AI...">

          {weatherData.rainLabel ? (
             <View className={`p-4 rounded-xl border flex-row items-center gap-3 mb-4 ${
               weatherData.isRaining || weatherData.rainLabel.includes('cao')
                 ? 'bg-rose-500/10 border-rose-500/30' 
                 : 'bg-blue-500/10 border-blue-500/30'
             }`}>
               <CloudRain size={24} color={weatherData.isRaining || weatherData.rainLabel.includes('cao') ? '#f43f5e' : '#3b82f6'} />
               <View className="flex-1">
                 <Text className={`font-bold ${weatherData.isRaining || weatherData.rainLabel.includes('cao') ? 'text-rose-400' : 'text-blue-400'}`}>Cảnh báo thời tiết</Text>
                 <Text className="text-slate-300 text-xs mt-0.5 leading-4 pr-2">{weatherData.rainLabel}</Text>
               </View>
             </View>
          ) : null}

          {isUsingMockData && (
             <View className="mb-4 bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex-row items-center justify-between">
               <Text className="text-orange-400 text-xs font-medium">⚠️ Đang sử dụng dữ liệu dự phòng (API Offline)</Text>
             </View>
          )}

          <View className="mb-6 -mx-5 px-5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {cameras.map(cam => (
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

              <TouchableOpacity
                onPress={() => setIsAddCamModalOpen(true)}
                className="mr-5 p-3 rounded-[20px] border border-dashed border-slate-600 bg-slate-800/30 flex-row items-center justify-center min-w-[140px] shadow-sm"
              >
                <Plus size={20} color="#94a3b8" />
                <Text className="text-slate-400 font-bold ml-2 text-sm">Thêm Camera</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View className={isTablet ? 'flex-row gap-8' : 'flex-col gap-6'}>
            <View className={isTablet ? 'flex-[2]' : 'w-full'}>
              <View className="w-full aspect-[4/3] bg-[#1e293b] rounded-[32px] border border-slate-700/50 overflow-hidden relative shadow-lg shadow-black/50">
                {renderCameraContent(false)}
              </View>
            </View>

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
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">CẢM BIẾN THỰC</Text>
                  <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-orange-500' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? weatherData.temp.toFixed(1) : '--'}°C
                  </Text>
                </View>

                <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-slate-300 font-bold text-base">Độ ẩm</Text>
                    <View className={`p-1.5 rounded-lg ${selectedCam.status === 'online' ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                      <Droplets size={16} color={selectedCam.status === 'online' ? '#06b6d4' : '#64748b'} />
                    </View>
                  </View>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">CẢM BIẾN THỰC</Text>
                  <Text className={`text-3xl font-extrabold ${selectedCam.status === 'online' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? weatherData.hum.toFixed(1) : '--'}%
                  </Text>
                </View>
              </View>

              <View className="bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg w-full mt-2">
                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-slate-400 text-sm font-medium mb-1">Dự kiến hoàn thành</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-3xl font-extrabold tracking-tight">{displayTimeEst}</Text>
                    </View>
                  </View>
                  <View className={`p-3 rounded-2xl border ${selectedCam.status === 'online' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <Clock size={24} color={selectedCam.status === 'online' ? '#818cf8' : '#64748b'} />
                  </View>
                </View>

                <View className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3 border border-slate-700/50">
                  <View 
                    className={`h-full rounded-full transition-all duration-1000 ${selectedCam.status === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} 
                    style={{ width: `${selectedCam.status === 'online' ? calculatedDryness : 0}%` }} 
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className={`font-bold text-sm ${selectedCam.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedCam.status === 'online' ? calculatedDryness : 0}% Khô
                  </Text>
                  <Text className="text-slate-500 font-medium text-xs">
                    {minutesLeft > 0 ? `Còn ${displayTimeLeft}` : 'Hoàn thành'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </DataWrapper>
      </ScrollView>

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
              <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Lịch sử mẻ bánh</Text>
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

      <Modal visible={isAddCamModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsAddCamModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center items-center bg-black/70 px-6">
          <View className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Thêm Camera Mới</Text>
              <TouchableOpacity onPress={() => setIsAddCamModalOpen(false)} className="p-2 bg-slate-800 rounded-full">
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1">TÊN CAMERA</Text>
              <TextInput 
                className="bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 focus:border-cyan-500"
                placeholder="VD: Sân Phơi Khu B"
                placeholderTextColor="#64748b"
                value={newCamData.name}
                onChangeText={(text) => setNewCamData({...newCamData, name: text})}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1">VỊ TRÍ / KHU VỰC</Text>
              <TextInput 
                className="bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 focus:border-cyan-500"
                placeholder="VD: Khu lưu trữ"
                placeholderTextColor="#64748b"
                value={newCamData.location}
                onChangeText={(text) => setNewCamData({...newCamData, location: text})}
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1">ĐỊA CHỈ IP / RTSP STREAM URL</Text>
              <View className="flex-row items-center bg-slate-800 rounded-2xl border border-slate-700 focus:border-cyan-500 px-4">
                <Link size={18} color="#64748b" />
                <TextInput 
                  className="flex-1 text-white p-4 ml-2"
                  placeholder="rtsp://192.168.1.10/stream"
                  placeholderTextColor="#64748b"
                  keyboardType="url"
                  autoCapitalize="none"
                  value={newCamData.ip}
                  onChangeText={(text) => setNewCamData({...newCamData, ip: text})}
                />
              </View>
            </View>

            <TouchableOpacity onPress={handleConnectCamera} className="bg-cyan-600 p-4 rounded-full items-center justify-center shadow-lg shadow-cyan-900">
              <Text className="text-white font-bold text-base tracking-wide">Kết nối Camera</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </>
  );
}