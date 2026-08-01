import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Users, Camera, BrainCircuit, LineChart as ChartIcon, 
  ChevronLeft, Activity, Thermometer, Droplets
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// 🚀 IMPORT API THẬT CỦA BẠN
import { adminApi } from '@/src/services/api';

const { width } = Dimensions.get('window');

export default function AdminOverviewScreen() {
  const router = useRouter();

  // 🚀 STATE CHUẨN KHỚP VỚI API
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState({
    total_users: 0,
    total_cameras: 0,
    total_detections: 0,
    total_predictions: 0
  });

  const [aiConfidenceData, setAiConfidenceData] = useState<any[]>([]);
  const [aiDrynessData, setAiDrynessData] = useState<any[]>([]);

  // 🚀 GỌI API ĐỒNG BỘ GIỐNG BẢN WEB
  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [overviewRes, confRes, dryRes]: any = await Promise.allSettled([
          adminApi.getOverview(),
          adminApi.getConfidenceChart(),
          adminApi.getDrynessChart()
        ]);

        if (!isMounted) return;

        // 1. Dữ liệu Overview
        if (overviewRes.status === 'fulfilled') {
          const data = overviewRes.value?.data || overviewRes.value;
          if (data) {
            setOverviewStats({
              total_users: data.total_users || 0,
              total_cameras: data.total_cameras || 0,
              total_detections: data.total_detections || 0,
              total_predictions: data.total_predictions || 0
            });
          }
        }

        // 2. Dữ liệu Confidence
        if (confRes.status === 'fulfilled') {
          const confData = confRes.value?.data || confRes.value;
          if (Array.isArray(confData)) setAiConfidenceData(confData.slice(-7)); // Lấy 7 ngày gần nhất
        }

        // 3. Dữ liệu Dryness
        if (dryRes.status === 'fulfilled') {
          const dryData = dryRes.value?.data || dryRes.value;
          if (Array.isArray(dryData)) setAiDrynessData(dryData.slice(-7)); // Lấy 7 ngày gần nhất
        }

      } catch (error) {
        Toast.show({ type: 'error', text1: 'Lỗi đồng bộ dữ liệu hệ thống' });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Format số liệu lớn
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
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
            <Text className="text-white text-xl font-bold">Tổng quan hệ thống</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Trạng thái vận hành LANGAI</Text>
          </View>
        </View>
        
        {/* Nút trạng thái (Pulse) */}
        <View className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex-row items-center gap-2">
          <View className="w-2 h-2 bg-emerald-400 rounded-full" />
          <Text className="text-emerald-400 text-xs font-bold">Online</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text className="text-slate-400 font-medium mt-4">Đang tải dữ liệu thực...</Text>
          </View>
        ) : (
          <>
            {/* ================= STATS GRID 2x2 CỦA BẢN WEB ================= */}
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
              {/* 1. Tổng người dùng */}
              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center">
                    <Users size={20} color="#60a5fa" />
                  </View>
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Người Dùng</Text>
                <Text className="text-white text-3xl font-extrabold">{formatNumber(overviewStats.total_users)}</Text>
              </View>

              {/* 2. Tổng Camera */}
              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="w-10 h-10 bg-purple-500/10 rounded-xl items-center justify-center">
                    <Camera size={20} color="#c084fc" />
                  </View>
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Tổng Camera</Text>
                <Text className="text-white text-3xl font-extrabold">{formatNumber(overviewStats.total_cameras)}</Text>
              </View>

              {/* 3. Lượt nhận diện */}
              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center">
                    <BrainCircuit size={20} color="#22d3ee" />
                  </View>
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Lượt Nhận Diện</Text>
                <Text className="text-white text-3xl font-extrabold">{formatNumber(overviewStats.total_detections)}</Text>
              </View>

              {/* 4. Lượt dự đoán */}
              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center">
                    <ChartIcon size={20} color="#34d399" />
                  </View>
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Dự Đoán Thời Gian</Text>
                <Text className="text-white text-3xl font-extrabold">{formatNumber(overviewStats.total_predictions)}</Text>
              </View>
            </View>

            {/* ================= BIỂU ĐỒ 1: AI CONFIDENCE ================= */}
            <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
              <View className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <Text className="text-white font-bold text-lg mb-1">Độ tin cậy AI (Confidence)</Text>
              <Text className="text-slate-400 text-xs mb-6">Model YOLOv8 - 7 Ngày gần nhất</Text>
              
              {aiConfidenceData.length === 0 ? (
                <View className="h-32 items-center justify-center">
                  <Text className="text-slate-500 text-sm">Chưa có dữ liệu</Text>
                </View>
              ) : (
                <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
                  {/* Đường đứt nét nền */}
                  <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[50%]" />
                  <View className="absolute w-full border-t border-amber-500/20 border-dashed bottom-[80%]" />
                  <Text className="absolute bottom-[82%] left-0 text-amber-500/50 text-[8px] font-bold">80%</Text>

                  <View className="flex-1 flex-row justify-between items-end px-2 z-10">
                    {aiConfidenceData.map((item, idx) => {
                      const percent = Math.round(Number(item.avg_confidence || 0) * 100);
                      const isGood = percent >= 80;
                      return (
                        <View key={idx} className="items-center flex-1">
                          <Text className="text-white text-[10px] font-bold mb-1">{percent}%</Text>
                          <View 
                            className={`w-6 sm:w-8 rounded-t-md ${isGood ? 'bg-purple-500' : 'bg-orange-500'} shadow-[0_0_10px_rgba(139,92,246,0.3)]`} 
                            style={{ height: `${Math.min(Math.max(percent, 5), 100)}%` }} 
                          />
                          <Text className="text-slate-500 text-[9px] mt-2 font-medium">
                            {item.date ? String(item.date).split('-').slice(1).join('/') : '--'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* ================= BIỂU ĐỒ 2: DỰ ĐOÁN THỜI GIAN ================= */}
            <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
              <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <Text className="text-white font-bold text-lg mb-1">AI Dryness Predict</Text>
              <Text className="text-slate-400 text-xs mb-6">Thời gian phơi dự kiến (Phút)</Text>
              
              {aiDrynessData.length === 0 ? (
                <View className="h-32 items-center justify-center">
                  <Text className="text-slate-500 text-sm">Chưa có dữ liệu dự đoán</Text>
                </View>
              ) : (
                <View className="flex-row h-48 items-end border-b border-slate-700 pb-2 relative">
                  <View className="flex-1 flex-row justify-between items-end px-2 z-10">
                    {aiDrynessData.map((item, idx) => {
                      // Tính toán chiều cao cột giả lập dựa trên phút (Giả định max 180 phút = 100%)
                      const mins = Number(item.avg_minutes || 0);
                      const temp = Number(item.avg_temperature || 0);
                      const heightPercent = Math.min((mins / 180) * 100, 100);

                      return (
                        <View key={idx} className="items-center flex-1">
                          {/* Nhiệt độ */}
                          <View className="items-center mb-2">
                            <Thermometer size={10} color="#f97316" />
                            <Text className="text-orange-400 text-[8px] font-bold mt-0.5">{temp.toFixed(0)}°</Text>
                          </View>
                          
                          <Text className="text-white text-[10px] font-bold mb-1">{mins.toFixed(0)}p</Text>
                          <View 
                            className="w-6 sm:w-8 rounded-t-md bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                            style={{ height: `${Math.max(heightPercent, 10)}%` }} 
                          />
                          <Text className="text-slate-500 text-[9px] mt-2 font-medium">
                            {item.date ? String(item.date).split('-').slice(1).join('/') : '--'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}