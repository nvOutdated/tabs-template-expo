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
      return <MaterialIcons name="check-circle" size={28} color="#10B981" />;
    case 'error':
      return <MaterialIcons name="error-outline" size={28} color="#EF4444" />;
    case 'warning':
      return <MaterialIcons name="warning-amber" size={28} color="#F59E0B" />;
    case 'info':
      return <MaterialIcons name="info-outline" size={28} color="#3B82F6" />;
  }
};

const getBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50';
    case 'error':
      return 'bg-red-50';
    case 'warning':
      return 'bg-amber-50';
    case 'info':
      return 'bg-blue-50';
  }
};

const getBorderColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-green-200';
    case 'error':
      return 'border-red-200';
    case 'warning':
      return 'border-amber-200';
    case 'info':
      return 'border-blue-200';
  }
};

const getTextColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'text-green-800';
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-amber-800';
    case 'info':
      return 'text-blue-800';
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
            className={`w-80 mt-10 py-1 ${getBackgroundColor('success')} ${getBorderColor('success')} border-2 rounded-lg shadow-lg z-50`}
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              {getIcon('success')}
              <View className="flex-1 flex-col">
                <ToastTitle className={`${getTextColor('success')} text-base font-semibold`}>{title}</ToastTitle>
                <ToastDescription className={`${getTextColor('success')} text-sm opacity-90`}>{message}</ToastDescription>
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
            className={`w-80 mt-10 py-1 ${getBackgroundColor('error')} ${getBorderColor('error')} border-2 rounded-lg shadow-lg z-50`}
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              {getIcon('error')}
              <View className="flex-1 flex-col">
                <ToastTitle className={`${getTextColor('error')} text-base font-semibold`}>{title}</ToastTitle>
                <ToastDescription className={`${getTextColor('error')} text-sm opacity-90`}>{message}</ToastDescription>
              </View>
            </View>
          </Toast>
        );
      },
    });
  };

  const showWarning = ({ title = '警告', message, duration = 3000 }: ToastOptions) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        return (
          <Toast 
            action="warning" 
            variant="solid"
            className={`w-80 mt-10 py-1 ${getBackgroundColor('warning')} ${getBorderColor('warning')} border-2 rounded-lg shadow-lg z-50`}
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              {getIcon('warning')}
              <View className="flex-1 flex-col">
                <ToastTitle className={`${getTextColor('warning')} text-base font-semibold`}>{title}</ToastTitle>
                <ToastDescription className={`${getTextColor('warning')} text-sm opacity-90`}>{message}</ToastDescription>
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
            className={`w-80 mt-10 py-1 ${getBackgroundColor('info')} ${getBorderColor('info')} border-2 rounded-lg shadow-lg z-50`}
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              {getIcon('info')}
              <View className="flex-1 flex-col">
                <ToastTitle className={`${getTextColor('info')} text-base font-semibold`}>{title}</ToastTitle>
                <ToastDescription className={`${getTextColor('info')} text-sm opacity-90`}>{message}</ToastDescription>
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

