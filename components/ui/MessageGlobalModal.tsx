import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageGlobalModalProps {
  visible: boolean;
  type: MessageType;
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top' | 'center' | 'bottom';
}

export interface MessageGlobalModalOptions {
  type: MessageType;
  message: string;
  title?: string;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  debounceTime?: number;
}

const getIcon = (type: MessageType) => {
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

const getBackgroundColor = (type: MessageType) => {
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

const getBorderColor = (type: MessageType) => {
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

const getTextColor = (type: MessageType) => {
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

const MessageGlobalModal: React.FC<MessageGlobalModalProps> = ({
  visible,
  type,
  message,
  title,
  duration = 3000,
  onClose,
  position = 'top'
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const show = useCallback(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withSpring(-100, {
      damping: 15,
      stiffness: 100,
    }, () => {
      if (onClose) {
        runOnJS(onClose)();
      }
    });
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      show();
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hide();
        }, duration);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration, show, hide]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-transparent">
        <View 
          className={`absolute left-0 right-0 ${
            position === 'top' ? 'top-10' : 
            position === 'center' ? 'top-1/2' : 
            'bottom-10'
          }`}
        >
          <Animated.View 
            style={[animatedStyle]}
            className={`mx-4 ${getBackgroundColor(type)} ${getBorderColor(type)} border-2 rounded-lg shadow-lg`}
          >
            <View className="flex-row items-center gap-2 px-4 py-3">
              {getIcon(type)}
              <View className="flex-1">
                {title && (
                  <Text className={`${getTextColor(type)} text-base font-semibold`}>
                    {title}
                  </Text>
                )}
                <Text className={`${getTextColor(type)} text-sm opacity-90`}>
                  {message}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

// 创建一个全局的 Modal 管理器
let modalRef: ((options: MessageGlobalModalOptions) => void) | null = null;

export const showMessageModal = (options: MessageGlobalModalOptions) => {
  if (modalRef) {
    modalRef(options);
  }
};

export const setModalRef = (ref: (options: MessageGlobalModalOptions) => void) => {
  modalRef = ref;
};

export default MessageGlobalModal;
