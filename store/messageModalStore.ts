import { create } from 'zustand';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageModalOptions {
  type: MessageType;
  message: string;
  title?: string;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
}

interface MessageModalState {
  visible: boolean;
  modalOptions: MessageModalOptions;
  showMessage: (options: MessageModalOptions) => void;
  hideMessage: () => void;
}

const useMessageModalStore = create<MessageModalState>((set) => ({
  visible: false,
  modalOptions: {
    type: 'info',
    message: '',
  },
  showMessage: (options: MessageModalOptions) => {
    set({ 
      visible: true, 
      modalOptions: options 
    });
    
    // 自动隐藏
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        set({ visible: false });
      }, options.duration);
    }
  },
  hideMessage: () => {
    set({ visible: false });
  },
}));

export default useMessageModalStore;

