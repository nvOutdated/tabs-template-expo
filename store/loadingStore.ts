import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const MIN_LOADING_TIME = 300; // 最小显示时间（毫秒）

const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => {
    // 确保 loading 至少显示 MIN_LOADING_TIME 毫秒
    setTimeout(() => {
      set({ isLoading: false });
    }, MIN_LOADING_TIME);
  },
}));

export default useLoadingStore; 