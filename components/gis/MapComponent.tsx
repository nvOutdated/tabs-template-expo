import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { MapType, MapView } from 'react-native-amap3d';

export default function MapComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // setErrorMsg('需要位置权限才能显示地图');
          // Alert.alert('错误', '需要位置权限才能显示地图');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log('当前位置:', location);
      } catch (error) {
        console.log('获取位置失败:', error);
        // setErrorMsg('获取位置失败');
        // Alert.alert('错误', '获取位置失败');
      }
    })();
  }, []);

  const initialCameraPosition = {
    target: location ? {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    } : {
      latitude: 39.91095,
      longitude: 116.37296,
    },
    zoom: 15,
    tilt: 0,
  };

  return (
    <View style={styles.container}>
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      <MapView
        style={styles.map}
        initialCameraPosition={initialCameraPosition}
        mapType={MapType.Standard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.6,
  },
  errorText: {
    color: 'red',
    padding: 10,
    textAlign: 'center',
  },
});