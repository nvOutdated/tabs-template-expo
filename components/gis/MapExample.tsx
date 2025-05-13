import { lampIcons } from '@/utils/mapIconBase64';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useCustomToast } from '../public/UIComponents/ToastComponent';
import type { Marker } from './AMapWebView';
import AMapWebView from './AMapWebView';
// import eleBoxImage from "@/assets/icons/ebox.png"

const MapExample: React.FC = () => {
  const { showInfo } = useCustomToast();
  const [markers] = useState<Marker[]>([
    {
      id: '1',
      position: { latitude: 30.67626, longitude: 103.96613 },
      title: '成都市中心',
      info: '这是成都市中心',
      icon: {
        size: [40, 80] as [number, number],
        image: lampIcons.singleLight
      }
    },
    {
      id: '2',
      position: { latitude: 30.68626, longitude: 103.97613 },
      title: '天府广场',
      info: '这是天府广场',
      icon: {
        size: [40, 80] as [number, number],
        image: lampIcons.singleLight
      }
    },
    {
      id: '3',
      position: { latitude: 30.69626, longitude: 103.98613 },
      title: '春熙路',
      info: '这是春熙路',
      icon: {
        size: [40, 80] as [number, number],
        image: lampIcons.singleLight
      }
    },
    // 可以添加更多标记点
  ]);

  const handleMarkerPress = (marker: any) => {
    showInfo({
      title: marker.title,
      message: marker.info || '点击了标记点'
    });
  };

  const handleMapPress = (position: { latitude: number; longitude: number }) => {
    showInfo({
      title: '地图点击',
      message: `纬度: ${position.latitude.toFixed(6)}, 经度: ${position.longitude.toFixed(6)}`
    });
  };

  return (
    <View className="flex-1">
      <AMapWebView
        markers={markers}
        zoom={13}
        onMarkerPress={handleMarkerPress}
        onMapPress={handleMapPress}
      />
    </View>
  );
};

export default MapExample; 