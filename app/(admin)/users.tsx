import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { 
  Search, UserPlus, Shield, User, Activity, 
  UserX, Edit, Trash2, Calendar 
} from 'lucide-react-native';

// --- MOCK DATA (Dùng tạm để test UI) ---
const mockUsers = [
  { id: '1', name: 'Nguyễn Văn A', email: 'a.nguyen@mylong.vn', role: 'admin', status: 'active', lastLogin: '2026-05-12T08:30:00', batchesCreated: 156 },
  { id: '2', name: 'Trần Thị B', email: 'b.tran@mylong.vn', role: 'user', status: 'active', lastLogin: '2026-05-11T14:20:00', batchesCreated: 42 },
  { id: '3', name: 'Lê Văn C', email: 'c.le@mylong.vn', role: 'user', status: 'inactive', lastLogin: '2026-05-01T09:15:00', batchesCreated: 12 },
  { id: '4', name: 'Hệ thống AI', email: 'ai.bot@mylong.vn', role: 'admin', status: 'active', lastLogin: '2026-05-12T13:40:00', batchesCreated: 1024 },
];

// Hàm format ngày tháng an toàn cho Mobile
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function UserManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc dữ liệu
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Thống kê
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const inactiveUsers = mockUsers.filter(u => u.status === 'inactive').length;
  const adminUsers = mockUsers.filter(u => u.role === 'admin').length;

  return (
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

        {/* Nút Thêm người dùng */}
        <TouchableOpacity className="bg-blue-600 flex-row items-center justify-center py-3.5 rounded-2xl shadow-lg shadow-blue-600/30">
          <UserPlus size={20} color="#ffffff" className="mr-2" />
          <Text className="text-white font-bold text-base">Thêm người dùng mới</Text>
        </TouchableOpacity>
      </View>

      {/* ================= STATS GRID 2x2 ================= */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
        {/* Tổng */}
        <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase">Tổng số</Text>
            <View className="bg-blue-500/20 p-2 rounded-xl">
              <User size={16} color="#60a5fa" />
            </View>
          </View>
          <Text className="text-white text-3xl font-bold">{mockUsers.length}</Text>
        </View>

        {/* Hoạt động */}
        <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase">Hoạt động</Text>
            <View className="bg-emerald-500/20 p-2 rounded-xl">
              <Activity size={16} color="#34d399" />
            </View>
          </View>
          <Text className="text-emerald-400 text-3xl font-bold">{activeUsers}</Text>
        </View>

        {/* Bị khóa */}
        <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase">Tạm khóa</Text>
            <View className="bg-rose-500/20 p-2 rounded-xl">
              <UserX size={16} color="#fb7185" />
            </View>
          </View>
          <Text className="text-rose-400 text-3xl font-bold">{inactiveUsers}</Text>
        </View>

        {/* Quản trị */}
        <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase">Quản trị</Text>
            <View className="bg-purple-500/20 p-2 rounded-xl">
              <Shield size={16} color="#c084fc" />
            </View>
          </View>
          <Text className="text-purple-400 text-3xl font-bold">{adminUsers}</Text>
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

      {/* ================= DANH SÁCH NGƯỜI DÙNG (THAY CHO BẢNG) ================= */}
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">Danh sách ({filteredUsers.length})</Text>
        
        {filteredUsers.map((user) => (
          <View key={user.id} className="bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg mb-4">
            
            {/* Hàng 1: Avatar + Tên + Email */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Text className="text-white font-bold text-lg">{user.name.charAt(0)}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-white font-bold text-lg">{user.name}</Text>
                <Text className="text-slate-400 text-sm">{user.email}</Text>
              </View>
            </View>

            {/* Hàng 2: Badges (Vai trò & Trạng thái) */}
            <View className="flex-row items-center gap-2 mb-4">
              {/* Badge Vai trò */}
              <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                {user.role === 'admin' ? <Shield size={12} color="#c084fc" /> : <User size={12} color="#60a5fa" />}
                <Text className={`ml-1.5 text-xs font-bold uppercase ${user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>
                  {user.role}
                </Text>
              </View>

              {/* Badge Trạng thái */}
              <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${user.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-500/10 border-slate-500/30'}`}>
                {user.status === 'active' && <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
                <Text className={`text-xs font-bold uppercase ${user.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                </Text>
              </View>
            </View>

            {/* Hàng 3: Chỉ số chi tiết */}
            <View className="flex-row items-center justify-between bg-slate-800/50 p-3 rounded-xl mb-4">
              <View className="flex-row items-center">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-slate-400 text-xs ml-1.5">Lần cuối: {formatDate(user.lastLogin)}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-cyan-400 font-bold">{user.batchesCreated}</Text>
                <Text className="text-slate-400 text-xs ml-1"> batches</Text>
              </View>
            </View>

            {/* Hàng 4: Hành động */}
            <View className="flex-row justify-end gap-3 pt-2 border-t border-slate-700/50">
              <TouchableOpacity className="bg-slate-800 px-4 py-2 rounded-lg flex-row items-center">
                <Edit size={16} color="#60a5fa" />
                <Text className="text-blue-400 text-sm font-semibold ml-2">Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-rose-500/10 px-4 py-2 rounded-lg flex-row items-center border border-rose-500/20">
                <Trash2 size={16} color="#fb7185" />
                <Text className="text-rose-400 text-sm font-semibold ml-2">Xóa</Text>
              </TouchableOpacity>
            </View>

          </View>
        ))}
      </View>

    </ScrollView>
  );
}