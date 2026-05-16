// app/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Sparkles, Eye, Shield, ArrowRight, BarChart3, Zap, Activity } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width, height } = Dimensions.get('window');

export default function Index() {
  const { user, isLoading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null); 
  
  // 🚀 Thêm state để điều khiển thời gian hiện Splash Screen
  const [showSplash, setShowSplash] = useState(true); 
  
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter(); 

  // 1. KIỂM TRA LẦN ĐẦU MỞ APP VÀ CHẠY SPLASH SCREEN
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        // Ép Splash Screen hiện ít nhất 1.5 giây để tạo hiệu ứng thị giác (giống app Acorns)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const value = await AsyncStorage.getItem('@viewedOnboarding');
        if (value !== null) {
          setIsFirstLaunch(false); // Đã xem
        } else {
          setIsFirstLaunch(true);  // Chưa xem (Lần đầu tải app)
        }
      } catch (err) {
        setIsFirstLaunch(true); 
      } finally {
        setShowSplash(false); // Chạy xong thì tắt Splash Screen
      }
    };
    
    checkAppStatus();
  }, []);

  // 2. HÀM XỬ LÝ KHI BẤM "BẮT ĐẦU GIÁM SÁT"
  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@viewedOnboarding', 'true');
    } catch (err) {
      console.log('Lỗi lưu trạng thái Onboarding', err);
    } finally {
      router.push('/(auth)/login');
    }
  };

  // ==========================================
  // 3. TRẠM KIỂM SOÁT ĐIỀU HƯỚNG (ROUTE GUARDS)
  // ==========================================
  
  // 🚀 MÀN HÌNH SPLASH SCREEN (Thay thế cho ActivityIndicator)
  if (showSplash || isLoading || isFirstLaunch === null) {
    return (
      <View className="flex-1 bg-[#0A0E27] items-center justify-center">
        {/* Khung Logo phát sáng */}
        <View className="w-24 h-24 rounded-3xl bg-sky-500 items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.5)] mb-6 border border-sky-400/30">
          <Activity size={48} color="#0A0E27" strokeWidth={2.5} />
        </View>
        
        {/* Tên App */}
        <Text className="text-white text-4xl font-extrabold tracking-widest">
          MYLONG<Text className="text-sky-500">AI</Text>
        </Text>
        
        {/* Slogan nhỏ */}
        <Text className="text-slate-500 text-xs tracking-[0.3em] uppercase mt-3 font-semibold">
          BatchGuard System
        </Text>
      </View>
    );
  }

  // - Đã đăng nhập -> Vào thẳng Dashboard
  if (user) {
    return <Redirect href="/(dashboard)/home" />;
  }

  // - Chưa đăng nhập MÀ đã từng xem Onboarding -> Đá thẳng ra trang Login (Bỏ qua slide)
  if (!isFirstLaunch) {
    return <Redirect href="/(auth)/login" />;
  }

  // ==========================================
  // 4. HIỂN THỊ GIAO DIỆN ONBOARDING (DÀNH CHO LẦN ĐẦU)
  // ==========================================
  const slides = [
    {
      id: 1,
      title: "Từ Kinh Nghiệm\nĐến Dự Đoán",
      desc: "Hệ thống Camera AI tự động phát hiện và dự báo tiến độ phơi bánh tráng Mỹ Lồng.",
      icon: <Zap size={60} color="#38bdf8" />,
    },
    {
      id: 2,
      title: "Công nghệ AI\nTiên tiến",
      desc: "Tự động nhận diện mẻ bánh mới trong < 2 giây với độ chính xác lên đến 95%.",
      icon: <Eye size={60} color="#22d3ee" />,
    },
    {
      id: 3,
      title: "Giảm thiểu\n40% Rủi ro",
      desc: "Đồng bộ dữ liệu thời tiết thời gian thực để đưa ra cảnh báo thu bánh kịp thời.",
      icon: <Shield size={60} color="#38bdf8" />,
    }
  ];

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setCurrentSlide(index);
  };

  return (
    <View className="flex-1 bg-[#0A0E27]">
      {/* Header Logo Onboarding */}
      <View className="absolute top-12 left-0 right-0 z-50 flex-row items-center justify-center gap-2">
        <View className="w-8 h-8 bg-sky-500 rounded-lg items-center justify-center">
          <BarChart3 size={18} color="#0A0E27" />
        </View>
        <Text className="text-white font-bold text-xl tracking-widest">MYLONGAI</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* RENDER 3 SLIDE ĐẦU */}
        {slides.map((slide) => (
          <View key={slide.id} style={{ width, height }} className="items-center justify-center px-8">
            <View className="mb-10 bg-sky-500/10 p-10 rounded-full border border-sky-500/20">
              {slide.icon}
            </View>
            <Text className="text-4xl font-bold text-white text-center mb-4 leading-tight">
              {slide.title}
            </Text>
            <Text className="text-lg text-slate-400 text-center leading-6 max-w-sm">
              {slide.desc}
            </Text>
          </View>
        ))}

        {/* 🚀 SLIDE CUỐI CÙNG */}
        <View style={{ width, height }} className="items-center justify-center px-6">
          <View className="w-full items-center mb-10">
            <Sparkles size={60} color="#38bdf8" />
            <Text className="text-4xl font-bold text-white mt-6 mb-2">Sẵn sàng chưa?</Text>
            <Text className="text-slate-400 text-center text-lg px-4 mb-10">
              Bảo vệ mẻ bánh của bạn bằng sức mạnh AI ngay hôm nay.
            </Text>
            
            <View className="w-full max-w-sm space-y-4">
              <TouchableOpacity 
                onPress={handleFinishOnboarding} 
                className="w-full bg-sky-500 py-4 rounded-2xl items-center shadow-lg shadow-sky-500/30 mb-4"
              >
                <Text className="text-[#0A0E27] font-bold text-lg">
                  Bắt đầu giám sát
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleFinishOnboarding} 
                className="w-full bg-transparent border-2 border-slate-700 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Tôi đã có tài khoản
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* THANH ĐIỀU HƯỚNG BÊN DƯỚI (Dots & Nút Next) */}
      {currentSlide < 3 && (
        <View className="absolute bottom-12 left-0 right-0 items-center">
          <View className="flex-row items-center justify-between w-full px-10">
            <View className="flex-row gap-2">
              {[0, 1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-sky-500' : 'w-2 bg-slate-700'}`} 
                />
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => scrollRef.current?.scrollTo({ x: (currentSlide + 1) * width })}
              className="bg-sky-500 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-sky-500/40"
            >
              <ArrowRight size={24} color="#0A0E27" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}