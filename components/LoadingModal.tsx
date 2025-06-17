import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn.duration(100)}
        exiting={FadeOut.duration(100)}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="bg-white rounded-2xl p-6 items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className='mt-1 '>waiting bro!</Text>
        </View>
        {/* <View >
          <Text>waiting bro!</Text>
        </View> */}
      </Animated.View>
    </Modal>
  );
};

export default LoadingModal; 