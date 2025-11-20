// Force refresh
import * as Location from 'expo-location';

export interface LocationResult {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
  address?: string;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
}

export class ExpoLocationService {
  private static instance: ExpoLocationService;

  private constructor() {}

  public static getInstance(): ExpoLocationService {
    if (!ExpoLocationService.instance) {
      ExpoLocationService.instance = new ExpoLocationService();
    }
    return ExpoLocationService.instance;
  }

  /**
   * 获取当前位置
   * @param options 定位选项
   * @returns 位置信息
   */
  public async getCurrentLocation(options: LocationOptions = {}): Promise<LocationResult> {
    try {
      // 1. 请求权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      // 2. 获取位置
      const location = await Location.getCurrentPositionAsync({
        // accuracy: options.enableHighAccuracy 
        //   ? Location.Accuracy.High 
        //   : Location.Accuracy.Balanced,
      });
      console.log(location,11111);
      // let location = await Location.getCurrentPositionAsync({});
      
      // 3. 逆地理编码（可选，获取地址）
      let address = '';
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          // 拼接地址
          address = [
            addr.region, 
            addr.city, 
            addr.district, 
            addr.street, 
            addr.streetNumber, 
            addr.name
          ].filter(Boolean).join('');
        }
      } catch (e) {
        console.warn('Reverse geocoding failed', e);
      }

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
        address: address || undefined,
      };

    } catch (error: any) {
      throw new Error(error.message || 'Failed to get location');
    }
  }
}

export const locationService = ExpoLocationService.getInstance();
