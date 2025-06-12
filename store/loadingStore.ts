import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}));

export default useLoadingStore; 