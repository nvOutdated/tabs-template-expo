import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useCustomToast } from '../public/UIComponents/ToastComponent';
import type { Marker } from './AMapWebView';
import AMapWebView from './AMapWebView';
// import eleBoxImage from "@/assets/icons/ebox.png"
type continerItem={
   container_id:number,
   container_type:string,
   device_code:string,
   device_type:string,
   lat:number,
   lng:number,
   name:string,
   online:boolean,
   open:boolean,
   warn:boolean,
}
type props = {
  containerList:continerItem[]
}
export default function MapExample({containerList}:props){
  const { showInfo } = useCustomToast();
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    const newMarkers = containerList.map(item => ({
      id: item.container_id.toString(),
      position: { latitude: item.lat, longitude: item.lng },
      title: item.device_code,
      info: `Container: ${item.name}`,
      icon: {
        size: [40, 80] as [number, number],
        image: ''
      }
    }));
    setMarkers(newMarkers);
  }, [containerList]);

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

// export default MapExample; 