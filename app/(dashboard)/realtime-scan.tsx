import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Scan, Camera } from 'lucide-react-native';

export default function RealtimeScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header với nút Back */}
      <View className="flex-row items-center justify-between p-4 z-50">
        <TouchableOpacity 
          onPress={() => router.back()} // Nút quay lại trang Tải ảnh
          className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700"
        >
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Quét AI Trực tiếp</Text>
        <View className="w-10" /> {/* Spacer để cân bằng layout */}
      </View>

      {/* Khung Camera Quét (Sau này bạn tích hợp Camera thật vào đây) */}
      <View className="flex-1 justify-center items-center">
        <View className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-3xl items-center justify-center bg-emerald-400/10 relative">
          {/* Các góc ngắm của Camera */}
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
          
          <Scan size={48} color="#34d399" className="opacity-50" />
          <Text className="text-emerald-400 mt-4 font-mono font-bold text-xs">ĐANG TÌM MẺ BÁNH...</Text>
        </View>
      </View>

      {/* Nút chụp/Quét */}
      <View className="pb-10 pt-4 items-center">
        <TouchableOpacity className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center border-4 border-slate-800 shadow-xl">
          <Camera size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}