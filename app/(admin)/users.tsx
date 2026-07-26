import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Search, UserPlus, Shield, User, Activity, 
  UserX, Edit, Trash2, Calendar, Crown, Lock, Unlock, X, AlertTriangle 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// 🚀 Import API từ file bạn đã cấu hình
import { userApi } from '@/src/services/api';

// Hàm format ngày tháng an toàn cho Mobile
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Chưa đăng nhập';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Chưa đăng nhập';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function UserManagementScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // States cho tính năng Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'customer' });

  // States cho tính năng Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);

  // ==========================================
  // 1️⃣ LẤY DANH SÁCH NGƯỜI DÙNG TỪ API
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await userApi.getAll();
      
      // 🚀 FIX LỖI DATA.MAP: Bóc tách mảng an toàn dù API trả về dạng nào
      let data: any[] = [];
      if (Array.isArray(res?.data)) {
        data = res.data;
      } else if (Array.isArray(res)) {
        data = res;
      } else if (res?.data && typeof res.data === 'object') {
        // Dự phòng trường hợp API bọc data trong object (ví dụ: { users: [...] } hoặc { data: [...] })
        data = res.data.users || res.data.data || Object.values(res.data).find(Array.isArray) || [];
      }

      const formattedUsers = data.map((u: any) => {
        const isLocked = 
          u.role === 'disabled' || u.status === 'disabled' || 
          u.status === 'inactive' || u.is_active === false || 
          u.is_active === 'false' || u.is_active === 0 ||
          u.disabled === true || u.is_disabled === true;
        
        let mappedRole = 'customer';
        if (u.role === 'admin') mappedRole = 'admin';
        if (u.role === 'premium') mappedRole = 'premium';
        
        return {
          id: u.id,
          name: u.full_name || u.name || 'Người dùng ẩn danh',
          email: u.email || '',
          role: mappedRole, 
          status: isLocked ? 'inactive' : 'active',
          lastLogin: u.last_login || u.created_at || new Date().toISOString()
        };
      });
      
      setUsers(formattedUsers);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Không thể tải danh sách người dùng';
      console.error("LỖI FETCH USER:", errorMessage);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // 2️⃣ KHÓA / MỞ KHÓA TÀI KHOẢN
  // ==========================================
  const handleToggleStatus = async (userId: string, currentStatus: string, role: string) => {
    if (role === 'admin') {
      Toast.show({ type: 'error', text1: 'Lỗi quyền hạn', text2: 'Không thể khóa Quản trị viên!' });
      return;
    }

    try {
      setProcessingId(userId);
      if (currentStatus === 'active') {
        await userApi.disableUser(userId);
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã khóa tài khoản' });
      } else {
        await userApi.enableUser(userId);
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã mở khóa tài khoản' });
      }
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Có lỗi từ máy chủ';
      Toast.show({ type: 'error', text1: 'Thất bại', text2: errorMessage });
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // 3️⃣ CẬP NHẬT NGƯỜI DÙNG
  // ==========================================
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editForm.name.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tên không được để trống' });
      return;
    }

    try {
      setProcessingId(editingUser.id);
      await userApi.updateUser(editingUser.id, {
        name: editForm.name,
        full_name: editForm.name,
        role: editForm.role
      });
      
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật thông tin thành công' });
      setIsEditModalOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Không thể cập nhật thông tin';
      Toast.show({ type: 'error', text1: 'Lỗi cập nhật', text2: errorMessage });
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // 4️⃣ XÓA NGƯỜI DÙNG
  // ==========================================
  const openDeleteModal = (user: any) => {
    if (user.role === 'admin') {
      Toast.show({ type: 'error', text1: 'Từ chối', text2: 'Không thể xóa Quản trị viên!' });
      return;
    }
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      setProcessingId(deletingUser.id);
      await userApi.deleteUser(deletingUser.id);
      
      Toast.show({ type: 'success', text1: 'Đã xóa', text2: 'Người dùng đã bị xóa khỏi hệ thống' });
      setIsDeleteModalOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Không thể xóa người dùng này';
      Toast.show({ type: 'error', text1: 'Lỗi xóa', text2: errorMessage });
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // XỬ LÝ LỌC & THỐNG KÊ
  // ==========================================
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const inactiveUsersCount = users.filter(u => u.status === 'inactive').length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;
  const premiumUsersCount = users.filter(u => u.role === 'premium').length;

  return (
    <>
      <ScrollView 
        className="flex-1 bg-[#0f172a]" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View className="mt-8 mb-6">
          <View className="flex-row justify-between items-end mb-4">
            <View>
              <Text className="text-white text-3xl font-extrabold tracking-tight">Người dùng</Text>
              <Text className="text-slate-400 text-sm mt-1">Quản lý tài khoản & phân quyền</Text>
            </View>
          </View>
        </View>

        {/* ================= STATS GRID ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[100%] bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-xs font-semibold uppercase mb-1">Tổng người dùng</Text>
              <Text className="text-white text-4xl font-extrabold">{users.length}</Text>
            </View>
            <View className="bg-blue-500/20 p-3 rounded-2xl">
              <User size={24} color="#60a5fa" />
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-[10px] font-semibold uppercase">Premium</Text>
              <View className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/20">
                <Crown size={14} color="#fbbf24" />
              </View>
            </View>
            <Text className="text-amber-400 text-2xl font-bold">{premiumUsersCount}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-[10px] font-semibold uppercase">Hoạt động</Text>
              <View className="bg-emerald-500/20 p-1.5 rounded-lg">
                <Activity size={14} color="#34d399" />
              </View>
            </View>
            <Text className="text-emerald-400 text-2xl font-bold">{activeUsersCount}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-[10px] font-semibold uppercase">Tạm khóa</Text>
              <View className="bg-rose-500/20 p-1.5 rounded-lg">
                <UserX size={14} color="#fb7185" />
              </View>
            </View>
            <Text className="text-rose-400 text-2xl font-bold">{inactiveUsersCount}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-[10px] font-semibold uppercase">Quản trị</Text>
              <View className="bg-purple-500/20 p-1.5 rounded-lg">
                <Shield size={14} color="#c084fc" />
              </View>
            </View>
            <Text className="text-purple-400 text-2xl font-bold">{adminUsersCount}</Text>
          </View>
        </View>

        {/* ================= THANH TÌM KIẾM ================= */}
        <View className="mb-6 relative justify-center">
          <View className="absolute left-4 z-10">
            <Search size={20} color="#64748b" />
          </View>
          <TextInput
            placeholder="Tìm kiếm tên hoặc email..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-[#1e293b] text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-700/50"
          />
        </View>

        {/* ================= DANH SÁCH NGƯỜI DÙNG ================= */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">Danh sách ({filteredUsers.length})</Text>
          
          {loading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-400 mt-4">Đang tải dữ liệu người dùng...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View className="py-10 items-center justify-center bg-[#1e293b] rounded-3xl border border-slate-700/50">
              <UserX size={40} color="#64748b" />
              <Text className="text-slate-400 mt-4 font-medium">Không tìm thấy người dùng nào</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} className={`bg-[#1e293b] p-5 rounded-[24px] border ${user.status === 'inactive' ? 'border-rose-900/50 opacity-80' : 'border-slate-700/50'} shadow-lg mb-4`}>
                
                {/* Hàng 1: Avatar + Tên + Email */}
                <View className="flex-row items-center mb-4">
                  <View className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${user.role === 'premium' ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-cyan-500/30'}`}>
                    <Text className="text-white font-bold text-lg">{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{user.name}</Text>
                    <Text className="text-slate-400 text-sm" numberOfLines={1}>{user.email}</Text>
                  </View>
                  
                  {/* Nút Khóa / Mở Khóa Nhanh */}
                  <TouchableOpacity 
                    disabled={user.role === 'admin' || processingId === user.id}
                    onPress={() => handleToggleStatus(user.id, user.status, user.role)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${user.status === 'active' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}
                  >
                    {processingId === user.id ? (
                      <ActivityIndicator size="small" color={user.status === 'active' ? '#fb7185' : '#34d399'} />
                    ) : user.status === 'active' ? (
                      <Lock size={18} color="#fb7185" />
                    ) : (
                      <Unlock size={18} color="#34d399" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Hàng 2: Badges */}
                <View className="flex-row items-center gap-2 mb-4">
                  {/* Badge Vai trò */}
                  <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${
                    user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/30' : 
                    user.role === 'premium' ? 'bg-amber-500/10 border-amber-500/30' : 
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    {user.role === 'admin' ? <Shield size={12} color="#c084fc" /> : 
                     user.role === 'premium' ? <Crown size={12} color="#fbbf24" /> : 
                     <User size={12} color="#60a5fa" />}
                    <Text className={`ml-1.5 text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'text-purple-400' : 
                      user.role === 'premium' ? 'text-amber-400' : 
                      'text-blue-400'
                    }`}>
                      {user.role}
                    </Text>
                  </View>

                  {/* Badge Trạng thái */}
                  <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${user.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                    {user.status === 'active' ? (
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    ) : (
                      <Lock size={10} color="#fb7185" className="mr-1" />
                    )}
                    <Text className={`text-xs font-bold uppercase ${user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Bị Khóa'}
                    </Text>
                  </View>
                </View>

                {/* Hàng 3: Chỉ số chi tiết */}
                <View className="flex-row items-center justify-between bg-slate-800/50 p-3 rounded-xl mb-4">
                  <View className="flex-row items-center">
                    <Calendar size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs ml-1.5">Lần cuối: <Text className="text-slate-300">{formatDate(user.lastLogin)}</Text></Text>
                  </View>
                </View>

                {/* Hàng 4: Hành động */}
                <View className="flex-row justify-end gap-3 pt-3 border-t border-slate-700/50">
                  <TouchableOpacity 
                    onPress={() => openEditModal(user)}
                    className="bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-lg flex-row items-center"
                  >
                    <Edit size={16} color="#60a5fa" />
                    <Text className="text-blue-400 text-sm font-semibold ml-2">Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    disabled={user.role === 'admin'}
                    onPress={() => openDeleteModal(user)}
                    className={`px-5 py-2 rounded-lg flex-row items-center border ${user.role === 'admin' ? 'bg-slate-800 border-slate-700 opacity-50' : 'bg-rose-500/10 border-rose-500/20'}`}
                  >
                    <Trash2 size={16} color={user.role === 'admin' ? "#64748b" : "#fb7185"} />
                    <Text className={`text-sm font-semibold ml-2 ${user.role === 'admin' ? 'text-slate-400' : 'text-rose-400'}`}>Xóa</Text>
                  </TouchableOpacity>
                </View>

              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ================= MODAL SỬA NGƯỜI DÙNG ================= */}
      <Modal visible={isEditModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsEditModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center items-center bg-black/80 px-6">
          <View className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Chỉnh sửa người dùng</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="p-2 bg-slate-800 rounded-full">
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1 uppercase">Email (Chỉ xem)</Text>
              <TextInput 
                className="bg-slate-800/50 text-slate-500 p-4 rounded-2xl border border-slate-700"
                value={editingUser?.email}
                editable={false}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1 uppercase">Họ và tên</Text>
              <TextInput 
                className="bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 focus:border-blue-500"
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Nhập họ tên người dùng"
                placeholderTextColor="#64748b"
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 font-bold text-xs mb-2 ml-1 uppercase">Phân quyền (Role)</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => setEditForm({...editForm, role: 'customer'})}
                  className={`flex-1 py-3 rounded-xl border items-center ${editForm.role === 'customer' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700'}`}
                >
                  <Text className={`text-xs font-bold ${editForm.role === 'customer' ? 'text-blue-400' : 'text-slate-400'}`}>Free</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setEditForm({...editForm, role: 'premium'})}
                  className={`flex-1 py-3 rounded-xl border items-center ${editForm.role === 'premium' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700'}`}
                >
                  <Text className={`text-xs font-bold ${editForm.role === 'premium' ? 'text-amber-400' : 'text-slate-400'}`}>Premium</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setEditForm({...editForm, role: 'admin'})}
                  className={`flex-1 py-3 rounded-xl border items-center ${editForm.role === 'admin' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700'}`}
                >
                  <Text className={`text-xs font-bold ${editForm.role === 'admin' ? 'text-purple-400' : 'text-slate-400'}`}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdateUser} 
              disabled={processingId === editingUser?.id}
              className="bg-blue-600 p-4 rounded-full flex-row items-center justify-center shadow-lg shadow-blue-900"
            >
              {processingId === editingUser?.id ? <ActivityIndicator size="small" color="#fff" className="mr-2" /> : null}
              <Text className="text-white font-bold text-base tracking-wide">Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL XÓA NGƯỜI DÙNG ================= */}
      <Modal visible={isDeleteModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsDeleteModalOpen(false)}>
        <View className="flex-1 justify-center items-center bg-black/80 px-6">
          <View className="bg-[#1e293b] border border-rose-900/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6">
            <View className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle size={32} color="#fb7185" />
            </View>
            <Text className="text-xl font-bold text-white text-center mb-2">Xóa người dùng?</Text>
            <Text className="text-slate-400 text-center mb-6 leading-6">
              Bạn có chắc chắn muốn xóa tài khoản <Text className="font-bold text-white">{deletingUser?.name}</Text> vĩnh viễn? Hành động này không thể hoàn tác.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-3.5 bg-slate-800 rounded-xl items-center"
              >
                <Text className="text-slate-300 font-bold">Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeleteUser} 
                disabled={processingId === deletingUser?.id}
                className="flex-1 py-3.5 bg-rose-600 rounded-xl items-center flex-row justify-center"
              >
                {processingId === deletingUser?.id ? <ActivityIndicator size="small" color="#fff" className="mr-2" /> : null}
                <Text className="text-white font-bold">Xác nhận xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}