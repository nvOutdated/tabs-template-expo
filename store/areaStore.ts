import { get_area_list } from '@/api/area/areaApi';
import { Area } from '@/components/ebox/AreaDrawer';
import { listToTree } from '@/utils/treeUtils';
import { create } from 'zustand';

interface AreaState {
  areaList: Area[];
  areaWithDevicesList: Area[];
  allAreaList: Area[];
  isLoading: boolean;
  error: string | null;
  fetchAreaList: () => Promise<void>;
  removeDeviceFromArea: (areaId: number, deviceId: number) => void;
  updateDeviceInArea: (device: any, oldAreaId?: number) => void;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  allAreaList:[],
  areaList: [],
  areaWithDevicesList: [],
  isLoading: false,
  error: null,
  fetchAreaList: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await get_area_list();
      if (res.code === 200) {
        const treeList = listToTree(res.data, 'pid', 'area_id');
        set({
          allAreaList:res.data,
          areaList: treeList,
          areaWithDevicesList: treeList,
          isLoading: false
        });
      }
    } catch (error) {
      console.log('获取区域列表失败:', error);
      set({ error: '获取区域列表失败', isLoading: false });
    }
  },
  removeDeviceFromArea: (areaId, deviceId) => {
    set((state) => {
      const updateAreaList = (list: any[]): any[] =>
        list.map(area => {
          if (area.area_id === areaId) {
            return {
              ...area,
              devices: (area.devices || []).filter((d: any) => d.id !== deviceId),
              children: area.children ? updateAreaList(area.children) : [],
            };
          }
          return {
            ...area,
            children: area.children ? updateAreaList(area.children) : [],
          };
        });
      return {
        areaWithDevicesList: updateAreaList(state.areaWithDevicesList),
        allAreaList: updateAreaList(state.allAreaList),
      };
    });
  },
  updateDeviceInArea: (device, oldAreaId) => {
    set((state) => {
      const newAreaId = device.area_id;
      const updateAreaList = (list: any[]): any[] =>
        list.map(area => {
          let devices = area.devices || [];
          // 如果是旧区域，移除
          if (oldAreaId && area.area_id === oldAreaId) {
            devices = devices.filter((d: any) => d.id !== device.id);
          }
          // 如果是新区域，添加或更新
          if (area.area_id === newAreaId) {
            const exists = devices.some((d: any) => d.id === device.id);
            if (exists) {
              devices = devices.map((d: any) => d.id === device.id ? device : d);
            } else {
              devices = [...devices, device];
            }
          }
          return {
            ...area,
            devices,
            children: area.children ? updateAreaList(area.children) : [],
          };
        });
      return {
        areaWithDevicesList: updateAreaList(state.areaWithDevicesList),
        allAreaList: updateAreaList(state.allAreaList),
      };
    });
  }
})); 