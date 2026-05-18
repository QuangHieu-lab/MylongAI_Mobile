// src/contexts/FarmContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FarmContextType {
  selectedFarmId: string | null;
  setSelectedFarmId: (farmId: string | null) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  // null có nghĩa là đang chọn "Tất cả các hộ"
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  return (
    <FarmContext.Provider value={{ selectedFarmId, setSelectedFarmId }}>
      {children}
    </FarmContext.Provider>
  );
}

// Hook tùy chỉnh để sử dụng ở bất kỳ màn hình nào
export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm phải được sử dụng bên trong FarmProvider');
  }
  return context;
}