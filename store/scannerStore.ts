import { create } from "zustand";

interface ScannerState {
  scanResult: string;
  setScanResult: (result: string) => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  scanResult: '',
  setScanResult: (result) => set({ scanResult: result }),
}));

