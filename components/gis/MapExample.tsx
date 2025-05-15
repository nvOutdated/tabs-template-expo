import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useCustomToast } from '../public/UIComponents/ToastComponent';
import type { Marker } from './AMapWebView';
import AMapWebView from './AMapWebView';
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
   model_name?: string,
   direction?: number,
   state?: number,
   sn: string,
   single_lamp_status?: string[]
}

type props = {
  containerList: continerItem[],
  selectedMarker?: continerItem | null,
  lightList?: any[],
  mapZoom?: number
}
function getLampIconParams(data: any) {
  let singleLampDirection = '';
  let offsetY = 0, offsetX = 0, offsetIcon = 0, iconType = '';
  if (data.model_name == '1') {
    iconType = "single";
    offsetIcon = -30;
    switch (data.direction) {
      case 1: singleLampDirection = 'singleLampEast'; offsetX = 0; break;
      case 2: singleLampDirection = 'singleLampSouth'; offsetX = 220; break;
      case 3: singleLampDirection = 'singleLampWest'; offsetX = 330; break;
      case 4: singleLampDirection = 'singleLampNorth'; offsetX = 110; break;
      default: break;
    }
    switch (data.state) {
      case 1: singleLampDirection += 'open'; offsetY = 0; break;
      case 2: singleLampDirection += 'close'; offsetY = 210; break;
      case 3: singleLampDirection += 'warn'; offsetY = 420; break;
      default: break;
    }
  } else if (data.model_name == '2') {
    iconType = "double";
    offsetIcon = -30;
    switch (data.direction) {
      case 1: singleLampDirection = 'doubleLampEast'; offsetX = 0; break;
      case 2: singleLampDirection = 'doubleLampSouth'; offsetX = 220; break;
      case 3: singleLampDirection = 'doubleLampWest'; offsetX = 330; break;
      case 4: singleLampDirection = 'doubleLampNorth'; offsetX = 110; break;
      default: break;
    }
    switch (data.state) {
      case 1: offsetY = 630; singleLampDirection += 'open'; break;
      case 2: offsetY = 840; singleLampDirection += 'close'; break;
      case 3: offsetY = 1050; singleLampDirection += 'warn'; break;
      default: break;
    }
  } else if (["3", "4", "5"].includes(data.model_name)) {
    iconType = "yulan";
    offsetY = 1260;
    offsetIcon = -30;
    switch (data.state) {
      case 1: offsetX = 0; singleLampDirection = 'yulanLampOpen'; break;
      case 2: offsetX = 220; singleLampDirection = 'yulanLampClose'; break;
      case 3: offsetX = 110; singleLampDirection = 'yulanLampWarn'; break;
      default: break;
    }
  }
  return { key: singleLampDirection, offsetX, offsetY, iconType, offsetIcon };
}

const MapExample: React.FC<props> = ({ 
  containerList, 
  selectedMarker, 
  lightList = [], 
  mapZoom = 13 
}) => {
  const { showInfo } = useCustomToast();
  const [markers, setMarkers] = useState<Marker[]>([]);
  useEffect(() => {
    async function buildMarkers() {
      const containerMarkers = containerList.map((item, index) => ({
        id: `container_${item.id}_${index}`,
        position: { latitude: item.lat, longitude: item.lng },
        title: item.name,
        info: item.device_code,
        container_type:item.container_type,
        online:item.online,
        open:item.open,
        warn:item.warn,
        icon: {
          size: [40, 40] as [number, number],
          image: ''
        }
      }));
      const lightMarkers = lightList.map((item,index)=>{
        return {
              id: `light_${item.id}_${index}`,
              position: { latitude: item.lat, longitude: item.lng },
              title: item.name || '单灯',
              info: item.sn,
              container_type: item.container_type,
              single_lamp_status: item.single_lamp_status || [],
              direction: item.direction,
              icon: {
                size: [40, 80] as [number, number],
                image: 'singleLightNormal'
              }
            };
      })
      setMarkers([...containerMarkers, ...lightMarkers]);
    }
    buildMarkers();
  }, [containerList, lightList]);

  // 生成moveTo对象
  const moveTo = selectedMarker
    ? { 
        position: { latitude: selectedMarker.lat, longitude: selectedMarker.lng }, 
        zoom: 16,
        title: selectedMarker.name,
        info: selectedMarker.device_code || selectedMarker.sn,
        container_type: selectedMarker.container_type,
        online: selectedMarker.online,
        open: selectedMarker.open,
        warn: selectedMarker.warn,
        direction: selectedMarker.direction,
        single_lamp_status: selectedMarker.single_lamp_status
      }
    : null;

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
        zoom={mapZoom}
        moveTo={moveTo}
        onMapPress={handleMapPress}
        // onMapBoundsChange={handleMapBoundsChange}
      />
    </View>
  );
};

export default MapExample;