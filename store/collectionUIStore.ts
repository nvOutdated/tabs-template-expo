import { create } from 'zustand';

interface CollectionUIStore {
  selectedAreaId: number;
  setSelectedAreaId: (id: number) => void;
}

export const useCollectionUIStore = create<CollectionUIStore>((set) => ({
  selectedAreaId: 0,
  setSelectedAreaId: (id) => set({ selectedAreaId: id }),
}));
