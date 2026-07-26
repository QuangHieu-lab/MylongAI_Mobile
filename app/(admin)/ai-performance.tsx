/*
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, Target, BrainCircuit, CheckCircle, 
  AlertTriangle, Camera, UploadCloud, RefreshCw, 
  Database, Thermometer, Droplets, Clock, Activity, ScanLine
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// 🚀 IMPORT API
import { adminApi } from '@/src/services/api';

export default function AiPerformanceScreen() {
  const router = useRouter();

  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [isTraining, setIsTraining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const falsePositives = 12; 
  const falseNegatives = 8;  

  // =========================================================================
  // 1️⃣ GỌI API & HỢP NHẤT DỮ LIỆU
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const [confRes, dryRes]: any = await Promise.all([
          adminApi.getConfidenceChart(),
          adminApi.getDrynessChart().catch(() => null) 
        ]);
        
        let confData: any[] = [];
        if (Array.isArray(confRes?.data?.data)) confData = confRes.data.data;
        else if (Array.isArray(confRes?.data)) confData = confRes.data;
        else if (Array.isArray(confRes)) confData = confRes;

        let dryData: any[] = [];
        if (Array.isArray(dryRes?.data?.data)) dryData = dryRes.data.data;
        else if (Array.isArray(dryRes?.data)) dryData = dryRes.data;
        else if (Array.isArray(dryRes)) dryData = dryRes;
        
        if (confData.length > 0 && isMounted) {
          const dryMap = new Map();
          if (dryData.length > 0) {
            dryData.forEach((d: any) => {
              dryMap.set(d.date, d);
            });
          }

          const mappedData = confData.map(item => {
            const dateStr = item.date || '';
            const dryItem = dryMap.get(dateStr) || {};
            
            let timeStr = '--';
            if (dryItem.avg_minutes) {
              const totalMins = Number(dryItem.avg_minutes);
              const h = Math.floor(totalMins / 60);
              const m = Math.round(totalMins % 60);
              timeStr = h > 0 ? `${h}h ${m}p` : `${m}p`;
            }

            return {
              date: dateStr,
              confidence: Math.round(Number(item.avg_confidence || 0) * 100),
              detectCount: Number(item.total_detected) || 0,
              avgTemp: Number(dryItem.avg_temperature) || 0,
              avgHum: Number(dryItem.avg_humidity) || 0,
              avgDryingTime: timeStr
            };
          });
          
          setChartData(mappedData);
          if (mappedData.length > 0) {
            setSelectedDate(mappedData[0].date); 
          }
        }
      } catch (error) {
        console.log('Lỗi fetch chart:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChartData();
    return () => { isMounted = false; };
  }, []);

  // Lấy dữ liệu của ngày được chọn
  const currentData = chartData.find(d => d.date === selectedDate) || {
    date: selectedDate,
    confidence: 0,
    detectCount: 0,
    avgTemp: 0,
    avgHum: 0,
    avgDryingTime: '--'
  };

  // 🚀 Bọc hàm chọn ngày bằng useCallback để tránh re-render gây lỗi Navigation Context
  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // =========================================================================
  // 2️⃣ CÁC HÀM XỬ LÝ SỰ KIỆN WORKSPACE
  // =========================================================================
  const handleLiveScan = () => {
    Toast.show({ type: 'info', text1: 'Mở Camera AI', text2: 'Đang khởi tạo luồng camera để quét...' });
  };

  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thêm ảnh vào tập dữ liệu.' });
    }, 1500);
  };

  const handleRetrainAI = () => {
    setIsTraining(true);
    Toast.show({ type: 'info', text1: 'Bắt đầu Fine-tuning', text2: 'Đang nạp dữ liệu vào mô hình YOLO...' });
    setTimeout(() => {
      setIsTraining(false);
      Toast.show({ type: 'success', text1: 'Huấn luyện hoàn tất!', text2: 'Độ tin cậy dự kiến tăng.' });
    }, 3000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* HEADER }
      <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700">
          <ChevronLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Hiệu suất & Độ tin cậy</Text>
          <Text className="text-purple-400 text-xs mt-0.5">YOLO Vision AI Workspace</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#a855f7" />
            <Text className="text-slate-400 mt-4 font-medium">Đang tải cấu hình AI...</Text>
          </View>
        ) : chartData.length === 0 ? (
          <View className="py-20 items-center justify-center bg-[#1e293b] rounded-[32px] border border-slate-700/50">
            <Text className="text-slate-400">Chưa có dữ liệu AI Confidence</Text>
          </View>
        ) : (
          <>
            {/* THANH CHỌN NGÀY }
            <View className="mb-4">
              <Text className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2 ml-1">Lịch sử đánh giá</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {chartData.map((d) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <TouchableOpacity 
                      key={d.date}
                      onPress={() => handleSelectDate(d.date)}
                      activeOpacity={0.7}
                      className={`px-4 py-2 rounded-xl border mr-2 ${isSelected ? 'bg-purple-600 border-purple-500 shadow-lg' : 'bg-slate-800/50 border-slate-700'}`}
                    >
                      <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {d.date ? String(d.date).split('-').reverse().join('/') : '--'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* CARD TỔNG QUAN HIỆU SUẤT (CONFIDENCE) }
            <View className="w-full bg-[#1e293b] p-6 rounded-[32px] border border-slate-700/50 shadow-lg mb-6 relative overflow-hidden">
              <View className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full" />
              
              <View className="flex-row justify-between items-center mb-6 z-10">
                <View className="bg-purple-500/20 p-3 rounded-2xl border border-purple-500/30">
                  <Target size={24} color="#c084fc" />
                </View>
                <BrainCircuit size={28} color="#64748b" />
              </View>

              <Text className="text-slate-400 text-sm font-semibold mb-1 z-10">Độ tin cậy Trung bình (Confidence)</Text>
              <View className="flex-row items-end gap-1 mb-4 z-10">
                <Text className="text-white text-6xl font-extrabold tracking-tight">{currentData.confidence}</Text>
                <Text className="text-purple-400 text-2xl font-bold mb-1.5">%</Text>
              </View>

              <View className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-5 border border-slate-700/50 z-10">
                <View 
                  className={`h-full rounded-full ${currentData.confidence >= 80 ? 'bg-purple-500' : 'bg-orange-500'}`} 
                  style={{ width: `${Math.min(Math.max(currentData.confidence, 5), 100)}%` }} 
                />
              </View>

              <View className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex-row items-center gap-3 z-10">
                <View className="p-2 bg-blue-500/10 rounded-lg">
                  <ScanLine size={20} color="#60a5fa" />
                </View>
                <View>
                  <Text className="text-xs text-slate-400">Số bánh đã detect (Total Detected)</Text>
                  <Text className="text-lg font-bold text-white">{currentData.detectCount.toLocaleString('vi-VN')} chiếc</Text>
                </View>
              </View>
            </View>

            {/* THÔNG SỐ MÔI TRƯỜNG TRUNG BÌNH }
            <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">Môi trường trung bình</Text>
            <View className="flex-row justify-between mb-6">
              <View className="w-[31%] bg-orange-500/10 p-4 rounded-3xl border border-orange-500/20 items-center">
                <Thermometer size={20} color="#fb923c" className="mb-2" />
                <Text className="text-orange-400/80 text-[9px] font-bold uppercase mb-1">Nhiệt độ</Text>
                <Text className="text-orange-400 font-extrabold text-lg">{currentData.avgTemp > 0 ? `${currentData.avgTemp.toFixed(1)}°` : '--'}</Text>
              </View>
              <View className="w-[31%] bg-cyan-500/10 p-4 rounded-3xl border border-cyan-500/20 items-center">
                <Droplets size={20} color="#22d3ee" className="mb-2" />
                <Text className="text-cyan-400/80 text-[9px] font-bold uppercase mb-1">Độ ẩm</Text>
                <Text className="text-cyan-400 font-extrabold text-lg">{currentData.avgHum > 0 ? `${currentData.avgHum.toFixed(1)}%` : '--'}</Text>
              </View>
              <View className="w-[31%] bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 items-center">
                <Clock size={20} color="#34d399" className="mb-2" />
                <Text className="text-emerald-400/80 text-[9px] font-bold uppercase mb-1">TG Phơi</Text>
                <Text className="text-emerald-400 font-extrabold text-lg">{currentData.avgDryingTime}</Text>
              </View>
            </View>

            {/* BIỂU ĐỒ CONFIDENCE ĐỘNG BẰNG VIEW }
            <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white font-bold text-lg">Biểu đồ Confidence</Text>
                <Activity size={18} color="#a855f7" />
              </View>
              
              <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
                <View className="absolute w-full border-t border-amber-500/50 border-dashed bottom-[80%]" />
                <Text className="absolute bottom-[81%] left-0 text-amber-500 text-[8px] font-bold">Ngưỡng 80%</Text>

                <View className="flex-1 flex-row justify-between items-end px-1 z-10">
                  {chartData.slice(-7).map((item, idx) => {
                    const heightPercent = item.confidence || 0;
                    const isGood = heightPercent >= 80;
                    const isBarSelected = selectedDate === item.date;
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => handleSelectDate(item.date)}
                        className="items-center flex-1"
                      >
                        <View 
                          className={`w-6 sm:w-8 rounded-t-md ${isGood ? 'bg-purple-500' : 'bg-orange-500'} ${isBarSelected ? 'border-2 border-white' : ''}`} 
                          style={{ height: `${Math.min(Math.max(heightPercent, 5), 100)}%` }} 
                        />
                        <Text className={`text-[9px] mt-2 font-bold ${isBarSelected ? 'text-white font-extrabold' : 'text-slate-500'}`}>
                          {item.date ? String(item.date).split('-').slice(1).join('/') : '--'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* PHÂN TÍCH SAI SỐ }
            <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">Phân tích sai số (Cần Train lại)</Text>
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20">
                <CheckCircle size={20} color="#34d399" className="mb-2" />
                <Text className="text-emerald-400/80 text-[9px] font-bold uppercase mb-1">Nhận diện đúng</Text>
                <Text className="text-emerald-500 font-extrabold text-2xl">{(currentData.detectCount - (falsePositives + falseNegatives)).toLocaleString('vi-VN')}</Text>
              </View>
              <View className="flex-1 bg-rose-500/10 p-4 rounded-3xl border border-rose-500/20">
                <AlertTriangle size={20} color="#fb7185" className="mb-2" />
                <Text className="text-rose-400/80 text-[9px] font-bold uppercase mb-1">Sai lệch dự kiến</Text>
                <Text className="text-rose-500 font-extrabold text-2xl">{falsePositives + falseNegatives}</Text>
              </View>
            </View>

            {/* WORKSPACE CỦA AI }
            <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">Workspace & Huấn luyện</Text>
            <View className="bg-[#1e293b] rounded-[32px] border border-slate-700/50 p-2 shadow-lg mb-6">
              
              <TouchableOpacity onPress={handleLiveScan} className="flex-row items-center p-4 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700/50">
                <View className="w-12 h-12 bg-cyan-500/10 rounded-xl items-center justify-center border border-cyan-500/20">
                  <Camera size={20} color="#22d3ee" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white font-bold text-base">Quét bánh trực tiếp</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">Dùng camera test độ nhận diện</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleUploadImage} disabled={isUploading} className="flex-row items-center p-4 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700/50">
                <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center border border-blue-500/20">
                  {isUploading ? <ActivityIndicator color="#60a5fa" /> : <UploadCloud size={20} color="#60a5fa" />}
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white font-bold text-base">Tải ảnh mẫu bánh lên</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">Bổ sung vào tập Dataset của YOLO</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRetrainAI} disabled={isTraining} className="flex-row items-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 relative overflow-hidden">
                {isTraining && <View className="absolute inset-0 bg-amber-500/10" />}
                <View className="w-12 h-12 bg-amber-500/20 rounded-xl items-center justify-center border border-amber-500/30">
                  {isTraining ? <ActivityIndicator color="#fbbf24" /> : <RefreshCw size={20} color="#fbbf24" />}
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-amber-400 font-bold text-base">Huấn luyện lại (Fine-tune)</Text>
                  <Text className="text-amber-400/70 text-xs mt-0.5">Nạp {falsePositives + falseNegatives} ảnh sai lệch vào Model</Text>
                </View>
              </TouchableOpacity>

            </View>
            
            <View className="flex-row items-center justify-center gap-2 mb-4">
              <Database size={14} color="#64748b" />
              <Text className="text-slate-500 text-xs font-mono">Dataset version: yolo-rice-v2.1</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 
  */