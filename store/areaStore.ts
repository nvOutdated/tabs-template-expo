import { get_area_list } from '@/api/area/areaApi';
import { Area } from '@/components/ebox/AreaDrawer';
import { listToTree } from '@/utils/treeUtils';
import { create } from 'zustand';

interface AreaState {
  areaList: Area[];
  areaWithDevicesList: Area[];
  isLoading: boolean;
  error: string | null;
  fetchAreaList: () => Promise<void>;
}

export const useAreaStore = create<AreaState>((set) => ({
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
          areaList: treeList,
          areaWithDevicesList: treeList,
          isLoading: false
        });
      }
    } catch (error) {
      console.log('获取区域列表失败:', error);
      set({ error: '获取区域列表失败', isLoading: false });
    }
  }
})); 