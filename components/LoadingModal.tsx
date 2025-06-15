import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        // entering={FadeIn} 
        // exiting={FadeOut}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="bg-white rounded-2xl p-6 items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Animated.View>
    </Modal>
  );
};

export default LoadingModal; 