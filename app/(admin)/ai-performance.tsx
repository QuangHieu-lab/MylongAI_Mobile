import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Target, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react-native';

export default function AiPerformanceScreen() {
  const router = useRouter();

  // Mock Data
  const aiConfidence = 96.8;
  const totalScans = "1,240";
  const falsePositives = 12; // Báo lỗi nhầm
  const falseNegatives = 8;  // Bỏ sót lỗi

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* HEADER */}
      <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700">
          <ChevronLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Hiệu suất & Độ tin cậy AI</Text>
          <Text className="text-purple-400 text-xs mt-0.5">YOLO Vision Performance</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* CARD TỔNG QUAN */}
        <View className="w-full bg-[#1e293b] p-6 rounded-[32px] border border-slate-700/50 shadow-lg mb-6 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          
          <View className="flex-row justify-between items-center mb-6 z-10">
            <View className="bg-purple-500/20 p-3 rounded-2xl border border-purple-500/30">
              <Target size={24} color="#c084fc" />
            </View>
            <BrainCircuit size={28} color="#64748b" />
          </View>

          <Text className="text-slate-400 text-sm font-semibold mb-1 z-10">Độ tin cậy tổng thể</Text>
          <View className="flex-row items-end gap-1 mb-4 z-10">
            <Text className="text-white text-6xl font-extrabold tracking-tight">{aiConfidence}</Text>
            <Text className="text-purple-400 text-2xl font-bold mb-1.5">%</Text>
          </View>

          <View className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700/50 z-10">
            <View className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${aiConfidence}%` }} />
          </View>
          
          <Text className="text-slate-400 text-xs z-10">Đánh giá trên <Text className="font-bold text-slate-200">{totalScans}</Text> mẻ bánh trong 30 ngày qua</Text>
        </View>

        {/* PHÂN TÍCH SAI SỐ */}
        <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Phân tích sai số (False Rates)</Text>
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
            <CheckCircle size={24} color="#34d399" className="mb-3" />
            <Text className="text-emerald-400/80 text-[10px] font-bold uppercase mb-1">Nhận diện đúng</Text>
            <Text className="text-emerald-500 font-extrabold text-2xl">1,220</Text>
          </View>
          <View className="flex-1 bg-rose-500/10 p-5 rounded-3xl border border-rose-500/20">
            <AlertTriangle size={24} color="#fb7185" className="mb-3" />
            <Text className="text-rose-400/80 text-[10px] font-bold uppercase mb-1">Sai lệch (Cần Train lại)</Text>
            <Text className="text-rose-500 font-extrabold text-2xl">{falsePositives + falseNegatives}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}