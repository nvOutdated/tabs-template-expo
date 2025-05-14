import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useCustomToast } from '../public/UIComponents/ToastComponent';
import type { Marker } from './AMapWebView';
import AMapWebView from './AMapWebView';
// import eleBoxImage from "@/assets/icons/ebox.png"

type continerItem = {
   container_id: number,
   container_type: string,
   device_code: string,
   device_type: string,
   lat: number,
   lng: number,
   name: string,
   online: boolean,
   open: boolean,
   warn: boolean,
   id: number,
}

type props = {
  containerList: continerItem[],
  selectedMarker?: continerItem | null
}

const MapExample = ({ containerList, selectedMarker }: props) => {
  const { showInfo } = useCustomToast();
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    const newMarkers = containerList.map((item, index) => ({
      id: `${item.id}_${index}`,
      position: { latitude: item.lat, longitude: item.lng },
      title: item.name,
      info: item.device_code,
      icon: {
        size: [40, 40] as [number, number],
        image: ''
      }
    }));
    setMarkers(newMarkers);
  }, [containerList]);

  // 生成moveTo对象
  const moveTo = selectedMarker
    ? { position: { latitude: selectedMarker.lat, longitude: selectedMarker.lng }, zoom: 16 }
    : null;

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
        moveTo={moveTo}
        onMarkerPress={handleMarkerPress}
        onMapPress={handleMapPress}
      />
    </View>
  );
};

export default MapExample;