import { get_smart_light_list } from '@/api/street/smartLightApi';
import { create } from 'zustand';

export type SmartLightOperation = {
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

export type SmartLightItem = {
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
    id: number;
  };
  container_id: number;
  lamp_attachments?: {
    id: number;
    name: string;
    url: string;
    file_type: string;
  }[];
};

export interface SmartLightStore {
  allSmartLights: SmartLightItem[];
  searchText: string;
  selectedAreaId: number | null;
  selectedDevices: Map<number, SmartLightItem>;
  isEditMode: boolean;
  selectedOperations: Set<string>;
  operations: SmartLightOperation[];
  setAllSmartLights: (lights: SmartLightItem[]) => void;
  setSearchText: (text: string) => void;
  setSelectedAreaId: (id: number | null) => void;
  setSelectedDevices: (devices: Map<number, SmartLightItem>) => void;
  toggleDeviceSelection: (device: SmartLightItem) => void;
  toggleEditMode: () => void;
  toggleOperationSelect: (operationId: string) => void;
  clearSelectedOperations: () => void;
  updateDeviceStatus: (deviceId: number, status: any) => void;
  addOperation: (operation: SmartLightOperation) => void;
  deleteOperations: (operationIds: Set<string>) => void;
  initializeSmartLightTree: () => Promise<void>;
}

// 添加设备状态比较函数
const isDeviceStatusChanged = (oldInfo: any, newInfo: any): boolean => {
  if (!oldInfo || !newInfo) return true;
  
  return (
    oldInfo.online !== newInfo.online ||
    oldInfo.open !== newInfo.open ||
    oldInfo.warn !== newInfo.warn ||
    JSON.stringify(oldInfo.loops) !== JSON.stringify(newInfo.loops)
  );
};

export const useSmartLightStore = create<SmartLightStore>((set, get) => ({
  allSmartLights: [],
  searchText: '',
  selectedAreaId: null,
  selectedDevices: new Map(),
  isEditMode: false,
  selectedOperations: new Set(),
  operations: [],
  setAllSmartLights: (lights) => set({ allSmartLights: lights }),
  setSearchText: (text) => set({ searchText: text }),
  setSelectedAreaId: (id) => set({ selectedAreaId: id }),
  setSelectedDevices: (devices) => set({ selectedDevices: devices }),
  toggleDeviceSelection: (device) =>
    set((state) => {
      const newSelectedDevices = new Map(state.selectedDevices);
      if (newSelectedDevices.has(device.id)) {
        newSelectedDevices.delete(device.id);
      } else {
        newSelectedDevices.set(device.id, device);
      }
      return { selectedDevices: newSelectedDevices };
    }),
  toggleEditMode: () =>
    set((state) => {
      if (state.isEditMode) {
        return { isEditMode: false, selectedOperations: new Set() };
      }
      return { isEditMode: true };
    }),
  toggleOperationSelect: (operationId) =>
    set((state) => {
      const newSelectedOperations = new Set(state.selectedOperations);
      if (newSelectedOperations.has(operationId)) {
        newSelectedOperations.delete(operationId);
      } else {
        newSelectedOperations.add(operationId);
      }
      return { selectedOperations: newSelectedOperations };
    }),
  clearSelectedOperations: () => set({ selectedOperations: new Set() }),
  updateDeviceStatus: (deviceId, status) => {
    set((state) => {
      const updatedLights = state.allSmartLights.map((light) => {
        if (light.device_info.id === deviceId) {
          // 检查状态是否真的发生变化
          if (!isDeviceStatusChanged(light.device_info, status)) {
            return light; // 如果没有变化，返回原对象
          }
          return { ...light, device_info: { ...light.device_info, ...status } };
        }
        return light;
      });

      // 只有当数组引用发生变化时才更新状态
      if (JSON.stringify(updatedLights) !== JSON.stringify(state.allSmartLights)) {
        return { allSmartLights: updatedLights };
      }
      return state;
    });
  },
  addOperation: (operation) => {
    set((state) => {
      const newOperations = [operation, ...state.operations];
      // 如果超过100条记录，删除最后一条
      if (newOperations.length > 100) {
        newOperations.pop();
      }
      return { operations: newOperations };
    });
  },
  deleteOperations: (operationIds) => {
    set((state) => ({
      operations: state.operations.filter(op => !operationIds.has(op.id))
    }));
  },
  initializeSmartLightTree: async () => {
    try {
      const res = await get_smart_light_list({ page_size: 1000 });
      if (res.code === 200 && res.data) {
        set({ allSmartLights: res.data });
      }
    } catch (error) {
      console.error('初始化智能路灯数据失败:', error);
    }
  },
  updateSmartLightNode: (updatedLight: SmartLightItem) => {
    set(state => ({
      allSmartLights: state.allSmartLights.map(light => 
        light.id === updatedLight.id ? updatedLight : light
      )
    }));
  },
}));

// 设备状态映射
export const DEVICE_STATUS = {
  OFFLINE: {
    condition: (info: any) => !info?.online && !info?.open && !info?.warn,
    label: '离线',
    dotStyle: 'offline',
    textStyle: 'offlineText',
    module: '设备离线'
  },
  ONLINE: {
    condition: (info: any) => info?.online && !info?.open && !info?.warn,
    label: '在线',
    dotStyle: 'online',
    textStyle: 'onlineText',
    module: '设备在线'
  },
  OPEN: {
    condition: (info: any) => info?.online && info?.open && !info?.warn,
    label: '打开',
    dotStyle: 'open',
    textStyle: 'openText',
    module: '回路打开'
  },
  WARN: {
    condition: (info: any) => info?.online && info?.warn,
    label: '报警',
    dotStyle: 'warn',
    textStyle: 'warnText',
    module: '设备报警'
  }
} as const; 