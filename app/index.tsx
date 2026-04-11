import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, Play, Pause, RotateCcw, TrendingUp, 
  Thermometer, Droplets, Wind, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Activity 
} from 'lucide-react-native';

// Import từ thư mục src/ của bạn
import { useSimulation } from '../src/hooks/useSimulation';
import { getRiskStyle, getRiskLabel, formatTime } from '../src/utils/demo';

export default function DemoDashboard() {
  const { 
    isRunning, 
    simulation, 
    handleStart, 
    handlePause, 
    handleReset 
  } = useSimulation();

  const riskStyle = getRiskStyle(simulation.riskLevel);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-lg font-bold text-gray-900">MYLONGAI</Text>
              <View className="flex-row items-center gap-1 px-1.5 py-0.5 bg-purple-100 rounded">
                <Sparkles size={10} color="#7e22ce" />
                <Text className="text-[10px] font-bold text-purple-700">DEMO</Text>
              </View>
            </View>
            <Text className="text-[11px] text-gray-500 font-medium">Mô phỏng phơi bánh</Text>
          </View>
        </View>
        
        {isRunning && (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <View className="w-2 h-2 bg-emerald-500 rounded-full" />
            <Text className="text-[11px] font-semibold text-emerald-700">Live</Text>
          </View>
        )}
      </View>

      {/* Main Scroll Content */}
      <ScrollView className="flex-1 px-4 pt-5 pb-24">
        
        {/* Intro Section */}
        {simulation.dryingProgress === 0 && !isRunning && (
          <View className="bg-purple-50 border border-purple-100 rounded-2xl p-6 items-center shadow-sm">
            <View className="w-16 h-16 bg-purple-600 rounded-2xl items-center justify-center mb-4">
              <Play size={32} color="white" fill="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">Demo BatchGuard</Text>
            <Text className="text-sm text-gray-600 text-center mb-6 leading-5">
              Trải nghiệm hệ thống AI theo dõi quá trình phơi bánh tráng thực tế. Giám sát rủi ro thời tiết tự động.
            </Text>
            <TouchableOpacity 
              onPress={handleStart}
              className="w-full bg-purple-600 py-3.5 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Play size={20} color="white" fill="white" className="mr-2" />
              <Text className="text-white font-semibold text-base">Bắt đầu mô phỏng</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dashboard */}
        {simulation.dryingProgress > 0 && (
          <View className="space-y-4">
            
            {/* AI Status */}
            {isRunning && (
              <View className="flex-row items-center justify-between p-3 bg-cyan-50 border border-cyan-100 rounded-xl mb-4">
                <View className="flex-row items-center gap-2">
                  <Activity size={18} color="#0891b2" />
                  <Text className="text-sm font-semibold text-cyan-900">AI đang phân tích dữ liệu cảm biến...</Text>
                </View>
              </View>
            )}

            {/* Progress Card */}
            <View className={`bg-white border ${riskStyle.border} rounded-2xl overflow-hidden shadow-sm mb-4`}>
              <View className="p-5">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2">
                    <TrendingUp size={18} color="#4b5563" />
                    <Text className="text-sm font-semibold text-gray-600">Độ khô hiện tại</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-md ${riskStyle.bg} border ${riskStyle.border}`}>
                    <Text className={`text-xs font-semibold ${riskStyle.text}`}>{getRiskLabel(simulation.riskLevel)}</Text>
                  </View>
                </View>

                <View className="flex-row items-end gap-1 mb-4">
                  <Text className={`text-6xl font-bold ${riskStyle.text}`}>{simulation.dryingProgress}</Text>
                  <View className="pb-1">
                    <Text className="text-2xl font-bold text-gray-400">%</Text>
                  </View>
                </View>

                <View className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                  <View 
                    style={{ width: `${simulation.dryingProgress}%` }} 
                    className="h-full bg-cyan-500 rounded-full" 
                  />
                </View>

                {simulation.estimatedTimeRemaining > 0 && simulation.dryingProgress < 100 && (
                  <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <View className="flex-row items-center gap-2">
                      <Clock size={16} color="#475569" />
                      <Text className="text-xs font-medium text-slate-600">Dự kiến hoàn thành sau</Text>
                    </View>
                    <Text className="text-lg font-bold text-slate-800">{formatTime(simulation.estimatedTimeRemaining)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Metrics Row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <Thermometer size={20} color="#f97316" className="mb-2" />
                <Text className="text-xs text-gray-600 mb-1">Nhiệt độ</Text>
                <Text className="text-2xl font-bold text-gray-900">{simulation.temperature}°C</Text>
              </View>
              <View className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <Droplets size={20} color="#3b82f6" className="mb-2" />
                <Text className="text-xs text-gray-600 mb-1">Độ ẩm</Text>
                <Text className="text-2xl font-bold text-gray-900">{simulation.humidity}%</Text>
              </View>
            </View>

            {/* Wind Metrics */}
            <View className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Wind size={20} color="#64748b" />
                <Text className="text-sm text-gray-600">Tốc độ gió</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">{simulation.windSpeed} km/h</Text>
            </View>

            {/* Risk Alert Box */}
            <View className={`p-4 rounded-xl border ${riskStyle.border} ${riskStyle.bg} flex-row gap-3`}>
              <View className="mt-1">
                {simulation.riskLevel === 'complete' ? (
                  <CheckCircle2 size={24} color="#059669" />
                ) : (
                  <AlertTriangle size={24} color="#e11d48" />
                )}
              </View>
              <View className="flex-1 flex-col">
                <Text className={`text-base font-bold mb-1 ${riskStyle.text}`}>{simulation.riskMessage}</Text>
                <Text className="text-sm text-gray-700 leading-5"><Text className="font-bold">Gợi ý AI:</Text> {simulation.recommendation}</Text>
              </View>
            </View>

          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Controls */}
      {simulation.dryingProgress > 0 && (
        <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-4 py-4 pb-8 flex-row gap-3 shadow-lg">
          <TouchableOpacity 
            onPress={isRunning ? handlePause : handleStart}
            className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${isRunning ? 'bg-amber-500' : 'bg-emerald-500'}`}
          >
            {isRunning ? (
              <><Pause size={20} color="white" fill="white" className="mr-2" /><Text className="text-white font-bold text-base">Tạm dừng</Text></>
            ) : (
              <><Play size={20} color="white" fill="white" className="mr-2" /><Text className="text-white font-bold text-base">Tiếp tục</Text></>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleReset}
            className="px-5 py-3.5 bg-gray-100 rounded-xl items-center justify-center border border-gray-200"
          >
            <RotateCcw size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}