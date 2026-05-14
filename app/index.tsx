// app/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Sparkles, Eye, Shield, ArrowRight, BarChart3, Zap } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; //  Import AsyncStorage

const { width, height } = Dimensions.get('window');

export default function Index() {
  const { user, isLoading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null); //  Thêm state kiểm tra lần đầu
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter(); 

  // 1. KIỂM TRA LẦN ĐẦU MỞ APP
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@viewedOnboarding');
        if (value !== null) {
          // Đã từng xem rồi -> Không phải lần đầu
          setIsFirstLaunch(false);
        } else {
          // Chưa từng xem -> Là lần đầu
          setIsFirstLaunch(true);
        }
      } catch (err) {
        setIsFirstLaunch(true); // Lỗi thì cứ cho xem mặc định
      }
    };
    checkOnboardingStatus();
  }, []);

  // 2. HÀM XỬ LÝ KHI BẤM "BẮT ĐẦU GIÁM SÁT"
  const handleFinishOnboarding = async () => {
    try {
      // Đánh dấu là đã xem Onboarding vào bộ nhớ
      await AsyncStorage.setItem('@viewedOnboarding', 'true');
    } catch (err) {
      console.log('Lỗi lưu trạng thái Onboarding', err);
    } finally {
      // Chuyển sang trang Đăng nhập
      router.push('/(auth)/login');
    }
  };

  // 3. TRẠM KIỂM SOÁT ĐIỀU HƯỚNG (ROUTE GUARDS)
  
  // - Đang tải dữ liệu Auth hoặc đang đọc AsyncStorage -> Hiện Loading
  if (isLoading || isFirstLaunch === null) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0E27]">
        <ActivityIndicator size="large" color="#38bdf8" />
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

  // Cấu hình nội dung 3 Slide đầu
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

  // 4. HIỂN THỊ GIAO DIỆN ONBOARDING CHO NGƯỜI MỚI
  return (
    <View className="flex-1 bg-[#0A0E27]">
      {/* ... (Phần Header Logo giữ nguyên) ... */}
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
              {/* SỬA NÚT NÀY: Gọi hàm handleFinishOnboarding */}
              <TouchableOpacity 
                onPress={handleFinishOnboarding} 
                className="w-full bg-sky-500 py-4 rounded-2xl items-center shadow-lg shadow-sky-500/30"
              >
                <Text className="text-navy-950 font-bold text-lg">
                  Bắt đầu giám sát
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleFinishOnboarding} 
                className="w-full bg-transparent border-2 border-slate-700 py-4 rounded-2xl items-center mt-4"
              >
                <Text className="text-white font-bold text-lg">
                  Tạo tài khoản mới
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* THANH ĐIỀU HƯỚNG BÊN DƯỚI */}
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