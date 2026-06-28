import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle2, Camera, 
  Activity, ChevronLeft, X, Image as ImageIcon, ShieldCheck
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataWrapper from '@/src/components/ui/DataWrapper';

const { width } = Dimensions.get('window');

// Đã dọn dẹp interface sạch sẽ, chỉ giữ lại dữ liệu AI
interface HistoryRecord {
  id: string | number;
  timestamp: string;
  location: string;
  notes: string | null;
  ai_data: {
    is_detected: boolean;
    total_objects: number;
    confidence: number;
    image_url: string | null; 
  };
}

export default function HistoryScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ========================================================
  // 🚀 HÀM ĐỌC LỊCH SỬ TỪ BỘ NHỚ SIÊU TỐC
  // ========================================================
  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Lấy lịch sử quét từ bộ nhớ điện thoại (Không cần gọi API thời tiết nữa)
      const savedHistoryStr = await AsyncStorage.getItem('@scan_history');
      let savedRecords: HistoryRecord[] = savedHistoryStr ? JSON.parse(savedHistoryStr) : [];
      
      // HIỂN THỊ DỮ LIỆU
      setHistoryList(savedRecords);

    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError("Không thể tải dữ liệu lịch sử.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistoryData();
      return () => {};
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHistoryData();
  };

  // Nút để xóa toàn bộ lịch sử
  const clearHistory = async () => {
    await AsyncStorage.removeItem('@scan_history');
    setHistoryList([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Lịch sử phân tích</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Dữ liệu tổng hợp từ hệ thống thực</Text>
          </View>
        </View>
        
        {/* Nút Clear dữ liệu để test */}
        {historyList.length > 0 && (
          <TouchableOpacity onPress={clearHistory} className="bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
            <Text className="text-rose-400 text-xs font-bold">Xóa lịch sử</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#c084fc" colors={['#c084fc']} />}
      >
        <DataWrapper 
          isLoading={isLoading && !isRefreshing && historyList.length === 0} 
          error={error} 
          onRetry={fetchHistoryData}
          loadingMessage="Đang tải dữ liệu lịch sử..."
        >
          {/* Summary */}
          {historyList.length > 0 && (
            <View className="flex-row justify-between items-center mb-6">
              <View className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex-1 mr-2">
                <Text className="text-slate-400 text-xs mb-1">Tổng bản ghi</Text>
                <Text className="text-white text-2xl font-bold">{historyList.length}</Text>
              </View>
              <View className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/30 flex-1 ml-2">
                <Text className="text-purple-400 text-xs mb-1">Đã quét qua AI</Text>
                <Text className="text-purple-300 text-2xl font-bold">
                  {historyList.filter(b => b.ai_data?.is_detected).length}
                </Text>
              </View>
            </View>
          )}

          {historyList.length === 0 && !isLoading && (
            <View className="py-10 items-center justify-center">
              <Activity size={48} color="#334155" />
              <Text className="text-slate-500 mt-4 text-center">Chưa có lịch sử quét nào.{'\n'}Hãy thực hiện quét bánh để lưu kết quả.</Text>
            </View>
          )}

          {/* Danh sách History */}
          <View className="space-y-5">
            {historyList.map((record) => {
              const dateObj = new Date(record.timestamp);
              const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

              const aiData = record.ai_data || { is_detected: false, total_objects: 0, confidence: 0 };

              return (
                <View key={record.id} className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-lg overflow-hidden">
                  
                  {/* PHẦN HÌNH ẢNH AI */}
                  {aiData.is_detected ? (
                    <TouchableOpacity 
                      activeOpacity={0.9}
                      onPress={() => setSelectedImage(aiData.image_url)}
                      className="relative w-full h-48 bg-slate-900 border-b border-slate-800"
                    >
                      {aiData.image_url ? (
                        <Image 
                          source={{ uri: aiData.image_url }} 
                          style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <ImageIcon size={32} color="#475569" />
                        </View>
                      )}
                      
                      <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-purple-600/90 px-3 py-1 rounded-full flex-row items-center gap-1.5 backdrop-blur-sm">
                          <Camera size={12} color="#fff" />
                          <Text className="text-white text-xs font-bold">YOLOv8</Text>
                        </View>
                        {aiData.confidence > 0 && (
                          <View className="bg-blue-500/90 px-3 py-1 rounded-full flex-row items-center gap-1.5 backdrop-blur-sm">
                            <ShieldCheck size={12} color="#fff" />
                            <Text className="text-white text-xs font-bold">Tin cậy: {Math.round(aiData.confidence)}%</Text>
                          </View>
                        )}
                      </View>

                      <View className="absolute bottom-3 right-3 bg-black/70 px-4 py-2 rounded-xl flex-row items-center gap-3 backdrop-blur-md border border-white/10">
                        <View className="items-center">
                          <Text className="text-emerald-400 text-[10px] font-bold">TỔNG SỐ BÁNH</Text>
                          <Text className="text-white text-lg font-black">{aiData.total_objects}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View className="w-full py-4 bg-slate-800/50 border-b border-slate-700 flex-row items-center justify-center gap-2">
                      <Activity size={16} color="#64748b" />
                      <Text className="text-slate-400 text-xs italic">Quét thủ công</Text>
                    </View>
                  )}

                  {/* THÔNG TIN & NHÃN "BÁNH ĐẠT CHUẨN" */}
                  <View className="p-5">
                    <View className="flex-row items-start justify-between">
                      <View>
                        <Text className="text-white text-lg font-bold mb-1">Mã mẻ: {String(record.id).split('-').pop()}</Text>
                        <Text className="text-slate-400 text-xs">Ghi nhận: {timeString} tại {record.location}</Text>
                        
                        {/* 🚀 TAG BÁNH ĐẠT CHUẨN ĐƯỢC THÊM VÀO ĐÂY */}
                        {aiData.is_detected && (
                          <View className="flex-row mt-3">
                            <View className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex-row items-center gap-1.5">
                              <CheckCircle2 size={16} color="#34d399" />
                              <Text className="text-emerald-400 text-xs font-bold"> Bánh đạt chuẩn</Text>
                            </View>
                          </View>
                        )}

                      </View>
                    </View>
                  </View>

                </View>
              );
            })}
          </View>
        </DataWrapper>
      </ScrollView>

      {/* Modal Fullscreen Ảnh */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-50 bg-slate-800 p-2 rounded-full"
            onPress={() => setSelectedImage(null)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={{ width: width, height: width * 1.5, resizeMode: 'contain' }} 
            />
          )}
          
          <Text className="absolute bottom-10 text-slate-400 text-sm">Hình ảnh trả về từ Model YOLOv8</Text>
        </View>
      </Modal>

    </SafeAreaView>
  );
}