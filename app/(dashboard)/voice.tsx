import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Volume2, VolumeX, Mic, Radio, AlertTriangle, CloudRain, 
  TrendingUp, CheckCircle2, Bell, Settings, Clock, 
  MessageSquare, Waves, ChevronLeft, Minus, Plus, ChevronRight
} from 'lucide-react-native';

// 🚀 IMPORT DATA WRAPPER
import DataWrapper from '@/src/components/ui/DataWrapper';

interface VoiceAlert {
  id: string;
  time: string;
  message: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  played: boolean;
  priority: 'high' | 'medium' | 'low';
}

const MOCK_ALERTS: VoiceAlert[] = [
  { id: '1', time: '15:30', message: 'Độ ẩm tăng cao lên 68%, cân nhắc thu bánh trong 30 phút tới.', type: 'warning', played: true, priority: 'high' },
  { id: '2', time: '16:00', message: 'Nguy cơ mưa trong 30 phút tới, khả năng 75%.', type: 'critical', played: true, priority: 'high' },
  { id: '3', time: '14:15', message: 'Dryness đạt 60%, tiến độ tốt, dự kiến hoàn thành đúng giờ.', type: 'info', played: true, priority: 'medium' },
  { id: '4', time: '13:45', message: 'Nhiệt độ ổn định ở 32 độ C, điều kiện phơi lý tưởng.', type: 'success', played: true, priority: 'low' },
];

export default function VoiceAlertScreen() {
  const router = useRouter();
  
  // ================= STATE QUẢN LÝ TẢI DỮ LIỆU =================
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States UI
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceType, setVoiceType] = useState('Giọng nữ (Tiếng Việt)');
  const [alerts, setAlerts] = useState<VoiceAlert[]>([]);

  // 🚀 Giả lập hàm fetch cấu hình và dữ liệu từ Server
  const fetchVoiceData = async () => {
    setError(null);
    try {
      // Giả lập delay mạng 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Bỏ comment dòng dưới để test màn hình lỗi
      // throw new Error("Không thể kết nối đến máy chủ AI Voice FPT."); 

      setAlerts(MOCK_ALERTS);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi tải dữ liệu Voice AI.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Gọi lần đầu khi vào trang
  useEffect(() => {
    fetchVoiceData();
  }, []);

  // Kéo xuống để refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchVoiceData();
  };

  // Giả lập nhận thông báo mới định kỳ (Chỉ chạy khi đã load xong)
  useEffect(() => {
    if (!voiceEnabled || isLoading) return;
    const alertInterval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (Math.random() > 0.7) {
        const newAlert: VoiceAlert = {
          id: Date.now().toString(),
          time: timeStr,
          message: `Cảnh báo định kỳ: Nhiệt độ sân phơi duy trì ổn định.`,
          type: 'info',
          played: false,
          priority: 'low',
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        if (voiceEnabled) {
          setIsPlaying(true);
          setTimeout(() => {
            setIsPlaying(false);
            setAlerts(prev => prev.map(a => a.id === newAlert.id ? { ...a, played: true } : a));
          }, 3000);
        }
      }
    }, 20000);

    return () => clearInterval(alertInterval);
  }, [voiceEnabled, isLoading]);

  // UI Helpers
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={20} color="#f87171" />;
      case 'warning': return <CloudRain size={20} color="#fbbf24" />;
      case 'success': return <CheckCircle2 size={20} color="#34d399" />;
      default: return <TrendingUp size={20} color="#60a5fa" />;
    }
  };

  const unplayedCount = alerts.filter(a => !a.played).length;

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* ================= HEADER (Luôn hiển thị) ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">AI Voice Alert</Text>
            <Text className="text-purple-400 text-xs mt-0.5">Trợ lý giọng nói tự động</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
          <Radio size={14} color="#c084fc" />
          <Text className="text-[10px] font-bold text-purple-400 uppercase">System</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#c084fc" colors={['#c084fc']} />}
      >
        {/* 🚀 BỌC NỘI DUNG VÀO DATA WRAPPER */}
        <DataWrapper 
          isLoading={isLoading && !isRefreshing} 
          error={error} 
          onRetry={fetchVoiceData}
          loadingMessage="Đang đồng bộ cấu hình AI Voice..."
        >
          {/* ================= KHU VỰC CÀI ĐẶT (CONTROL PANEL) ================= */}
          <View className="px-6 py-6">
            <View className="bg-[#1e293b] rounded-[24px] border border-slate-700/50 p-5 shadow-lg">
              <View className="flex-row items-center gap-2 mb-6">
                <Settings size={20} color="#c084fc" />
                <Text className="text-white text-lg font-bold">Cài đặt giọng nói</Text>
              </View>

              {/* Toggle Bật/Tắt */}
              <View className="flex-row items-center justify-between bg-slate-800 p-4 rounded-2xl mb-4">
                <View className="flex-row items-center gap-3">
                  <View className={`w-12 h-12 rounded-xl flex items-center justify-center ${voiceEnabled ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-700'}`}>
                    {voiceEnabled ? <Volume2 size={24} color="#fff" /> : <VolumeX size={24} color="#94a3b8" />}
                  </View>
                  <View>
                    <Text className="text-white font-bold text-base">Phát cảnh báo</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">{voiceEnabled ? 'Hệ thống đang theo dõi' : 'Đã tắt âm thanh'}</Text>
                  </View>
                </View>
                <Switch 
                  value={voiceEnabled} 
                  onValueChange={setVoiceEnabled}
                  trackColor={{ false: '#334155', true: '#9333ea' }}
                  thumbColor="#fff"
                />
              </View>

              {/* Âm lượng (Mobile UI Custom) */}
              <View className={`mb-4 ${!voiceEnabled ? 'opacity-50' : 'opacity-100'}`}>
                <View className="flex-row justify-between mb-2 px-1">
                  <Text className="text-slate-400 text-sm font-medium">Âm lượng</Text>
                  <Text className="text-purple-400 font-bold">{volume}%</Text>
                </View>
                <View className="flex-row items-center gap-3 bg-slate-800 p-2 rounded-2xl">
                  <TouchableOpacity 
                    disabled={!voiceEnabled}
                    onPress={() => setVolume(Math.max(0, volume - 10))}
                    className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center"
                  >
                    <Minus size={18} color="#fff" />
                  </TouchableOpacity>
                  
                  {/* Thanh Bar */}
                  <View className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden">
                    <View className="h-full bg-purple-500 rounded-full" style={{ width: `${volume}%` }} />
                  </View>

                  <TouchableOpacity 
                    disabled={!voiceEnabled}
                    onPress={() => setVolume(Math.min(100, volume + 10))}
                    className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center"
                  >
                    <Plus size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Chọn giọng đọc */}
              <TouchableOpacity 
                disabled={!voiceEnabled}
                className={`flex-row items-center justify-between bg-slate-800 p-4 rounded-2xl mb-6 ${!voiceEnabled ? 'opacity-50' : 'opacity-100'}`}
              >
                <View>
                  <Text className="text-slate-400 text-xs mb-1">Giọng đọc hiện tại</Text>
                  <Text className="text-white font-bold">{voiceType}</Text>
                </View>
                <ChevronRight size={20} color="#64748b" />
              </TouchableOpacity>

              {/* Nút Test */}
              <TouchableOpacity 
                disabled={!voiceEnabled}
                onPress={() => {
                  setIsPlaying(true);
                  setTimeout(() => setIsPlaying(false), 2000);
                }}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${voiceEnabled ? 'bg-purple-600 shadow-purple-600/30' : 'bg-slate-700'}`}
              >
                <Mic size={18} color={voiceEnabled ? "#fff" : "#94a3b8"} className="mr-2" />
                <Text className={`font-bold text-base ${voiceEnabled ? 'text-white' : 'text-slate-400'}`}>Thử giọng đọc</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= KHU VỰC TRẠNG THÁI (STATS & PLAYING) ================= */}
          <View className="px-6 mb-6">
            {/* Hiệu ứng đang phát âm thanh */}
            {isPlaying && voiceEnabled && (
              <View className="bg-purple-500/10 border border-purple-500/50 rounded-3xl p-5 mb-6 flex-row items-center gap-4">
                <View className="w-14 h-14 bg-purple-600 rounded-full items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.6)]">
                  <Waves size={28} color="#fff" className="animate-pulse" />
                </View>
                <View className="flex-1">
                  <Text className="text-purple-300 text-lg font-bold mb-1">Đang phát thông báo...</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-purple-400 text-xs">AI Voice Assistant Active</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2 Thẻ Thống kê */}
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1 bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center">
                    <Bell size={14} color="#60a5fa" />
                  </View>
                  <Text className="text-slate-300 text-xs font-bold">Tổng cảnh báo</Text>
                </View>
                <Text className="text-4xl font-extrabold text-blue-400">{alerts.length}</Text>
              </View>

              <View className="flex-1 bg-orange-500/10 border border-orange-500/20 p-5 rounded-3xl">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 bg-orange-500/20 rounded-full items-center justify-center">
                    <MessageSquare size={14} color="#fb923c" />
                  </View>
                  <Text className="text-slate-300 text-xs font-bold">Chưa phát</Text>
                </View>
                <Text className="text-4xl font-extrabold text-orange-400">{unplayedCount}</Text>
              </View>
            </View>

            {/* Trạng thái hệ thống */}
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                <Text className="text-slate-300 text-sm font-semibold">AI Voice System hoạt động</Text>
              </View>
              <View className="flex-row items-center gap-3 mb-3">
                <CheckCircle2 size={16} color="#059669" />
                <Text className="text-slate-300 text-sm font-semibold">Kết nối ổn định</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Clock size={16} color="#3b82f6" />
                <Text className="text-slate-300 text-sm font-semibold">Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</Text>
              </View>
            </View>
          </View>

          {/* ================= LỊCH SỬ THÔNG BÁO ================= */}
          <View className="px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">Lịch sử thông báo</Text>
              <View className="bg-slate-800 px-2 py-1 rounded">
                <Text className="text-slate-400 text-xs font-bold">{alerts.length} tin nhắn</Text>
              </View>
            </View>

            <View className="bg-[#1e293b] rounded-[24px] border border-slate-700/50 p-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <View 
                    key={alert.id} 
                    className={`p-4 rounded-2xl mb-3 border ${
                      alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                      alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                      alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                    } ${!alert.played ? 'opacity-100 border-l-4' : 'opacity-70 border-l-[1px]'}`}
                  >
                    <View className="flex-row items-start gap-3">
                      <View className="mt-1">{getAlertIcon(alert.type)}</View>
                      <View className="flex-1">
                        <View className="flex-row items-center flex-wrap gap-2 mb-1.5">
                          <Text className="text-slate-400 text-xs font-mono bg-slate-900 px-1.5 py-0.5 rounded">{alert.time}</Text>
                          
                          {/* Huy hiệu ưu tiên */}
                          <View className={`px-1.5 py-0.5 rounded border ${
                            alert.priority === 'high' ? 'bg-red-500/20 border-red-500/30' :
                            alert.priority === 'medium' ? 'bg-amber-500/20 border-amber-500/30' :
                            'bg-slate-800 border-slate-700'
                          }`}>
                            <Text className={`text-[10px] font-bold ${
                              alert.priority === 'high' ? 'text-red-400' :
                              alert.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'
                            }`}>Ưu tiên {alert.priority === 'high' ? 'Cao' : alert.priority === 'medium' ? 'TB' : 'Thấp'}</Text>
                          </View>

                          {/* Trạng thái đã phát */}
                          {!alert.played && (
                            <View className="flex-row items-center gap-1 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              <Volume2 size={10} color="#c084fc" />
                              <Text className="text-purple-400 text-[10px] font-bold">Chờ phát</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-slate-200 text-sm leading-5">{alert.message}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center justify-center py-10">
                  <MessageSquare size={48} color="#475569" className="mb-3" />
                  <Text className="text-slate-400 font-bold">Chưa có thông báo</Text>
                </View>
              )}
            </View>
          </View>
        </DataWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}