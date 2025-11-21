import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CollectionDevice = {
  id: string;
  name: string;
  sn: string;
  address: string;
  area: string;
  latitude?: number;
  longitude?: number;
  createTime: number;
  synced: boolean;
};

interface CollectionStore {
  devices: CollectionDevice[];
  addDevice: (device: Omit<CollectionDevice, 'id' | 'createTime' | 'synced'>) => void;
  updateDevice: (id: string, updates: Partial<CollectionDevice>) => void;
  deleteDevice: (id: string) => void;
  getDevice: (id: string) => CollectionDevice | undefined;
  clearAll: () => void;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      devices: [],
      addDevice: (deviceData) => {
        const newDevice: CollectionDevice = {
          id: uuid.v4() as string,
          createTime: Date.now(),
          synced: false,
          ...deviceData,
        };
        set((state) => ({
          devices: [newDevice, ...state.devices],
        }));
      },
      updateDevice: (id, updates) => {
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }));
      },
      deleteDevice: (id) => {
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
        }));
      },
      getDevice: (id) => {
        return get().devices.find((d) => d.id === id);
      },
      clearAll: () => {
        set({ devices: [] });
      },
    }),
    {
      name: 'collection-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
