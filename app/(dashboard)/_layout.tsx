import { Tabs } from 'expo-router';
import { Home, Camera, Settings, BrainCircuit } from 'lucide-react-native';

export default function DashboardLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, // Ẩn thanh tiêu đề mặc định ở trên cùng
        tabBarActiveTintColor: '#9333ea', // Màu khi tab được chọn (Màu tím)
        tabBarInactiveTintColor: '#64748b', // Màu khi tab không được chọn (Xám)
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {/* Tab 1: Tổng quan (Home) */}
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Tổng quan',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }} 
      />

      {/* Tab 2: Camera Giám sát */}
      <Tabs.Screen 
        name="camera" 
        options={{ 
          title: 'Camera',
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />
        }} 
      />

      {/* Tab 3: Nhận diện AI (YOLO) */}
      <Tabs.Screen 
        name="ai-detect" 
        options={{ 
          title: 'YOLO AI',
          tabBarIcon: ({ color }) => <BrainCircuit size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="realtime-scan" 
        options={{ 
          href: null, // BÍ QUYẾT LÀ ĐÂY: Dòng này giúp giấu Tab này khỏi thanh Bottom Bar!
          headerShown: false,
          tabBarStyle: { display: 'none' } // Tắt luôn thanh menu dưới đáy khi đang mở Camera cho rộng
        }} 
      />
      
    </Tabs>
  );
}