import { useCallback } from 'react';
import { showMessageModal } from './MessageGlobalModal';

// 兼容层：提供与之前相同的 API，但内部使用 store
export const useMessageModal = () => {
  const showModalSuccess = useCallback((message: string, title?: string) => {
    showMessageModal({
      type: 'success',
      message,
      title,
      duration: 2000,
    });
  }, []);

  const showModalError = useCallback((message: string, title?: string) => {
    showMessageModal({
      type: 'error',
      message,
      title,
      duration: 3000,
    });
  }, []);

  const showModalWarning = useCallback((message: string, title?: string) => {
    showMessageModal({
      type: 'warning',
      message,
      title,
      duration: 3000,
    });
  }, []);

  const showModalInfo = useCallback((message: string, title?: string) => {
    showMessageModal({
      type: 'info',
      message,
      title,
      duration: 2000,
    });
  }, []);

  return {
    showModalSuccess,
    showModalError,
    showModalWarning,
    showModalInfo,
  };
}; 