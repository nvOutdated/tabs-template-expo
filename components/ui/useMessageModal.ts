import { useCallback, useState } from 'react';
import { MessageGlobalModalOptions, setModalRef } from './MessageGlobalModal';

export const useMessageModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<MessageGlobalModalOptions>({
    type: 'info',
    message: '',
  });

  const showModal = useCallback((options: MessageGlobalModalOptions) => {
    setModalOptions(options);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  // 设置全局引用
  setModalRef(showModal);

  const showSuccess = useCallback((message: string, title?: string) => {
    showModal({
      type: 'success',
      message,
      title,
      duration: 2000,
    });
  }, [showModal]);

  const showError = useCallback((message: string, title?: string) => {
    showModal({
      type: 'error',
      message,
      title,
      duration: 3000,
    });
  }, [showModal]);

  const showWarning = useCallback((message: string, title?: string) => {
    showModal({
      type: 'warning',
      message,
      title,
      duration: 3000,
    });
  }, [showModal]);

  const showInfo = useCallback((message: string, title?: string) => {
    showModal({
      type: 'info',
      message,
      title,
      duration: 2000,
    });
  }, [showModal]);

  return {
    visible,
    modalOptions,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 