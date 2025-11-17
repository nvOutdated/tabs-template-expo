import React from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface RemoveTipModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveTipModal: React.FC<RemoveTipModalProps> = ({
  visible,
  title = '警告',
  message = '确定要删除此内容吗？此操作不可撤销。',
  onConfirm,
  onCancel,
}) => {
  const translateY = useSharedValue(height);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = withTiming(height, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withTiming(height, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onCancel)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onCancel}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            className="w-80 bg-white rounded-xl p-6 shadow-lg"
            style={animatedStyle}
          >
            <Text className="text-lg font-bold text-red-600 mb-2 text-center">{title}</Text>
            <Text className="text-base text-gray-700 mb-6 text-center">{message}</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 py-1 mr-2 rounded bg-gray-200"
                onPress={onCancel}
              >
                <Text className="text-center text-gray-700">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-1 ml-2 rounded bg-red-600"
                onPress={onConfirm}
              >
                <Text className="text-center text-white">确定</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

export default RemoveTipModal;
