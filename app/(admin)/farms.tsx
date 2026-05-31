import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Map, Wifi, Battery, Camera } from 'lucide-react-native';

const ZONES = [
  { id: '1', name: 'Sân phơi Khu A', cameras: 2, sensors: 'Online',  status: 'active' },
  { id: '2', name: 'Sân phơi Khu B', cameras: 3, sensors: 'Online',  status: 'active' },
  { id: '3', name: 'Lò Sấy Công Nghiệp', cameras: 1, sensors: 'Offline',  status: 'warning' },
];

export default function FarmsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      <View className="px-6 py-4 flex-row items-center gap-3 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Khu vực & Thiết bị</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Trạng thái hạ tầng</Text>

        {ZONES.map(zone => (
          <View key={zone.id} className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 mb-4 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <View className={`p-3 rounded-2xl ${zone.status === 'active' ? 'bg-blue-500/20' : 'bg-rose-500/20'}`}>
                  <Map size={20} color={zone.status === 'active' ? '#60a5fa' : '#f43f5e'} />
                </View>
                <Text className="text-white font-bold text-lg">{zone.name}</Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <View className="items-center">
                <Camera size={16} color="#94a3b8" className="mb-1" />
                <Text className="text-white font-bold">{zone.cameras} Cam</Text>
              </View>
              <View className="w-[1px] h-full bg-slate-700" />
              <View className="items-center">
                <Wifi size={16} color={zone.sensors === 'Online' ? '#34d399' : '#f43f5e'} className="mb-1" />
                <Text className={zone.sensors === 'Online' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{zone.sensors}</Text>
              </View>         
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}