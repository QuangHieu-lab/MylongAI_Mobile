import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Modal, 
  ActivityIndicator, RefreshControl, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, Wifi, Camera, X, PlayCircle, WifiOff, 
  MapPin, Plus, Trash2, Edit, StopCircle, User, Link2, ChevronDown 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// 🚀 IMPORT LIVEKIT 
import { Room, RoomEvent, VideoTrack } from 'livekit-client';
import { VideoView } from '@livekit/react-native';

// 🚀 IMPORT API THẬT
import { cameraApi, userApi } from '@/src/services/api';

// ============================================================================
// COMPONENT: TRẠM THU PHÁT LIVEKIT 
// ============================================================================
const LiveKitVideoPlayer = ({ cameraId }: { cameraId: string }) => {
  const roomRef = useRef<Room | null>(null);
  const [videoTrack, setVideoTrack] = useState<VideoTrack | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [statusMessage, setStatusText] = useState('Đang xin cấp Token...');

  useEffect(() => {
    let isMounted = true;

    const connectLiveKit = async () => {
      try {
        if (!cameraId || cameraId.trim() === '') {
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Chưa cấu hình Camera ID');
          }
          return;
        }

        const signalUrl = process.env.EXPO_PUBLIC_WEBRTC_SIGNAL_URL || 'https://camera-relay-v5.onrender.com';
        const roomName = "mylongai"; 

        const response = await fetch(`${signalUrl}/api/cameras/${cameraId}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: `admin_mobile_${Math.random().toString(36).substring(7)}`,
            room_name: roomName,
            is_publisher: false
          })
        });

        if (!response.ok) throw new Error(`Lỗi kết nối`);
        const { token, server_url } = await response.json();

        if (!isMounted) return;
        setStatusText('Đang vào phòng LiveKit...');

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === 'video' && isMounted) {
            setVideoTrack(track as VideoTrack);
            setConnectionStatus('online');
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === 'video' && isMounted) {
            setVideoTrack(null);
            setConnectionStatus('offline');
            setStatusText('Camera xưởng đã dừng phát');
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (isMounted) {
            setVideoTrack(null);
            setConnectionStatus('offline');
            setStatusText('Mất kết nối tới máy chủ');
          }
        });

        await room.connect(server_url, token);
        setStatusText('Đang đợi hình ảnh...');

        setTimeout(() => {
          if (isMounted && room.state === 'connected' && !videoTrack) {
            setStatusText('Chưa có luồng từ xưởng (Kiểm tra Laptop)');
            setConnectionStatus('offline');
          }
        }, 12000);

      } catch (err: any) {
        if (isMounted) {
          setConnectionStatus('offline');
          setStatusText('Máy chủ bận / Sai Camera ID');
        }
      }
    };

    connectLiveKit();

    return () => {
      isMounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [cameraId]); 

  return (
    <View className="flex-1 bg-black items-center justify-center overflow-hidden">
      {connectionStatus === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-black/80 z-10">
          <ActivityIndicator size="large" color="#0ea5e9" className="mb-3" />
          <Text className="text-cyan-400 text-sm font-medium">{statusMessage}</Text>
        </View>
      )}
      
      {connectionStatus === 'offline' && (
        <View className="absolute inset-0 items-center justify-center bg-black/80 z-10">
          <WifiOff size={36} color="#f43f5e" className="mb-3 opacity-80" />
          <Text className="text-slate-400 text-sm font-medium text-center px-4">{statusMessage}</Text>
        </View>
      )}

      {videoTrack && connectionStatus === 'online' && (
        <VideoView 
          videoTrack={videoTrack} 
          style={{ width: '100%', height: '100%' }} 
          objectFit="contain"
        />
      )}
    </View>
  );
};

// ============================================================================
// SCREEN CHÍNH: QUẢN LÝ HỘ KINH DOANH
// ============================================================================
export default function FarmsScreen() {
  const router = useRouter();
  
  // 🚀 STATE ĐỒNG BỘ TỪ BẢN WEB
  const [households, setHouseholds] = useState<any[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedHousehold, setSelectedHousehold] = useState<any | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  // State Quản lý Form Thêm/Sửa Camera
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', location: '', stream_url: '', user_id: ''
  });

  // 🚀 HÀM GỌI API & NHÓM DỮ LIỆU
  const fetchHouseholds = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [usersRes, camerasRes]: [any, any] = await Promise.all([
        userApi.getAll(),
        cameraApi.getAll()
      ]);
      
      const usersData = usersRes?.data?.data || usersRes?.data || usersRes || [];
      const camerasData = camerasRes?.data?.data || camerasRes?.data || camerasRes || [];
      setRawUsers(usersData);

      const userCamerasMap = new Map();
      camerasData.forEach((cam: any) => {
        const uid = cam.user_id || cam.userId; 
        if (!uid) return; 
        
        if (!userCamerasMap.has(uid)) {
          userCamerasMap.set(uid, []);
        }
        userCamerasMap.get(uid).push(cam);
      });

      usersData.forEach((u: any) => {
        if (!userCamerasMap.has(u.id) && u.role !== 'admin') {
          userCamerasMap.set(u.id, []);
        }
      });

      const activeHouseholds: any[] = [];

      userCamerasMap.forEach((cams, uid) => {
        const userInfo = usersData.find((u: any) => u.id === uid);
        if (!userInfo || userInfo.role === 'admin') return; 

        activeHouseholds.push({
          id: uid,
          name: userInfo.full_name || userInfo.name || 'Khách hàng ẩn danh',
          email: userInfo.email || `ID: ${uid.substring(0, 8)}...`, 
          camerasCount: cams.length,
          sensors: cams.length > 0 ? 'Online' : 'Offline',
          status: (userInfo.role === 'disabled' || userInfo.status === 'inactive') ? 'inactive' : 'active',
          cameraList: cams.map((cam: any) => ({
            id: cam.id || cam._id,
            name: cam.camera_name || cam.name || 'Camera không tên', 
            location: cam.location || 'Chưa cập nhật vị trí',
            streamUrl: cam.stream_url || cam.streamUrl || '', 
            status: cam.status
          }))
        });
      });
      
      setHouseholds(activeHouseholds);
      
      setSelectedHousehold((prev: any) => {
        if (!prev) return null;
        return activeHouseholds.find(h => h.id === prev.id) || prev;
      });
      
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Lỗi tải danh sách tài khoản và camera' });
    } finally {
      if (!quiet) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHouseholds(false);
  };

  // ==================== CÁC HÀM XỬ LÝ (CRUD CAMERA) ====================
  const openAddCameraModal = (userId = '') => {
    setIsEditing(false);
    setFormData({ id: '', name: '', location: '', stream_url: '', user_id: userId });
    setIsFormModalOpen(true);
  };

  const openEditCameraModal = (cam: any, userId: string) => {
    setIsEditing(true);
    setFormData({
      id: cam.id,
      name: cam.name,
      location: cam.location,
      stream_url: cam.streamUrl,
      user_id: userId
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteCamera = (camId: string) => {
    Alert.alert(
      "Cảnh báo",
      "Bạn có chắc chắn muốn xóa Camera này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              await cameraApi.delete(camId);
              Toast.show({ type: 'success', text1: 'Đã xóa Camera thành công!' });
              if (activeStreamId === camId) setActiveStreamId(null);
              await fetchHouseholds(true);
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Xóa Camera thất bại' });
            }
          }
        }
      ]
    );
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.stream_url || !formData.user_id) {
      Toast.show({ type: 'error', text1: 'Vui lòng điền đủ Tên, Link RTSP/ID và chọn Hộ kinh doanh!' });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        stream_url: formData.stream_url, 
        user_id: formData.user_id
      };

      if (isEditing) {
        await cameraApi.update(formData.id, payload);
        Toast.show({ type: 'success', text1: 'Đã cập nhật cấu hình Camera!' });
      } else {
        await cameraApi.create(payload);
        Toast.show({ type: 'success', text1: 'Đã cấu hình Camera mới cho Hộ kinh doanh!' });
      }

      setIsFormModalOpen(false);
      await fetchHouseholds(true); 
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Có lỗi xảy ra khi lưu Camera' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Hộ Kinh Doanh Làng Nghề</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Giám sát & Quản lý AI Camera</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => openAddCameraModal()}
          className="bg-cyan-600 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-cyan-500/30"
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* DANH SÁCH HỘ KINH DOANH */}
      <ScrollView 
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">Danh sách tài khoản khách hàng</Text>
          <View className="bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            <Text className="text-xs font-medium text-cyan-400">Tổng: {households.length} Hộ</Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text className="text-slate-400 mt-4 text-sm font-medium">Đang đồng bộ dữ liệu từ máy chủ...</Text>
          </View>
        ) : households.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700/50 border-dashed">
            <User size={48} color="#475569" className="mb-4" />
            <Text className="text-slate-400 font-medium">Chưa có Khách hàng nào trên hệ thống</Text>
          </View>
        ) : (
          households.map((house) => (
            <TouchableOpacity 
              key={house.id} 
              activeOpacity={0.8}
              onPress={() => setSelectedHousehold(house)}
              className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 mb-4 shadow-lg"
            >
              <View className="flex-row items-center gap-4 mb-4">
                <View className={`p-3.5 rounded-2xl ${house.status === 'active' ? 'bg-blue-500/20' : 'bg-rose-500/20'}`}>
                  <User size={24} color={house.status === 'active' ? '#60a5fa' : '#f43f5e'} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{house.name}</Text>
                  <View className="flex-row items-center gap-1.5">
                    <View className={`w-2 h-2 rounded-full ${house.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      {house.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-4">
                <MapPin size={14} color="#64748b" />
                <Text className="text-sm text-slate-500 flex-1" numberOfLines={1}>{house.email}</Text>
              </View>

              <View className="flex-row justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <View className="items-center flex-1">
                  <Camera size={16} color="#94a3b8" className="mb-1" />
                  <Text className="text-white font-bold">{house.camerasCount}</Text>
                  <Text className="text-slate-500 text-[10px]">Camera</Text>
                </View>
                <View className="w-[1px] h-full bg-slate-700" />
                <View className="items-center flex-1">
                  <Wifi size={16} color={house.sensors === 'Online' ? '#34d399' : '#475569'} className="mb-1" />
                  <Text className={`font-bold ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {house.camerasCount > 0 ? house.sensors : '--'}
                  </Text>
                  <Text className="text-slate-500 text-[10px]">Cảm biến</Text>
                </View>        
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ================= MODAL QUẢN LÝ CAMERA CHI TIẾT CỦA HỘ ================= */}
      <Modal 
        visible={!!selectedHousehold} 
        animationType="slide" 
        presentationStyle="pageSheet" 
        onRequestClose={() => { setSelectedHousehold(null); setActiveStreamId(null); }}
      >
        <SafeAreaView className="flex-1 bg-[#0B1121]" edges={['top']}>
          {selectedHousehold && (
            <>
              {/* Header Modal */}
              <View className="flex-row items-center justify-between p-4 border-b border-slate-800 bg-[#0B1121] z-10">
                <View className="flex-row items-center gap-3 flex-1 pr-4">
                  <View className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Camera size={20} color="#22d3ee" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>Hộ: {selectedHousehold.name}</Text>
                    <Text className="text-cyan-400 text-xs">{selectedHousehold.email} • {selectedHousehold.cameraList.length} Camera</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => openAddCameraModal(selectedHousehold.id)} className="w-10 h-10 bg-emerald-600/20 rounded-full items-center justify-center border border-emerald-600/30">
                    <Plus size={20} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setSelectedHousehold(null); setActiveStreamId(null); }} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center">
                    <X size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Danh sách Camera của Hộ */}
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {selectedHousehold.cameraList.length === 0 ? (
                  <View className="py-20 items-center justify-center border border-dashed border-slate-700 rounded-2xl mt-10">
                    <Camera size={48} color="#475569" className="mb-4" />
                    <Text className="text-slate-400">Hộ này chưa có Camera nào được thiết lập.</Text>
                    <Text className="text-slate-500 text-xs mt-2">Bấm nút "Thêm Camera" ở góc trên để cấu hình.</Text>
                  </View>
                ) : (
                  <View className="gap-5">
                    {selectedHousehold.cameraList.map((cam: any) => (
                      <View key={cam.id} className={`bg-[#1e293b] rounded-2xl overflow-hidden border ${activeStreamId === cam.id ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-700'}`}>
                        {/* Info & Nút Sửa/Xóa */}
                        <View className="p-4 bg-slate-800/40 flex-row justify-between items-start">
                          <View className="flex-1 pr-2">
                            <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{cam.name}</Text>
                            <View className="flex-row items-center gap-1">
                              <MapPin size={12} color="#94a3b8" />
                              <Text className="text-slate-400 text-xs" numberOfLines={1}>{cam.location}</Text>
                            </View>
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => openEditCameraModal(cam, selectedHousehold.id)} className="p-2 bg-slate-700 rounded-lg">
                              <Edit size={16} color="#38bdf8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteCamera(cam.id)} className="p-2 bg-slate-700 rounded-lg">
                              <Trash2 size={16} color="#f43f5e" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        {/* Khung Player */}
                        <View className="w-full aspect-video bg-black relative border-t border-slate-800">
                          {activeStreamId === cam.id ? (
                            <>
                              <LiveKitVideoPlayer cameraId={cam.streamUrl} />
                              <TouchableOpacity 
                                onPress={() => setActiveStreamId(null)}
                                className="absolute top-2 right-2 z-20 flex-row items-center gap-1 px-3 py-1.5 bg-rose-500 rounded-lg shadow-lg"
                              >
                                <StopCircle size={14} color="#fff" />
                                <Text className="text-white text-xs font-bold">ĐÓNG</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity 
                              activeOpacity={0.8}
                              onPress={() => setActiveStreamId(cam.id)}
                              className="absolute inset-0 items-center justify-center bg-slate-900/50"
                            >
                              <PlayCircle size={48} color="#22d3ee" opacity={0.8} />
                              <View className="absolute top-2 right-2 flex-row items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-slate-700">
                                <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <Text className="text-[10px] text-slate-300 font-bold uppercase">Sẵn sàng</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                          <View className="absolute bottom-2 left-2 right-2 flex-row justify-between bg-black/60 px-2 py-1 rounded pointer-events-none z-10">
                            <Text className="text-[10px] text-white/50 font-mono truncate flex-1">{cam.streamUrl || 'Chưa thiết lập ID'}</Text>
                            <Text className="text-[10px] text-cyan-400 font-bold ml-2">LiveKit ⚡</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 🚀 MODAL FORM: THÊM / SỬA CAMERA                                          */}
      {/* ========================================================================= */}
      <Modal visible={isFormModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center px-5">
          <View className="bg-[#1e293b] rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <Text className="text-xl font-bold text-white mb-6 flex-row items-center">
              <Link2 size={20} color="#22d3ee" className="mr-2" /> 
              {isEditing ? ' Cập nhật Camera' : ' Khai báo Camera ID'}
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-sm text-slate-400 mb-2 font-medium">Tên Camera</Text>
                <TextInput 
                  value={formData.name} onChangeText={t => setFormData({...formData, name: t})}
                  placeholder="Nhập tên Camera..." placeholderTextColor="#64748b"
                  className="bg-[#0f172a] text-white p-4 rounded-xl border border-slate-700"
                />
              </View>

              <View>
                <Text className="text-sm text-slate-400 mb-2 font-medium">Vị trí / Khu vực</Text>
                <TextInput 
                  value={formData.location} onChangeText={t => setFormData({...formData, location: t})}
                  placeholder="VD: Sân phơi bánh 1..." placeholderTextColor="#64748b"
                  className="bg-[#0f172a] text-white p-4 rounded-xl border border-slate-700"
                />
              </View>

              <View>
                <Text className="text-sm text-emerald-400 mb-2 font-bold">Camera ID (Từ máy trạm Edge AI)</Text>
                <TextInput 
                  value={formData.stream_url} onChangeText={t => setFormData({...formData, stream_url: t})}
                  placeholder="VD: workshop-laptop-camera" placeholderTextColor="#064e3b"
                  className="bg-[#0f172a] text-emerald-400 p-4 rounded-xl border border-emerald-500/50 font-mono text-xs"
                />
              </View>

              <View className="z-50">
                <Text className="text-sm text-slate-400 mb-2 font-medium">Cấp quyền cho Hộ kinh doanh</Text>
                <TouchableOpacity 
                  disabled={isEditing} 
                  onPress={() => setShowUserPicker(!showUserPicker)}
                  className={`bg-[#0f172a] p-4 rounded-xl border flex-row justify-between items-center ${isEditing ? 'border-slate-800 opacity-70' : 'border-slate-700'}`}
                >
                  <Text className={formData.user_id ? 'text-white' : 'text-slate-500'}>
                    {formData.user_id 
                      ? rawUsers.find(u => u.id === formData.user_id)?.name || 'Đã chọn hộ'
                      : '-- Chọn Hộ kinh doanh --'}
                  </Text>
                  {!isEditing && <ChevronDown size={20} color="#94a3b8" />}
                </TouchableOpacity>

                {showUserPicker && !isEditing && (
                  <View className="absolute top-[100%] left-0 right-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-xl max-h-48 overflow-hidden z-50">
                    <ScrollView nestedScrollEnabled>
                      {rawUsers.filter(u => u.role !== 'admin').map(u => (
                        <TouchableOpacity 
                          key={u.id}
                          onPress={() => { setFormData({...formData, user_id: u.id}); setShowUserPicker(false); }}
                          className="p-4 border-b border-slate-700/50"
                        >
                          <Text className="text-white font-medium">{u.full_name || u.name}</Text>
                          <Text className="text-slate-400 text-xs mt-1">{u.email}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

            </View>

            <View className="flex-row gap-3 mt-8 pt-4 border-t border-slate-700/50">
              <TouchableOpacity onPress={() => setIsFormModalOpen(false)} className="flex-1 py-3.5 rounded-xl bg-slate-800 items-center">
                <Text className="text-slate-300 font-bold">Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFormSubmit} className="flex-1 py-3.5 rounded-xl bg-cyan-600 items-center">
                <Text className="text-white font-bold">{isEditing ? 'Lưu cập nhật' : 'Hoàn tất'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}