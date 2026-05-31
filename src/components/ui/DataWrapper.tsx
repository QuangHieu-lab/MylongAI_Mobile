import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCcw } from 'lucide-react-native';

interface DataWrapperProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
}

export default function DataWrapper({ 
  isLoading, 
  error, 
  onRetry, 
  children,
  loadingMessage = "Đang tải dữ liệu..."
}: DataWrapperProps) {
  
  // 1. Nếu đang load -> Hiện vòng xoay
  if (isLoading) {
    return (
      <View className="py-12 items-center justify-center min-h-[200px]">
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text className="text-slate-400 mt-4 text-sm font-medium">{loadingMessage}</Text>
      </View>
    );
  }

  // 2. Nếu có lỗi -> Hiện thông báo đỏ kèm nút Thử lại
  if (error) {
    return (
      <View className="py-6">
        <View className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-3xl items-center justify-center">
          <AlertTriangle size={40} color="#fb7185" className="mb-3" />
          <Text className="text-rose-400 font-bold text-lg mb-2">Đã xảy ra lỗi</Text>
          <Text className="text-slate-400 text-center text-sm mb-6 px-4">{error}</Text>
          <TouchableOpacity 
            onPress={onRetry}
            className="bg-rose-500/20 px-6 py-2.5 rounded-xl border border-rose-500/50 flex-row items-center gap-2"
          >
            <RefreshCcw size={16} color="#fb7185" />
            <Text className="text-rose-400 font-bold">Thử lại ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Nếu thành công -> Render nội dung bên trong
  return <>{children}</>;
}