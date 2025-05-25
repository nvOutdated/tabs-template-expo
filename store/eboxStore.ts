import { getEboxListApi } from '@/api/street/configuration';
import { create } from 'zustand';

export type ElectricItem = {
  id: number;
  sn: string;
  name: string;
  addr: string;
  area_id: number;
  device_info: {
    device_code: string;
    online: boolean;
    open: boolean;
    warn: boolean;
    loops: boolean[];
  };
  container_id: number;
  ebox_attachments?: {
    id: number;
    name: string;
    url: string;
    file_type: string;
  }[];
};

interface EboxStore {
  allEboxes: ElectricItem[];
  searchText: string;
  selectedAreaId: number | null;
  selectedDevices: Set<number>;
  
  // Actions
  initializeEboxTree: () => Promise<void>;
  updateEboxNode: (updatedEbox: ElectricItem) => void;
  setSearchText: (text: string) => void;
  setSelectedAreaId: (areaId: number | null) => void;
  setSelectedDevices: (devices: Set<number>) => void;
  toggleDeviceSelection: (deviceId: number) => void;
}

export const useEboxStore = create<EboxStore>((set, get) => ({
  allEboxes: [],
  searchText: '',
  selectedAreaId: null,
  selectedDevices: new Set(),

  initializeEboxTree: async () => {
    try {
      const res = await getEboxListApi({ page_size: 1000 });
      if (res.code === 200 && res.data) {
        set({ allEboxes: res.data });
      }
    } catch (error) {
      console.error('初始化集中器数据失败:', error);
    }
  },

  updateEboxNode: (updatedEbox: ElectricItem) => {
    set(state => ({
      allEboxes: state.allEboxes.map(ebox => 
        ebox.id === updatedEbox.id ? updatedEbox : ebox
      )
    }));
  },

  setSearchText: (text: string) => {
    set({ searchText: text });
  },

  setSelectedAreaId: (areaId: number | null) => {
    set({ selectedAreaId: areaId });
  },

  setSelectedDevices: (devices: Set<number>) => {
    set({ selectedDevices: devices });
  },

  toggleDeviceSelection: (deviceId: number) => {
    set(state => {
      const newSelectedDevices = new Set(state.selectedDevices);
      if (newSelectedDevices.has(deviceId)) {
        newSelectedDevices.delete(deviceId);
      } else {
        newSelectedDevices.add(deviceId);
      }
      return { selectedDevices: newSelectedDevices };
    });
  }
})); 