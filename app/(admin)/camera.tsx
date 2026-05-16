import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Camera, ChevronLeft, AlertTriangle, Play, Pause, Maximize, 
  Settings, Wifi, WifiOff, Thermometer, Droplets
} from 'lucide-react-native';

// Import Contexts và Components
import { FarmSelector } from '@/src/components/dashboard/FarmSelector';
import { useFarm } from '@/src/contexts/FarmContext';

// 👇 IMPORT TRỰC TIẾP TỪ FILE MOCK DATA CHUNG
import { mockCameras, mockRiskAlerts } from '@/src/types/adminMockData';

export default function CameraMonitoringScreen() {
  const router = useRouter();
  const { selectedFarmId } = useFarm();
  
  // Lọc Camera theo Farm (Nếu đang chọn "Tất cả" thì lấy hết)
  const availableCameras = selectedFarmId 
    ? mockCameras.filter(c => c.farmId === selectedFarmId)
    : mockCameras;

  // Trạng thái chọn Camera (Mặc định chọn cái đầu tiên trong danh sách)
  const [selectedCam, setSelectedCam] = useState(availableCameras[0] || mockCameras[0]);
  const [isPlaying, setIsPlaying] = useState(true);

  // Lấy cảnh báo làm nhật ký AI phát hiện
  const activeAlerts = mockRiskAlerts.filter(a => a.status === 'active').slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Giám sát Camera</Text>
            <Text className="text-slate-400 text-xs mt-0.5">YOLOv8 Vision AI</Text>
          </View>
        </View>
        <FarmSelector />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= THANH CHỌN CAMERA ================= */}
        <View className="py-4 border-b border-slate-800/50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
            <View className="flex-row gap-3 pr-12">
              {availableCameras.length > 0 ? availableCameras.map(cam => (
                <TouchableOpacity 
                  key={cam.id}
                  onPress={() => setSelectedCam(cam)}
                  className={`flex-row items-center p-3 rounded-2xl border ${
                    selectedCam?.id === cam.id 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-[#1e293b] border-slate-700/50'
                  }`}
                >
                  <View className={`w-2 h-2 rounded-full mr-2 ${cam.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <Camera size={16} color={selectedCam?.id === cam.id ? '#60a5fa' : '#94a3b8'} />
                  <Text className={`ml-2 text-sm font-semibold ${selectedCam?.id === cam.id ? 'text-blue-400' : 'text-slate-300'}`}>
                    {cam.name}
                  </Text>
                </TouchableOpacity>
              )) : (
                <Text className="text-slate-500 italic py-2">Không có camera nào cho cơ sở này.</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {selectedCam && (
          <>
            {/* ================= MÀN HÌNH LUỒNG VIDEO (LIVE FEED) ================= */}
            <View className="px-6 py-6">
              <View className="bg-[#1e293b] rounded-[32px] overflow-hidden border border-slate-700/50 shadow-2xl relative">
                
                {selectedCam.status === 'online' ? (
                  <View className="h-64 bg-slate-900 relative justify-center items-center">
                    {/* Giả lập khung hình YOLO Bounding Box */}
                    {isPlaying && (
                      <>
                        <View className="absolute top-10 left-10 w-24 h-24 border-2 border-emerald-500 rounded bg-emerald-500/10" />
                        <Text className="absolute top-6 left-10 text-emerald-400 text-[10px] font-bold bg-slate-900 px-1">Bánh tráng 95%</Text>
                        
                        <View className="absolute bottom-16 right-16 w-20 h-20 border-2 border-rose-500 rounded bg-rose-500/10" />
                        <Text className="absolute bottom-12 right-16 text-rose-400 text-[10px] font-bold bg-slate-900 px-1">Lỗi nứt 88%</Text>
                      </>
                    )}
                    
                    <Text className="text-slate-600 font-mono">LIVE FEED {selectedCam.id.toUpperCase()}</Text>
                  </View>
                ) : (
                  <View className="h-64 bg-slate-900 items-center justify-center">
                    <WifiOff size={40} color="#64748b" className="mb-2" />
                    <Text className="text-slate-500 font-semibold">Mất kết nối Camera</Text>
                  </View>
                )}

                {/* Thanh điều khiển Video Overlay */}
                <View className="absolute top-4 left-4 flex-row items-center gap-2">
                  <View className="bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30 flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
                    <Text className="text-rose-400 text-[10px] font-bold">REC</Text>
                  </View>
                  <View className="bg-slate-900/60 px-2 py-1 rounded-md border border-slate-700/50">
                    <Text className="text-slate-300 text-[10px] font-mono">30 FPS</Text>
                  </View>
                </View>

                <TouchableOpacity className="absolute top-4 right-4 w-8 h-8 bg-slate-900/60 rounded-full items-center justify-center border border-slate-700/50">
                  <Maximize size={14} color="#f8fafc" />
                </TouchableOpacity>

                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-4">
                  <TouchableOpacity 
                    onPress={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/40"
                  >
                    {isPlaying ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" className="ml-1" />}
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <Settings size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ================= THÔNG SỐ & CẢNH BÁO MÔI TRƯỜNG ================= */}
            <View className="px-6 mb-6">
              <View className="flex-row flex-wrap justify-between gap-y-4">
                
                {/* Card Trạng Thái */}
                <View className="w-[48%] bg-[#1e293b] p-4 rounded-3xl border border-slate-700/50">
                  <View className="flex-row items-center mb-3">
                    <Wifi size={16} color="#60a5fa" />
                    <Text className="text-slate-400 text-xs ml-2 font-semibold">Vị trí</Text>
                  </View>
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{selectedCam.location}</Text>
                  <Text className="text-slate-500 text-[10px] font-mono">IP: 192.168.1.{selectedCam.id.replace(/\D/g, '')}</Text>
                </View>

                {/* Card Mẻ bánh đang theo dõi */}
                <View className="w-[48%] bg-[#1e293b] p-4 rounded-3xl border border-slate-700/50">
                  <View className="flex-row items-center mb-3">
                    <Camera size={16} color="#c084fc" />
                    <Text className="text-slate-400 text-xs ml-2 font-semibold">Đang theo dõi</Text>
                  </View>
                  <Text className="text-white font-bold text-lg mb-1">{selectedCam.activeBatches} mẻ bánh</Text>
                  <Text className="text-purple-400 text-[10px] font-bold">YOLO Confidence 85%</Text>
                </View>

                {/* Môi trường (Nhiệt độ / Độ ẩm) - Fake live data */}
                <View className="w-full bg-[#1e293b] p-4 rounded-3xl border border-slate-700/50 flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                      <Thermometer size={18} color="#f97316" />
                    </View>
                    <View>
                      <Text className="text-slate-400 text-[10px] font-semibold">Nhiệt độ sân</Text>
                      <Text className="text-white font-bold text-lg">36.5°C</Text>
                    </View>
                  </View>

                  <View className="w-[1px] h-8 bg-slate-700" />

                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                      <Droplets size={18} color="#60a5fa" />
                    </View>
                    <View>
                      <Text className="text-slate-400 text-[10px] font-semibold">Độ ẩm</Text>
                      <Text className="text-white font-bold text-lg">45%</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* ================= NHẬT KÝ PHÁT HIỆN AI (Từ mockRiskAlerts) ================= */}
            <View className="px-6">
              <Text className="text-white font-bold text-lg mb-4">Nhật ký AI phát hiện</Text>
              
              <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
                {activeAlerts.length > 0 ? activeAlerts.map((item, idx) => (
                  <View key={item.id} className={`flex-row items-center justify-between py-3 ${idx !== activeAlerts.length - 1 ? 'border-b border-slate-800' : ''}`}>
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.severity === 'critical' || item.severity === 'high' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                      }`}>
                        <AlertTriangle size={14} color={item.severity === 'critical' || item.severity === 'high' ? '#fb7185' : '#fbbf24'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.message}</Text>
                        <Text className="text-slate-500 text-[10px]">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {item.batchName}
                        </Text>
                      </View>
                    </View>
                  </View>
                )) : (
                  <Text className="text-slate-500 italic text-center py-2">Chưa có cảnh báo nào.</Text>
                )}

                <TouchableOpacity className="mt-2 py-2 items-center">
                  <Text className="text-blue-400 text-xs font-semibold">Xem toàn bộ lịch sử</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}