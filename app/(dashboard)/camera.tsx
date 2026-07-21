import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, useWindowDimensions, TouchableOpacity,
  Modal, SafeAreaView, RefreshControl, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Thermometer, Droplets, Clock, CircleDot, Maximize, 
  Minimize, ChevronRight, Bell, X, CheckCircle, 
  Info, AlertTriangle, CloudRain, ChevronLeft,
  Camera, WifiOff, MapPin, Plus, Link, Loader2, Scan, TrendingUp, XCircle
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { VideoView } from '@livekit/react-native';
import { RoomEvent } from 'livekit-client';

import DataWrapper from '@/src/components/ui/DataWrapper'; 
import { useYoloVision } from '@/src/hooks/useYoloVision';

import { cameraApi, sensorApi, detectionApi, predictionApi, weatherApi } from '@/src/services/api'; 

const INITIAL_HISTORY = [
  { id: '1', time: '13:00', message: 'Hệ thống AI Vision đã khởi động', type: 'success' },
];

const AI_URL = 'https://huntrot-mylongai-backed-modelai.hf.space';

export default function CameraMonitoringScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isPremium = true; 
  
  const { room, connectToLiveKit, disconnectLiveKit } = useYoloVision();
  const [videoTrack, setVideoTrack] = useState<any>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCam, setSelectedCam] = useState<any>(null);

  const [isAddCamModalOpen, setIsAddCamModalOpen] = useState(false);
  const [newCamData, setNewCamData] = useState({ name: '', location: '', ip: '' });

  const [weatherData, setWeatherData] = useState({ temp: 34.0, hum: 58.0, rainLabel: '', isRaining: false });
  const [predictionData, setPredictionData] = useState({ dryness: 0, minutesLeft: 0 });
  const [logs, setLogs] = useState(INITIAL_HISTORY);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚀 REF ĐỂ QUẢN LÝ VIỆC PUSH DATA LÊN SERVER (CHỐNG SPAM)
  const lastSavedDataRef = useRef({ temp: 0, hum: 0, minutesLeft: 0, time: 0 });

  // =========================================================================
  // 1️⃣ LẤY VIDEO TRACK TỪ LIVEKIT ROOM
  // =========================================================================
  useEffect(() => {
    if (!room) {
      setVideoTrack(null);
      return;
    }

    const updateTracks = () => {
      let foundTrack = null;
      room.remoteParticipants.forEach((participant) => {
        participant.videoTrackPublications.forEach((pub) => {
          if (pub.track) foundTrack = pub.track;
        });
      });
      setVideoTrack(foundTrack);
    };

    updateTracks(); 
    room.on(RoomEvent.TrackSubscribed, updateTracks);
    room.on(RoomEvent.TrackUnsubscribed, updateTracks);

    return () => {
      room.off(RoomEvent.TrackSubscribed, updateTracks);
      room.off(RoomEvent.TrackUnsubscribed, updateTracks);
    };
  }, [room]);

  // =========================================================================
  // 2️⃣ LOAD DANH SÁCH CAMERA TỪ BACKEND
  // =========================================================================
  const fetchCameras = async () => {
    try {
      const data: any = await cameraApi.getAll();
      const rawCameras = Array.isArray(data) ? data : (data?.data || []);
      
      const formattedCameras = rawCameras.map((c: any) => ({
        id: c.id || c._id,
        name: c.name || c.camera_name || 'Camera chưa đặt tên',
        location: c.location || 'Chưa cập nhật vị trí',
        status: c.status === 'offline' ? 'offline' : 'online',
        streamUrl: c.stream_url || c.streamUrl || '',
        hasDetection: false,
      }));
      
      setCameras(formattedCameras);
      
      if (formattedCameras.length > 0 && !selectedCam) {
        handleSelectCamera(formattedCameras[0]);
      }
    } catch (err: any) {
      setError("Không thể tải danh sách Camera từ máy chủ.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // =========================================================================
  // 3️⃣ XỬ LÝ KHI NGƯỜI DÙNG BẤM CHỌN CAMERA
  // =========================================================================
  const handleSelectCamera = async (cam: any) => {
    setSelectedCam(cam);
    disconnectLiveKit();
    
    if (cam.status === 'offline') {
      Toast.show({ type: 'error', text1: `🚫 Mất kết nối`, text2: `Camera ${cam.name} đang offline`, position: 'top' });
      return;
    }

    Toast.show({ type: 'info', text1: `🔄 Đang kết nối...`, text2: `Đang thiết lập luồng WebRTC`, position: 'top' });

    try {
      const SIGNALING_SERVER = 'https://camera-relay-v5.onrender.com';
      const CAMERA_ID = cam.id || 'workshop-laptop-camera';
      const ROOM_NAME = 'mylongai'; 

      const response = await fetch(`${SIGNALING_SERVER}/api/cameras/${CAMERA_ID}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: `mobile_viewer_${Math.random().toString(36).substring(7)}`,
          room_name: ROOM_NAME,
          is_publisher: false
        })
      });

      if (!response.ok) throw new Error('Lỗi lấy Token từ Signaling Server');

      const { token, server_url } = await response.json();
      await connectToLiveKit(server_url, token);

    } catch (error) {
      console.error("Lỗi khi chuyển camera:", error);
      Toast.show({ type: 'error', text1: 'Lỗi LiveKit', text2: 'Không thể thiết lập luồng kết nối.', position: 'top' });
    }
  };

  const handleConnectCamera = async () => {
    if (!newCamData.name || !newCamData.ip) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên và IP Camera!', position: 'top' });
      return;
    }
    try {
      await cameraApi.create({
        name: newCamData.name, location: newCamData.location || 'Khu vực mới', stream_url: newCamData.ip, status: 'online'
      });
      Toast.show({ type: 'success', text1: 'Đã lưu Camera', text2: 'Camera đã được thêm vào hệ thống!', position: 'top' });
      setIsAddCamModalOpen(false);
      setNewCamData({ name: '', location: '', ip: '' }); 
      fetchCameras(); 
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi máy chủ', text2: 'Không thể thêm camera lúc này.', position: 'top' });
    }
  };

  // =========================================================================
  // 4️⃣ QUÉT CẢNH BÁO TỔNG (10s/lần) CHO CÁC CAMERA KHÁC
  // =========================================================================
  useEffect(() => {
    if (cameras.length === 0) return;
    let isMounted = true;
    const checkDetectionsReal = async () => {
      const updatedPromises = cameras.map(async (cam) => {
        try {
          const res: any = await detectionApi.getLatest(cam.id);
          const data = res?.data || res;
          const hasDet = data?.has_detection || (data?.objects && data.objects.length > 0) || (data?.detected_count > 0) || false;
          return { ...cam, hasDetection: hasDet };
        } catch (e) {
          return { ...cam, hasDetection: false };
        }
      });
      const resolvedCameras = await Promise.all(updatedPromises);
      if (isMounted) setCameras(resolvedCameras);
    };
    checkDetectionsReal();
    const intervalId = setInterval(checkDetectionsReal, 10000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [cameras.length]);

  // =========================================================================
  // 5️⃣ ĐỒNG BỘ AI METRICS CHO CAMERA ĐANG XEM (5s/lần) - Y HỆT WEB 100%
  // =========================================================================
  useEffect(() => {
    if (!selectedCam || selectedCam.status === 'offline') return;
    let isMounted = true;

    const fetchRealtimeData = async () => {
      try {
        let currentTemp = 0;
        let currentHum = 0;
        let rainLabel = '';
        let isRaining = false;
        
        let realDryness = 0;
        let realMinutesLeft = 0;

        // Ưu tiên 1: Lấy API Thời tiết
        try {
          const weatherRes: any = await weatherApi.analyze();
          const data = weatherRes?.data || weatherRes;
          if (data) {
            currentTemp = data.sensor_data?.temperature_c || data.api_weather?.temperature_c || 34.0;
            currentHum = data.sensor_data?.humidity_percent || data.api_weather?.humidity_percent || 58.0;
            if (isPremium && data.prediction) {
              rainLabel = data.prediction.rain_label || '';
              isRaining = data.prediction.currently_raining || false;
            }
          }
        } catch (e) {}

        // Ưu tiên 2: Ghi đè bằng Cảm biến thực tế
        try {
          const sensorRes: any = await sensorApi.getLatest(selectedCam.id);
          const sData = sensorRes?.data || sensorRes;
          if (sData && sData.temperature !== undefined) {
            currentTemp = sData.temperature;
            currentHum = sData.humidity;
          }
        } catch (e) {}

        const storageKey = `real_start_time_yolo_${selectedCam.id}`;
        const maxDrynessKey = `max_dryness_yolo_${selectedCam.id}`;
        
        let savedStartTime = await AsyncStorage.getItem(storageKey);
        // Lấy hasDetection từ danh sách camera đã quét ở trên
        const activeCamDetail = cameras.find(c => c.id === selectedCam.id);
        const hasDetection = activeCamDetail?.hasDetection || false;

        const isDryingActive = hasDetection || savedStartTime !== null;

        if (isDryingActive && isPremium) {
          let predictedMinutesFromAI = 120; 
          const calcTemp = currentTemp > 0 ? currentTemp : 34.0;
          const calcHum = currentHum > 0 ? currentHum : 58.0;

          try {
            const aiResponse = await fetch(`${AI_URL}/drying/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avg_temperature: calcTemp, avg_humidity: calcHum })
            });
            
            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.predicted_drying_time) {
                predictedMinutesFromAI = aiData.predicted_drying_time;
              }
            }
          } catch (aiError) {
            predictedMinutesFromAI = 120 - ((calcTemp - 30) * 5) + ((calcHum - 60) * 2);
            predictedMinutesFromAI = Math.max(60, Math.min(predictedMinutesFromAI, 1440)); 
          }

          if (!savedStartTime && hasDetection) {
            savedStartTime = Date.now().toString();
            await AsyncStorage.setItem(storageKey, savedStartTime);
          }

          if (savedStartTime) {
            const elapsedMins = (Date.now() - parseInt(savedStartTime, 10)) / 60000;
            realMinutesLeft = Math.max(0, predictedMinutesFromAI - elapsedMins); 
            
            let calculatedDryness = 100 - ((realMinutesLeft / predictedMinutesFromAI) * 100);
            calculatedDryness = Math.min(100, Math.max(0, calculatedDryness));

            // 🚀 CHỐNG TỤT ĐỘ KHÔ
            let maxDryness = parseFloat((await AsyncStorage.getItem(maxDrynessKey)) || '0');
            if (calculatedDryness > maxDryness) {
              maxDryness = calculatedDryness;
              await AsyncStorage.setItem(maxDrynessKey, maxDryness.toString());
            }
            realDryness = maxDryness;

            if (realMinutesLeft <= 0) {
              await AsyncStorage.removeItem(storageKey);
              await AsyncStorage.removeItem(maxDrynessKey);
              realDryness = 100;
              realMinutesLeft = 0;
            }
          }
        } else {
          if (currentTemp === 0) currentTemp = 34.0;
          if (currentHum === 0) currentHum = 58.0;
        }

        if (isMounted) {
          setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
          setPredictionData({ dryness: realDryness, minutesLeft: realMinutesLeft });

          // PUSH DATA LÊN SERVER NẾU CÓ SỰ THAY ĐỔI
          if (currentTemp > 0 && currentHum > 0) {
            const now = Date.now();
            const lastData = lastSavedDataRef.current;
            
            const timePassed = now - lastData.time > 5000; 
            const tempChanged = Math.abs(currentTemp - lastData.temp) >= 0.5;
            const minsChanged = isDryingActive && Math.abs(realMinutesLeft - lastData.minutesLeft) >= 1;

            if (timePassed && (tempChanged || minsChanged)) {
              if (isDryingActive) {
                predictionApi.create({
                  camera_id: selectedCam.id,
                  temperature: currentTemp,
                  humidity: currentHum,
                  predicted_minutes: Math.round(realMinutesLeft)
                }).catch(() => {});
              } else {
                sensorApi.createEspData({
                  camera_id: selectedCam.id,
                  temperature: currentTemp,
                  humidity: currentHum
                }).catch(() => {});
              }
              lastSavedDataRef.current = { temp: currentTemp, hum: currentHum, minutesLeft: realMinutesLeft, time: now };
            }
          }
        }
      } catch (error) {}
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 5000); 
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCam, cameras]);

  useEffect(() => { fetchCameras(); }, []);
  const onRefresh = () => { setIsRefreshing(true); fetchCameras(); };

  // =========================================================================
  // 🚀 XÓA SẠCH DỮ LIỆU CHẠY NỀN KHI NHẤN NÚT HỦY (Y HỆT WEB)
  // =========================================================================
  const handleCancelBackgroundBatch = async () => {
    if (selectedCam?.id) {
      await AsyncStorage.removeItem(`real_start_time_yolo_${selectedCam.id}`);
      await AsyncStorage.removeItem(`max_dryness_yolo_${selectedCam.id}`);
      setPredictionData({ dryness: 0, minutesLeft: 0 });
      Toast.show({ type: 'info', text1: 'Đã hủy', text2: 'Tiến trình phơi nền đã được làm mới.', position: 'top' });
    }
  };

  // Tính toán thời gian UI
  const activeCamDetail = cameras.find(c => c.id === selectedCam?.id);
  const currentHasDetection = activeCamDetail?.hasDetection || false;
  const isDryingMode = currentHasDetection || predictionData.minutesLeft > 0;

  let displayTimeLeft = '--';
  let displayTimeEst = '--:--';
  if (selectedCam?.status === 'online' && isDryingMode) {
    const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);
    if (predictionData.minutesLeft === 0) {
      displayTimeLeft = 'Đã hoàn thành!';
      displayTimeEst = estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      const h = Math.floor(predictionData.minutesLeft / 60);
      const m = Math.round(predictionData.minutesLeft % 60);
      displayTimeLeft = h > 0 ? `${h}h ${m}p` : `${m}p`;
      displayTimeEst = estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // =========================================================================
  // 6️⃣ RENDER GIAO DIỆN
  // =========================================================================
  const renderCameraContent = (isFull: boolean) => (
    <>
      <View className="absolute inset-0 bg-slate-900 justify-center items-center">
        {selectedCam?.status === 'online' ? (
          videoTrack ? (
            <VideoView style={{ width: '100%', height: '100%' }} videoTrack={videoTrack} objectFit="contain" />
          ) : (
            <View className="items-center justify-center">
              <Loader2 size={40} color="#22d3ee" className="animate-spin" />
              <Text className="text-cyan-400 mt-2 font-bold">Đang tải luồng Video...</Text>
            </View>
          )
        ) : (
          <View className="items-center justify-center opacity-50">
            <WifiOff size={60} color="#94a3b8" />
            <Text className="text-slate-400 mt-2 font-bold">Camera Offline</Text>
          </View>
        )}
      </View>

      <View className="absolute top-4 left-4 right-4 flex-row justify-between pointer-events-none z-10">
        <View className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex-row items-center gap-2 shadow-lg">
          <View className={`w-2 h-2 rounded-full ${selectedCam?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <Text className="text-white text-xs font-bold">{selectedCam?.status === 'online' ? 'Online' : 'Offline'}</Text>
          <Text className="text-cyan-400/70 text-xs">· {selectedCam?.location}</Text>
        </View>
        
        {selectedCam?.status === 'online' && (
          <View className={`backdrop-blur-md px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 shadow-lg ${
            currentHasDetection ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-red-500/10 border-red-500/30'
          }`}>
            {currentHasDetection ? <Scan size={12} color="#22d3ee" /> : <CircleDot size={12} color="#f87171" />}
            <Text className={`text-xs font-bold ${currentHasDetection ? 'text-cyan-400' : 'text-red-400'}`}>
              {currentHasDetection ? `AI: Đang phơi` : 'REC'}
            </Text>
          </View>
        )}
      </View>

      {selectedCam?.status === 'online' && isDryingMode && (
        <View className="absolute bottom-5 self-center bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-cyan-500/30 shadow-lg flex-row items-center gap-2 z-10">
          <Text className="text-cyan-400 font-semibold text-sm">Độ khô: {Math.round(predictionData.dryness)}%</Text>
          <ChevronRight size={16} color="#22d3ee" />
        </View>
      )}
      
      {!isFull && selectedCam?.status === 'online' && (
        <TouchableOpacity onPress={() => setIsFullscreen(true)} className="absolute bottom-5 right-4 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-full border border-slate-700 shadow-lg z-10">
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

        <DataWrapper isLoading={isLoading} error={error} onRetry={fetchCameras} loadingMessage="Đang kết nối đến hệ thống CCTV AI...">

          {weatherData.rainLabel ? (
              <View className={`p-4 rounded-xl border flex-row items-center gap-3 mb-4 ${
                weatherData.isRaining || weatherData.rainLabel.includes('cao')
                  ? 'bg-rose-500/10 border-rose-500/30' : 'bg-blue-500/10 border-blue-500/30'
              }`}>
                <CloudRain size={24} color={weatherData.isRaining || weatherData.rainLabel.includes('cao') ? '#f43f5e' : '#3b82f6'} />
                <View className="flex-1">
                  <Text className={`font-bold ${weatherData.isRaining || weatherData.rainLabel.includes('cao') ? 'text-rose-400' : 'text-blue-400'}`}>Cảnh báo thời tiết</Text>
                  <Text className="text-slate-300 text-xs mt-0.5 leading-4 pr-2">{weatherData.rainLabel}</Text>
                </View>
              </View>
          ) : null}

          {/* DANH SÁCH CAMERA */}
          <View className="mb-6 -mx-5 px-5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {cameras.map(cam => (
                <TouchableOpacity
                  key={cam.id}
                  onPress={() => handleSelectCamera(cam)}
                  className={`mr-3 p-3 rounded-[20px] border flex-row items-center gap-3 shadow-sm ${
                    selectedCam?.id === cam.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-[#1e293b] border-slate-700/50'
                  }`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${selectedCam?.id === cam.id ? 'bg-cyan-500/20' : 'bg-slate-800/80'}`}>
                    <Camera size={18} color={selectedCam?.id === cam.id ? '#22d3ee' : '#94a3b8'} />
                    {cam.hasDetection && <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#0f172a]" />}
                  </View>
                  <View className="pr-3">
                    <Text className={`font-bold text-sm ${selectedCam?.id === cam.id ? 'text-cyan-400' : 'text-slate-300'}`}>{cam.name}</Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <MapPin size={10} color={selectedCam?.id === cam.id ? '#67e8f9' : '#64748b'} />
                      <Text className={`text-[10px] ${selectedCam?.id === cam.id ? 'text-cyan-200/70' : 'text-slate-500'}`}>{cam.location}</Text>
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
                {selectedCam && renderCameraContent(false)}
              </View>
            </View>

            <View className={isTablet ? 'flex-[1]' : 'w-full'}>
              <View className="flex-row items-center justify-between mb-4 px-1">
                <Text className="text-white text-xl font-bold">Thông số khu vực</Text>
                <Text className="text-cyan-400 text-sm font-bold">{selectedCam?.location}</Text>
              </View>
              
              <View className="flex-row flex-wrap gap-4 mb-4">
                <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-slate-300 font-bold text-base">Nhiệt độ</Text>
                    <View className={`p-1.5 rounded-lg ${selectedCam?.status === 'online' ? 'bg-orange-500/20' : 'bg-slate-700/50'}`}>
                      <Thermometer size={16} color={selectedCam?.status === 'online' ? '#f97316' : '#64748b'} />
                    </View>
                  </View>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">CẢM BIẾN THỰC</Text>
                  <Text className={`text-3xl font-extrabold ${selectedCam?.status === 'online' ? 'text-orange-500' : 'text-slate-500'}`}>
                    {selectedCam?.status === 'online' ? weatherData.temp.toFixed(1) : '--'}°C
                  </Text>
                </View>

                <View className={`bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${isTablet ? 'w-full' : 'w-[47%] flex-grow'}`}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-slate-300 font-bold text-base">Độ ẩm</Text>
                    <View className={`p-1.5 rounded-lg ${selectedCam?.status === 'online' ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                      <Droplets size={16} color={selectedCam?.status === 'online' ? '#06b6d4' : '#64748b'} />
                    </View>
                  </View>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">CẢM BIẾN THỰC</Text>
                  <Text className={`text-3xl font-extrabold ${selectedCam?.status === 'online' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {selectedCam?.status === 'online' ? weatherData.hum.toFixed(1) : '--'}%
                  </Text>
                </View>
              </View>

              <View className="bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg w-full mt-2">
                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-slate-400 text-sm font-medium mb-1">Dự kiến hoàn thành</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-3xl font-extrabold tracking-tight">{isDryingMode ? displayTimeEst : '--:--'}</Text>
                    </View>
                  </View>
                  <View className={`p-3 rounded-2xl border ${selectedCam?.status === 'online' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <Clock size={24} color={selectedCam?.status === 'online' ? '#818cf8' : '#64748b'} />
                  </View>
                </View>

                {isDryingMode ? (
                  <>
                    <View className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3 border border-slate-700/50">
                      <View 
                        className={`h-full rounded-full transition-all duration-1000 ${selectedCam?.status === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} 
                        style={{ width: `${selectedCam?.status === 'online' ? Math.round(predictionData.dryness) : 0}%` }} 
                      />
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className={`font-bold text-sm ${selectedCam?.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {selectedCam?.status === 'online' ? Math.round(predictionData.dryness) : 0}% Khô
                      </Text>
                      <Text className="text-slate-500 font-medium text-xs">
                        {predictionData.minutesLeft > 0 ? `Còn ${displayTimeLeft}` : 'Hoàn thành'}
                      </Text>
                    </View>

                    {/* HIỂN THỊ NÚT HỦY KHI ĐANG CHẠY NỀN NHƯNG CAMERA KHÔNG CÓ BÁNH */}
                    {!currentHasDetection && predictionData.minutesLeft > 0 && (
                      <View className="flex-row items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-4">
                        <View className="flex-col">
                          <Text className="text-xs font-bold text-amber-400">Đang chạy nền</Text>
                          <Text className="text-[10px] text-amber-500/80 mt-0.5">AI vẫn đang đếm ngược thời gian</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={handleCancelBackgroundBatch}
                          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-red-500/20 rounded-lg"
                        >
                          <XCircle size={14} color="#f87171" /> 
                          <Text className="text-red-400 text-xs font-bold">Hủy mẻ</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <View className="p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 items-center justify-center">
                    <Text className="text-sm text-slate-400 text-center font-medium">Không phát hiện bánh tráng trên vỉ.</Text>
                    <Text className="text-xs text-slate-500 mt-1 text-center">Hệ thống AI đo thời gian đang tạm dừng.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </DataWrapper>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 7️⃣ MODALS GIỮ NGUYÊN */}
      {/* ========================================================================= */}
      
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
              <View className={`w-2.5 h-2.5 rounded-full ${selectedCam?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <Text className="text-white text-sm font-bold tracking-wider">{selectedCam?.status === 'online' ? 'LIVE' : 'OFFLINE'}</Text>
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