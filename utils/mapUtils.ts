

interface LocationCoords {
  longitude: number;
  latitude: number;
  accuracy?: number|undefined|null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface LocationResult {
  coords: LocationCoords;
  address?: string;
  addressDetail?: {
    province?: string;
    city?: string;
    district?: string;
    adcode?: string;
  };
  timestamp: number;
  source: 'gps' | 'ip' | 'cache' | 'h5';
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  useIPFallback?: boolean;
  useCachedLocation?: boolean;
  maxCacheAge?: number;
  // accuracy?: Location.Accuracy;
  maxAge?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface AddressResult {
  formattedAddress: string;
  province?: string;
  city?: string;
  district?: string;
  adcode?: string;
}

export class ExpoAmapLocationService {
  private apiKey: string;
  private baseUrl: string;
  private lastKnownLocation: LocationResult | null;
  private locationCache: Map<string, CacheEntry<any>>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://restapi.amap.com/v3';
    this.lastKnownLocation = null;
    this.locationCache = new Map();
  }


  // 通过IP定位获取大概位置
  private async getLocationByIP(): Promise<LocationResult> {
    const cacheKey = 'ip_location';
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${this.baseUrl}/ip?key=${this.apiKey}&output=json`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === '1' && data.rectangle) {
        const coords = data.rectangle.split(';');
        const leftBottom = coords[0].split(',');
        const rightTop = coords[1].split(',');
        
        const longitude = (parseFloat(leftBottom[0]) + parseFloat(rightTop[0])) / 2;
        const latitude = (parseFloat(leftBottom[1]) + parseFloat(rightTop[1])) / 2;
        // const address = await this.reverseGeocode(
        //     longitude,
        //     latitude
        //   );
          
        const result: LocationResult = {
          coords: {
            longitude,
            latitude,
            accuracy: 10000,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          address: `${data.province}${data.city}`,
          addressDetail: {
            province: data.province,
            city: data.city,
            district: data.district,
            adcode: data.adcode
          },
          timestamp: Date.now(),
          source: 'ip'
        };

        this.locationCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
      
      throw new Error(data.info || 'IP定位失败');
    } catch (error) {
      throw error;
    }
  }


  // 坐标转换：WGS84转GCJ02
  private async convertCoordinates(
    longitude: number,
    latitude: number,
    from: string = 'gps',
    to: string = 'autonavi'
  ): Promise<{ longitude: number; latitude: number }> {
    const cacheKey = `convert_${longitude}_${latitude}_${from}_${to}`;
    
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/assistant/coordinate/convert?locations=${longitude},${latitude}&coordsys=${from}&output=json&key=${this.apiKey}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`坐标转换HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === '1' && data.locations) {
        const coords = data.locations.split(',');
        const result = {
          longitude: parseFloat(coords[0]),
          latitude: parseFloat(coords[1])
        };

        this.locationCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
      
      return { longitude, latitude };
    } catch (error) {
      return { longitude, latitude };
    }
  }

  // 逆地理编码：根据坐标获取地址
  private async reverseGeocode(longitude: number, latitude: number): Promise<AddressResult> {
    const cacheKey = `reverse_${longitude.toFixed(6)}_${latitude.toFixed(6)}`;
    
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/geocode/regeo?location=${longitude},${latitude}&key=${this.apiKey}&radius=1000&extensions=all&output=json`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`逆地理编码HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === '1' && data.regeocode) {
        const regeocode = data.regeocode;
        const result: AddressResult = {
          formattedAddress: regeocode.formatted_address,
          province: regeocode.addressComponent?.province,
          city: regeocode.addressComponent?.city,
          district: regeocode.addressComponent?.district,
          adcode: regeocode.addressComponent?.adcode
        };

        this.locationCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
      
      throw new Error(data.info || '逆地理编码失败');
    } catch (error) {
      throw error;
    }
  }

  // 使用高德H5定位
  private async getLocationByH5(): Promise<LocationResult> {
    const cacheKey = 'h5_location';
    console.log("使用H5定位");
    
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5分钟缓存
        return cached.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${this.baseUrl}/ip/geolocation?key=${this.apiKey}&output=json`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`H5定位HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      console.log(data,"h5定位返回");
      
      if (data.status === '1' && data.location) {
        const [longitude, latitude] = data.location.split(',').map(Number);
        console.log(longitude,latitude,"详细地址");
        
        const result: LocationResult = {
          coords: {
            longitude,
            latitude,
            accuracy: data.accuracy || 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
          source: 'h5'
        };

        // 尝试获取地址信息
        try {
          const address = await this.reverseGeocode(longitude, latitude);
          result.address = address.formattedAddress;
          result.addressDetail = {
            province: address.province,
            city: address.city,
            district: address.district,
            adcode: address.adcode
          };
        } catch (addressError) {
          console.log('地址解析失败:', addressError);
        }

        this.locationCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
      
      throw new Error(data.info || 'H5定位失败');
    } catch (error) {
      throw error;
    }
  }

  // 修改综合定位方法，添加H5定位
  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationResult> {
    const {
      useIPFallback = true,
    } = options;

    let lastError: Error | null = null;


    // 3. 尝试H5定位
    try {
      return await this.getLocationByH5();
    } catch (h5Error) {
      lastError = h5Error as Error;
    }

    // 4. 最后尝试IP定位
    if (useIPFallback) {
      try {
        return await this.getLocationByIP();
      } catch (ipError) {
        lastError = ipError as Error;
      }
    }

    // 所有定位方式都失败
    throw new Error(lastError?.message || '所有定位方式都失败了，请检查网络连接和定位权限');
  }

  // 清理缓存
  clearCache(): void {
    this.locationCache.clear();
    this.lastKnownLocation = null;
  }

  // 获取缓存统计
  getCacheStats(): {
    cacheSize: number;
    hasLastKnownLocation: boolean;
    lastLocationTime: number | null;
  } {
    return {
      cacheSize: this.locationCache.size,
      hasLastKnownLocation: !!this.lastKnownLocation,
      lastLocationTime: this.lastKnownLocation?.timestamp || null
    };
  }

  // 静态方法：计算两点间距离（米）
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 静态方法：验证坐标是否有效
  static isValidCoordinate(longitude: number, latitude: number): boolean {
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 && longitude <= 180 &&
      latitude >= -90 && latitude <= 90 &&
      !isNaN(longitude) && !isNaN(latitude)
    );
  }
}

export default ExpoAmapLocationService; 