// src/components/FarmSelector.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Factory, Check, ChevronDown, X } from 'lucide-react-native';
import { useFarm } from '../../contexts/FarmContext';

// ==========================================
// 🚀 MOCK DATA (Lấy từ bảng danh sách trang trại)
// ==========================================
const MOCK_FARMS = [
  { id: 'f1', name: 'Hộ Bánh Tráng Cô Ba', address: 'Khu vực 1, Mỹ Lồng', status: 'active' },
  { id: 'f2', name: 'Xưởng Phơi Chú Tư', address: 'Khu vực 2, Mỹ Lồng', status: 'active' },
  { id: 'f4', name: 'Lò Bánh Tráng Chín Đều', address: 'Khu vực 4, Mỹ Lồng', status: 'active' },
];

export function FarmSelector() {
  const { selectedFarmId, setSelectedFarmId } = useFarm();
  const [isOpen, setIsOpen] = useState(false);

  // Tìm thông tin Farm đang được chọn
  const selectedFarm = selectedFarmId 
    ? MOCK_FARMS.find(f => f.id === selectedFarmId) 
    : null;

  const activeFarms = MOCK_FARMS.filter(f => f.status === 'active');

  const handleSelect = (id: string | null) => {
    setSelectedFarmId(id);
    setIsOpen(false);
  };

  return (
    <View>
      {/* ================= NÚT BẤM KÍCH HOẠT ================= */}
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        className="flex-row items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg"
      >
        <Factory size={16} color="#60a5fa" />
        <Text className="text-white text-sm font-semibold max-w-[120px]" numberOfLines={1}>
          {selectedFarm ? selectedFarm.name : 'Tất cả hộ'}
        </Text>
        <ChevronDown size={16} color="#94a3b8" />
      </TouchableOpacity>

      {/* ================= BOTTOM SHEET MODAL ================= */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* Nền đen mờ phía sau - Bấm vào sẽ đóng Modal */}
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className="flex-1 bg-black/60 justify-end">
            
            {/* Vùng nội dung màu Dark Neon vuốt lên */}
            <TouchableWithoutFeedback>
              <View className="bg-[#0f172a] rounded-t-[32px] border-t border-slate-700/50 max-h-[80%]">
                
                {/* Header của Bottom Sheet */}
                <View className="flex-row items-center justify-between p-6 border-b border-slate-800">
                  <View>
                    <Text className="text-white text-xl font-bold">Chọn cơ sở</Text>
                    <Text className="text-slate-400 text-xs mt-1">Lọc dữ liệu theo hộ phơi bánh</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setIsOpen(false)}
                    className="w-8 h-8 bg-slate-800 rounded-full items-center justify-center"
                  >
                    <X size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Danh sách các Option */}
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  
                  {/* Option: Tất cả hộ */}
                  <TouchableOpacity
                    onPress={() => handleSelect(null)}
                    className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 border ${
                      !selectedFarmId ? 'bg-blue-600/20 border-blue-500/50' : 'bg-[#1e293b] border-slate-800'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Factory size={20} color="#ffffff" />
                      </View>
                      <View>
                        <Text className={`text-base font-bold ${!selectedFarmId ? 'text-blue-400' : 'text-white'}`}>
                          Tất cả hộ
                        </Text>
                        <Text className="text-xs text-slate-400">{activeFarms.length} cơ sở đang hoạt động</Text>
                      </View>
                    </View>
                    {!selectedFarmId && <Check size={20} color="#60a5fa" />}
                  </TouchableOpacity>

                  <View className="h-[1px] bg-slate-800 my-2" />

                  {/* Options: Từng Farm riêng lẻ */}
                  {activeFarms.map((farm) => (
                    <TouchableOpacity
                      key={farm.id}
                      onPress={() => handleSelect(farm.id)}
                      className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 border ${
                        selectedFarmId === farm.id ? 'bg-blue-600/20 border-blue-500/50' : 'bg-[#1e293b] border-slate-800'
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Factory size={20} color="#94a3b8" />
                        </View>
                        <View>
                          <Text className={`text-base font-bold ${selectedFarmId === farm.id ? 'text-blue-400' : 'text-white'}`}>
                            {farm.name}
                          </Text>
                          <Text className="text-xs text-slate-400">{farm.address}</Text>
                        </View>
                      </View>
                      {selectedFarmId === farm.id && <Check size={20} color="#60a5fa" />}
                    </TouchableOpacity>
                  ))}

                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
            
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}