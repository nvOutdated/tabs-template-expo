import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <MaterialIcons name="check-circle" size={24} color="#fff" />;
    case 'error':
      return <MaterialIcons name="error" size={24} color="#fff" />;
    case 'warning':
      return <MaterialIcons name="warning" size={24} color="red" />;
    case 'info':
      return <MaterialIcons name="info" size={24} color="#fff" />;
  }
};

export const useCustomToast = () => {
  const toast = useToast();

  const showSuccess = ({ title = '成功', message, duration = 3000 }: ToastOptions) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        return (
          <Toast 
            action="success" 
            variant="solid"
            className="w-40 mt-10 py-1 bg-white border-green-500 border-2"
          >
            <View className="flex-row items-center gap-1 px-2 py-0">
              {getIcon('success')}
              <View className="flex-1 flex-col">
                <ToastTitle className="text-black text-base">{title}</ToastTitle>
                <ToastDescription className="text-black/80 text-sm">{message}</ToastDescription>
              </View>
            </View>
          </Toast>
        );
      },
    });
  };

  const showError = ({ title = '错误', message, duration = 3000 }: ToastOptions) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        return (
          <Toast 
            action="error" 
            variant="solid"
            className="w-40 mt-10 py-1 bg-white border-red-500 border-2"
          >
            <View className="flex-row items-center gap-1 px-2 py-0">
              {getIcon('error')}
              <View className="flex-1 flex-col">
                <ToastTitle className="text-black text-base">{title}</ToastTitle>
                <ToastDescription className="text-black/80 text-sm">{message}</ToastDescription>
              </View>
            </View>
          </Toast>
        );
      },
    });
  };

  const showWarning = ({ title = '警告!', message, duration = 3000 }: ToastOptions) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        return (
          <Toast 
            action="warning" 
            variant="solid"
            className="w-40 mt-10 py-1 bg-white border-rose-500 border-2"
          >
            <View className="flex-row items-center gap-1 px-2 py-0">
              {getIcon('warning')}
              <View className="flex-1 flex-col">
                <ToastTitle className="text-black text-base">{title}</ToastTitle>
                <ToastDescription className="text-black/80 text-sm">{message}</ToastDescription>
              </View>
            </View>
          </Toast>
        );
      },
    });
  };

  const showInfo = ({ title = '提示', message, duration = 3000 }: ToastOptions) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        return (
          <Toast 
            action="info" 
            variant="solid"
            className="w-40 mt-10 py-1 bg-white border-blue-500 border-2"
          >
            <View className="flex-row items-center gap-1 px-2 py-0">
              {getIcon('info')}
              <View className="flex-1 flex-col">
                <ToastTitle className="text-black text-base">{title}</ToastTitle>
                <ToastDescription className="text-black/80 text-sm">{message}</ToastDescription>
              </View>
            </View>
          </Toast>
        );
      },
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

