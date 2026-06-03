import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sun, Moon, ArrowRight, Thermometer, Droplets, Clock, Calendar } from 'lucide-react-native';

export default function DryingCyclesScreen() {
  const router = useRouter();

  // Mock Data: Danh sách chu kỳ
  const cycles = [
    { id: 1, date: "Hôm nay", timeOut: "07:30", timeIn: "11:45", duration: "4h 15m", avgTemp: 36.5, avgHumid: 48 },
    { id: 2, date: "Hôm qua", timeOut: "08:00", timeIn: "13:10", duration: "5h 10m", avgTemp: 34.2, avgHumid: 55 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* HEADER */}
      <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700">
          <ChevronLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Chu kỳ phơi bánh</Text>
          <Text className="text-cyan-400 text-xs mt-0.5">Theo dõi lịch trình & môi trường</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Lịch sử chu kỳ phơi</Text>

        {cycles.map((cycle, index) => (
          <View key={cycle.id} className="w-full bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg mb-6">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-slate-300 font-bold text-xs">{cycle.date}</Text>
              </View>
            </View>

            {/* Timeline */}
            <View className="flex-row items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-4 relative">
              <View className="items-center z-10 bg-slate-800/80 px-2 rounded-lg">
                <Sun size={24} color="#fcd34d" className="mb-1.5" />
                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Bánh ra sân</Text>
                <Text className="text-white font-bold text-xl">{cycle.timeOut}</Text>
              </View>

              <View className="flex-1 px-2 items-center justify-center absolute left-0 right-0">
                <View className="w-full border-t-2 border-dashed border-slate-600 absolute top-1/2" />
                <View className="bg-[#0f172a] px-3 py-1.5 rounded-full z-10 flex-row items-center gap-1.5 border border-slate-600 shadow-md">
                  <Clock size={10} color="#22d3ee" />
                  <Text className="text-cyan-400 text-[10px] font-bold">{cycle.duration}</Text>
                </View>
              </View>

              <View className="items-center z-10 bg-slate-800/80 px-2 rounded-lg">
                <Moon size={24} color="#818cf8" className="mb-1.5" />
                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Bánh vào kho</Text>
                <Text className="text-white font-bold text-xl">{cycle.timeIn}</Text>
              </View>
            </View>

            {/* Thông số môi trường */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-orange-500/10 p-3.5 rounded-2xl border border-orange-500/20 flex-row items-center gap-3">
                <Thermometer size={20} color="#f97316" />
                <View>
                  <Text className="text-orange-400/80 text-[10px] font-bold uppercase mb-0.5">Nhiệt độ TB</Text>
                  <Text className="text-orange-500 font-extrabold text-base">{cycle.avgTemp}°C</Text>
                </View>
              </View>

              <View className="flex-1 bg-blue-500/10 p-3.5 rounded-2xl border border-blue-500/20 flex-row items-center gap-3">
                <Droplets size={20} color="#3b82f6" />
                <View>
                  <Text className="text-blue-400/80 text-[10px] font-bold uppercase mb-0.5">Độ ẩm TB</Text>
                  <Text className="text-blue-500 font-extrabold text-base">{cycle.avgHumid}%</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}