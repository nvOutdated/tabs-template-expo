import { add_ebox, get_version_list } from '@/api/street/streetCommon';
import EboxForm, { EboxFormData } from '@/components/addDevice/EboxForm';
import SingleLampForm, { SingleLampFormData } from '@/components/addDevice/SingleLampForm';
import SmartLampForm, { SmartLampFormData } from '@/components/addDevice/SmartLampForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// 初始化高德地图定位服务
const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836'); // 请替换为您的实际高德地图 API Key

// 自定义Tab组件
const CustomTab = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: focused ? color + '10' : 'transparent',
      transform: [{ scale: withSpring(focused ? 1.02 : 1) }],
    };
  });

  return (
    <Animated.View style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }, animatedStyle]}>
      <Text
        style={{
          color,
          fontSize: 15,
          fontWeight: focused ? '600' : '500',
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </Animated.View>
  );
};

export default function AddDeviceModal() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const { showWarning,showSuccess } = useCustomToast();
  const [versionList, setVersionList] = useState<any>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentTab, setCurrentTab] = useState('ebox');
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 表单数据状态
  const [eboxFormData, setEboxFormData] = useState<EboxFormData>({
    device_code: '',
    device_type: 'Central',
    name: '',
    sn: '',
    ebox_type: 'CABINET',
    area_id: '',
    version: '',
    install_time: undefined,
    lng: '',
    lat: '',
    model: '',
    e_meter: '',
    remark: '',
  });
  const [smartLampFormData, setSmartLampFormData] = useState<SmartLampFormData>({
    name: '',
    device_code: '',
    location: '',
    gateway_code: '',
    area_id: '',
    lat: '',
    lng: '',
  });
  const [singleLampFormData, setSingleLampFormData] = useState<SingleLampFormData>({
    pole_code: '',
    pole_type: '',
    location: '',
    area_id: '',
    lat: '',
    lng: '',
  });

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限',
          message: 'App 需要访问您的位置以提供服务',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('未授予位置权限');
      return;
    }
    console.log(hasPermission,"开始获取位置");
    
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position,"位置");
        
        setLocation(position);
        setError(null);
      },
      (err) => {
        console.log(err,"错误");
        
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
    console.log(location,"获取位置结束");
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      // getLocation()
      // 使用高德地图定位服务获取位置
      const location = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        useIPFallback: true,
        useCachedLocation: true
      });

      if (location && location.coords) {
        // 根据当前选中的tab，更新对应的表单
        switch (currentTab) {
          case 'ebox':
            setEboxFormData(prev => ({
              ...prev,
              lat: location.coords.latitude.toString(),
              lng: location.coords.longitude.toString()
            }));
            break;
          case 'smartLamp':
            setSmartLampFormData(prev => ({
              ...prev,
              lat: location.coords.latitude.toString(),
              lng: location.coords.longitude.toString()
            }));
            break;
          case 'singleLamp':
            setSingleLampFormData(prev => ({
              ...prev,
              lat: location.coords.latitude.toString(),
              lng: location.coords.longitude.toString()
            }));
            break;
        }
        console.log(location,"地址");
        
        showSuccess({
          message: `位置获取成功${location.address ? `: ${location.address}` : ''}`,
        });
      } else {
        throw new Error('获取位置信息失败');
      }
    } catch (error: any) {
      // console.error('Error getting location:', error);
      showWarning({
        message: error.message || "获取位置信息失败",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = () => {
    switch (currentTab) {
      case 'ebox':
        add_ebox(eboxFormData).then(res => {
          if (res.code == 200) {
            showSuccess({ message: '添加成功' });
            router.back();
          }
        });
        break;
      case 'smartLamp':
        // 处理智能灯表单提交
        console.log('Smart Lamp Data:', smartLampFormData);
        break;
      case 'singleLamp':
        // 处理单灯表单提交
        console.log('Single Lamp Data:', singleLampFormData);
        break;
    }
  };

  useEffect(() => {
    get_version_list({}).then(res => {
      if (res.code == 200) {
        setVersionList(res.data)
      }
    })
  }, [])
  
  // useEffect(()=>{
  //   getLocation()
  // },[])

  return (
    <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center justify-between px-3 py-1 border-b border-outline-100" style={{backgroundColor:currentTheme.headerBg}}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>新增设备</Text>
        <TouchableOpacity
          onPress={() => router.push('/(logging-in)/(modal)/scannerModal')}
          className="p-2"
        >
          <Ionicons name="scan-outline" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
      </View>

      {/* 设备类型选择 */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            backgroundColor: currentTheme.activeTint,
            height: 2,
            width: width / 3,
          },
          tabBarStyle: {
            backgroundColor: currentTheme.drawerBg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            padding: 0,
            height: 44,
          },
          tabBarLabel: (props) => <CustomTab {...props} />,
          tabBarItemStyle: {
            width: width / 3,
            height: 44,
            padding: 0,
            margin: 0,
          },
          tabBarIndicatorContainerStyle: {
            backgroundColor: currentTheme.drawerBg,
          },
          tabBarPressColor: 'transparent',
          tabBarPressOpacity: 0.7,
        }}
        screenListeners={{
          state: (e) => {
            const state = e.data.state;
            if (state?.index !== undefined) {
              const routes = ['ebox', 'smartLamp', 'singleLamp'];
              setCurrentTab(routes[state.index]);
            }
          },
        }}
      >
        <Tab.Screen
          name="ebox"
          options={{ title: '集中器' }}
        >
          {() => <EboxForm formData={eboxFormData} versionList={versionList} onFormDataChange={setEboxFormData} />}
        </Tab.Screen>
        <Tab.Screen
          name="smartLamp"
          options={{ title: '网关' }}
        >
          {() => <SmartLampForm formData={smartLampFormData} onFormDataChange={setSmartLampFormData} />}
        </Tab.Screen>
        <Tab.Screen
          name="singleLamp"
          options={{ title: '单灯' }}
        >
          {() => <SingleLampForm formData={singleLampFormData} onFormDataChange={setSingleLampFormData} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* 底部按钮区域 */}
      <View className="p-4 bg-secondary-200 border-t border-t-outline-100 text-center border-outline-100">
        <View className="flex-row space-x-4">
          <TouchableOpacity 
            className="flex-1 h-11 rounded-lg items-center justify-center bg-typography-500 mr-2"
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-tertiary-100">获取位置</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 h-11 rounded-lg items-center justify-center bg-info-500"
            onPress={handleSubmit}
          >
            <Text className="text-base font-semibold text-tertiary-100">提交</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
