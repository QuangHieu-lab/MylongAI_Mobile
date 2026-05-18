import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { 
  Save, RefreshCcw, Settings as SettingsIcon, 
  Bell, Sliders, Database, ChevronLeft, ChevronRight, Server
} from 'lucide-react-native';

// Import Data
import { defaultAIConfig } from '@/src/types/adminMockData';

export default function SettingsScreen() {
  const router = useRouter();
  
  // States
  const [aiConfig, setAiConfig] = useState(defaultAIConfig);
  const [activeTab, setActiveTab] = useState<'ai' | 'alerts' | 'system' | 'data'>('ai');

  // Hành động
  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Cài đặt đã được lưu thành công!',
    });
  };

  const handleReset = () => {
    setAiConfig(defaultAIConfig);
    Toast.show({
      type: 'info',
      text1: 'Khôi phục',
      text2: 'Đã khôi phục cài đặt mặc định',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Cài đặt hệ thống</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Cấu hình thông số & AI</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= NÚT ACTION TỔNG ================= */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity 
            onPress={handleReset}
            className="flex-1 bg-slate-800 py-3.5 rounded-2xl flex-row items-center justify-center border border-slate-700"
          >
            <RefreshCcw size={16} color="#94a3b8" />
            <Text className="text-slate-300 font-bold ml-2 text-sm">Mặc định</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSave}
            className="flex-1 bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-600/30"
          >
            <Save size={16} color="#ffffff" />
            <Text className="text-white font-bold ml-2 text-sm">Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>

        {/* ================= THANH TABS NGANG ================= */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5 mb-6">
          <View className="flex-row gap-3 pr-10">
            <TouchableOpacity 
              onPress={() => setActiveTab('ai')}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${activeTab === 'ai' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <Sliders size={16} color={activeTab === 'ai' ? '#fff' : '#94a3b8'} />
              <Text className={`font-semibold ml-2 ${activeTab === 'ai' ? 'text-white' : 'text-slate-300'}`}>Cấu hình AI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('alerts')}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${activeTab === 'alerts' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <Bell size={16} color={activeTab === 'alerts' ? '#fff' : '#94a3b8'} />
              <Text className={`font-semibold ml-2 ${activeTab === 'alerts' ? 'text-white' : 'text-slate-300'}`}>Cảnh báo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('system')}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${activeTab === 'system' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <SettingsIcon size={16} color={activeTab === 'system' ? '#fff' : '#94a3b8'} />
              <Text className={`font-semibold ml-2 ${activeTab === 'system' ? 'text-white' : 'text-slate-300'}`}>Hệ thống</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('data')}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${activeTab === 'data' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <Database size={16} color={activeTab === 'data' ? '#fff' : '#94a3b8'} />
              <Text className={`font-semibold ml-2 ${activeTab === 'data' ? 'text-white' : 'text-slate-300'}`}>Dữ liệu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ================= NỘI DUNG TỪNG TAB ================= */}
        
        {/* TAB 1: CẤU HÌNH AI */}
        {activeTab === 'ai' && (
          <View className="space-y-4">
            
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg mb-2">
              <Text className="text-white font-bold text-lg mb-1">Ngưỡng độ khô</Text>
              <Text className="text-slate-400 text-xs mb-4">Độ khô tối thiểu để AI báo hoàn thành mẻ bánh.</Text>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 font-semibold">Độ khô đạt chuẩn</Text>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={aiConfig.dryingThreshold.toString()}
                    onChangeText={(val) => setAiConfig({...aiConfig, dryingThreshold: Number(val)})}
                    keyboardType="numeric"
                    className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                  />
                  <Text className="text-slate-400">%</Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg mb-2">
              <Text className="text-white font-bold text-lg mb-1">Độ tin cậy AI (Confidence)</Text>
              <Text className="text-slate-400 text-xs mb-4">Ngưỡng chắc chắn để YOLO AI kích hoạt nhận diện.</Text>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 font-semibold">Ngưỡng tin cậy</Text>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={aiConfig.confidenceThreshold.toString()}
                    onChangeText={(val) => setAiConfig({...aiConfig, confidenceThreshold: Number(val)})}
                    keyboardType="numeric"
                    className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                  />
                  <Text className="text-slate-400">%</Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <Text className="text-white font-bold text-lg mb-1">Cảnh báo môi trường</Text>
              <Text className="text-slate-400 text-xs mb-4">Ngưỡng kích hoạt báo động cho thời tiết.</Text>
              
              <View className="space-y-4">
                <View className="flex-row items-center justify-between border-b border-slate-800 pb-3">
                  <Text className="text-slate-300 font-semibold">Cảnh báo độ ẩm cao</Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={aiConfig.humidityWarning.toString()}
                      onChangeText={(val) => setAiConfig({...aiConfig, humidityWarning: Number(val)})}
                      keyboardType="numeric"
                      className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                    />
                    <Text className="text-slate-400">%</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-b border-slate-800 pb-3">
                  <Text className="text-slate-300 font-semibold">Nguy cơ mưa</Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={aiConfig.rainRiskThreshold.toString()}
                      onChangeText={(val) => setAiConfig({...aiConfig, rainRiskThreshold: Number(val)})}
                      keyboardType="numeric"
                      className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                    />
                    <Text className="text-slate-400">%</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-b border-slate-800 pb-3">
                  <Text className="text-slate-300 font-semibold">Nhiệt độ tối thiểu</Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={aiConfig.temperatureMin.toString()}
                      onChangeText={(val) => setAiConfig({...aiConfig, temperatureMin: Number(val)})}
                      keyboardType="numeric"
                      className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                    />
                    <Text className="text-slate-400">°C</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300 font-semibold">Nhiệt độ tối đa</Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={aiConfig.temperatureMax.toString()}
                      onChangeText={(val) => setAiConfig({...aiConfig, temperatureMax: Number(val)})}
                      keyboardType="numeric"
                      className="w-16 bg-[#0f172a] text-white text-center py-2 rounded-lg border border-slate-700"
                    />
                    <Text className="text-slate-400">°C</Text>
                  </View>
                </View>
              </View>
            </View>

          </View>
        )}

        {/* TAB 2: CẢNH BÁO */}
        {activeTab === 'alerts' && (
          <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
            <Text className="text-white font-bold text-lg mb-1">Tùy chọn thông báo</Text>
            <Text className="text-slate-400 text-xs mb-6">Quản lý cách hệ thống gửi cảnh báo đến bạn.</Text>

            <View className="space-y-1">
              <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Cảnh báo tự động</Text>
                  <Text className="text-slate-400 text-[10px]">Tự động gửi cảnh báo khi phát hiện rủi ro</Text>
                </View>
                <Switch
                  value={aiConfig.autoAlertEnabled}
                  onValueChange={(val) => setAiConfig({...aiConfig, autoAlertEnabled: val})}
                  trackColor={{ false: '#334155', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>

              <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Thông báo giọng nói</Text>
                  <Text className="text-slate-400 text-[10px]">Đọc to cảnh báo trên loa ứng dụng</Text>
                </View>
                <Switch
                  value={aiConfig.voiceNotificationEnabled}
                  onValueChange={(val) => setAiConfig({...aiConfig, voiceNotificationEnabled: val})}
                  trackColor={{ false: '#334155', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>

              <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Thông báo Email</Text>
                  <Text className="text-slate-400 text-[10px]">Nhận báo cáo sự cố qua Email quản trị</Text>
                </View>
                <Switch value={true} trackColor={{ false: '#334155', true: '#3b82f6' }} thumbColor="#fff" />
              </View>

              <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Thông báo đẩy (Push)</Text>
                  <Text className="text-slate-400 text-[10px]">Nhận thông báo Pop-up trên điện thoại</Text>
                </View>
                <Switch value={true} trackColor={{ false: '#334155', true: '#3b82f6' }} thumbColor="#fff" />
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: HỆ THỐNG */}
        {activeTab === 'system' && (
          <View className="space-y-4">
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <Text className="text-white font-bold text-lg mb-4">Thông tin phần mềm</Text>
              
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-slate-400 text-xs mb-1">Phiên bản App</Text>
                  <Text className="text-white font-bold">v2.1.0</Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-slate-400 text-xs mb-1">AI Model</Text>
                  <Text className="text-white font-bold">YOLOv8-v3</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-slate-400 text-xs mb-1">Bản cập nhật</Text>
                  <Text className="text-white font-bold">18/03/2026</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-slate-400 text-xs mb-1">Uptime</Text>
                  <Text className="text-emerald-400 font-bold">99.8%</Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <Text className="text-white font-bold text-lg mb-4">Camera & Thiết bị</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-semibold mb-1">Tần suất quét AI</Text>
                    <Text className="text-slate-400 text-[10px]">Độ trễ xử lý khung hình (giây)</Text>
                  </View>
                  <TextInput
                    defaultValue="5"
                    keyboardType="numeric"
                    className="w-12 bg-[#1e293b] text-white text-center py-2 rounded-lg border border-slate-700"
                  />
                </View>

                <TouchableOpacity className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-semibold mb-1">Chất lượng Video</Text>
                    <Text className="text-slate-400 text-[10px]">Độ phân giải luồng Live Feed</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-blue-400 font-bold">1080p</Text>
                    <ChevronRight size={16} color="#64748b" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: DỮ LIỆU */}
        {activeTab === 'data' && (
          <View className="space-y-4">
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <Text className="text-white font-bold text-lg mb-1">Quản lý Dữ liệu</Text>
              <Text className="text-slate-400 text-xs mb-6">Cài đặt lưu trữ đám mây và sao lưu.</Text>

              <View className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800 mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Tự động sao lưu</Text>
                  <Text className="text-slate-400 text-[10px]">Upload dữ liệu lên Cloud hàng ngày</Text>
                </View>
                <Switch value={true} trackColor={{ false: '#334155', true: '#3b82f6' }} thumbColor="#fff" />
              </View>

              <TouchableOpacity className="flex-row items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800 mb-6">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-semibold mb-1">Chu kỳ lưu trữ</Text>
                  <Text className="text-slate-400 text-[10px]">Thời gian giữ lại dữ liệu lịch sử</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-blue-400 font-bold">30 Ngày</Text>
                  <ChevronRight size={16} color="#64748b" />
                </View>
              </TouchableOpacity>

              <View className="space-y-3 pt-2">
                <TouchableOpacity className="bg-[#0f172a] py-3.5 rounded-xl flex-row items-center justify-center border border-slate-700">
                  <Database size={16} color="#94a3b8" />
                  <Text className="text-slate-300 font-bold ml-2 text-sm">Xuất báo cáo (CSV)</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-rose-500/10 py-3.5 rounded-xl flex-row items-center justify-center border border-rose-500/20">
                  <RefreshCcw size={16} color="#fb7185" />
                  <Text className="text-rose-400 font-bold ml-2 text-sm">Xóa rác hệ thống</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <View className="flex-row items-center gap-2 mb-4">
                <Server size={18} color="#60a5fa" />
                <Text className="text-white font-bold text-lg">Thống kê lưu trữ Server</Text>
              </View>
              
              <View className="mb-6">
                <View className="flex-row justify-between text-xs mb-1.5">
                  <Text className="text-slate-400">Dung lượng sử dụng</Text>
                  <Text className="text-blue-400 font-bold">2.4 GB / 10 GB</Text>
                </View>
                <View className="w-full h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
                  <View className="h-full bg-blue-500 rounded-full" style={{ width: `24%` }} />
                </View>
              </View>

              <View className="flex-row bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs mb-1">Tổng lịch sử mẻ</Text>
                  <Text className="text-white font-bold text-xl">835</Text>
                </View>
                <View className="w-[1px] bg-slate-700 mx-4" />
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs mb-1">Ảnh snapshot AI</Text>
                  <Text className="text-white font-bold text-xl">12,450</Text>
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}