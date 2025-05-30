import { getEboxListApi } from '@/api/street/configuration';
import { create } from 'zustand';

export type EboxOperation = {
  id: string;
  title: string;
  content: string;
  type: 'alarm' | 'warning' | 'info';
  module: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed';
  sn: string;
  deviceName: string;
  data: {
    phase3Voltage: number[];
    phase3Electric: number[];
    power: number;
    dateTime: string;
    powerOff: string;
    powerOn: string;
    loops: boolean[];
    ios: boolean[];
    enabledWeekly: boolean;
    enabledAlways: boolean;
    enabledLocation: boolean;
    enabledMultiple: boolean;
    enabledLight: boolean;
    enabledWater: boolean;
    enabledOneByOne: boolean;
    mode: string;
    optTime: string;
    eventType: string;
    reportTime: string;
    description: string;
    warn: boolean;
  };
};

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
    id:number;
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
  selectedDevices: Map<number, ElectricItem>;
  operations: EboxOperation[];
  
  // Actions
  initializeEboxTree: () => Promise<void>;
  updateEboxNode: (updatedEbox: ElectricItem) => void;
  setSearchText: (text: string) => void;
  setSelectedAreaId: (areaId: number | null) => void;
  setSelectedDevices: (devices: Map<number, ElectricItem>) => void;
  toggleDeviceSelection: (device: ElectricItem) => void;
  updateDeviceStatus: (deviceId: number, status: any) => void;
  addOperation: (operation: EboxOperation) => void;
}

export const useEboxStore = create<EboxStore>((set, get) => ({
  allEboxes: [],
  searchText: '',
  selectedAreaId: null,
  selectedDevices: new Map(),
  operations: [],

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

  setSelectedDevices: (devices: Map<number, ElectricItem>) => {
    set({ selectedDevices: devices });
  },

  toggleDeviceSelection: (device: ElectricItem) => {
    set(state => {
      const newSelectedDevices = new Map(state.selectedDevices);
      if (newSelectedDevices.has(device.id)) {
        newSelectedDevices.delete(device.id);
      } else {
        newSelectedDevices.set(device.id, device);
      }
      return { selectedDevices: newSelectedDevices };
    });
  },

  updateDeviceStatus: (deviceId: number, status: any) => {
    set(state => ({
      allEboxes: state.allEboxes.map(ebox => {
        if (ebox.device_info.id === deviceId) {
          return {
            ...ebox,
            device_info: {
              ...ebox.device_info,
              online: true,
              open: status.open,
              warn: status.warn,
              loops: status.loops
            }
          };
        }
        return ebox;
      })
    }));
  },

  addOperation: (operation: EboxOperation) => {
    set(state => ({
      operations: [operation, ...state.operations]
    }));
  }
})); 