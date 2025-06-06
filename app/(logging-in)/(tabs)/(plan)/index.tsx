import SimpleVideoPlayer from '@/components/camera/SimpleVideoPlayer';
import React from 'react';
import { View } from 'react-native';

export default function VideoTestScreen() {
  return (
    <View className="flex-1 bg-black">
      <SimpleVideoPlayer />
    </View>
  );
}
