import { add_ebox, get_version_list } from '@/api/street/streetCommon';
import EboxForm, { EboxFormData } from '@/components/addDevice/EboxForm';
import SingleLampForm, { SingleLampFormData } from '@/components/addDevice/SingleLampForm';
import SmartLampForm, { SmartLampFormData } from '@/components/addDevice/SmartLampForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useAreaStore } from '@/store/areaStore';
import useLoadingStore from '@/store/loadingStore';
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// 定义tab标题
const TAB_CONFIG = [
  { name: "ebox", title: "集中器" },
  { name: "smartLamp", title: "网关" },
  { name: "singleLamp", title: "单灯" },
] as const;

// 初始化高德地图定位服务
const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836');

// 自定义TabBar组件
function CustomTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
 
  const tabWidth = useMemo(() => {
    const availableWidth = width;
    return availableWidth / TAB_CONFIG.length;
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: currentTheme.drawerBg,
        height: 44,
        width: width,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // 从配置中获取标题
        const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
        const displayLabel = typeof label === 'string' ? label : (tabConfig?.title || route.name);

        return (
          <View
            key={route.key}
            style={{
              width: tabWidth,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={onPress}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
            >
              <Text
                style={{
                  color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
                  fontSize: isFocused ? 16 : 14,
                  fontWeight: isFocused ? "700" : "400",
                  textAlign: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: isFocused ? currentTheme.activeTint : 'transparent'
                }}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

export default function AddDeviceModal() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const { showWarning, showSuccess } = useCustomToast();
  const [versionList, setVersionList] = useState<any>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const {showLoading,hideLoading,isLoading} = useLoadingStore()
  const [currentTab, setCurrentTab] = useState('ebox');
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { allAreaList } = useAreaStore();
  const [allAreaListprops,setAllAreaListprops] = useState<any>([])
  // 表单数据状态
  const [eboxFormData, setEboxFormData] = useState<EboxFormData>({
    device_info:{
      device_code:"",
      device_type:"Central",
      e_meter:"",
    },
    ebox_type: 'CABINET',
    name: '',
    sn: '',
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
        try {
          showLoading()
          add_ebox({...eboxFormData}).then(res => {
            if (res.code == 200) {
              showSuccess({ message: '添加成功' });
            }else{
              showWarning({ message: res.message || '添加失败' });
            }
          });
        } catch (error:any) {
          showWarning({ message: error.message || '添加失败' });
        }finally{
          hideLoading()
        }
        break;
      case 'smartLamp':
        // 处理智能灯表单提交
        console.log('Smart Lamp Data:', smartLampFormData);
        break;
      case 'singleLamp':
        // 处理单灯表单提交
        console.log('Single Lamp Data:', singleLampFormData);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    get_version_list({}).then(res => {
      if (res.code === 200) {
        const setVersionListData = res.data.map((item:any)=>{
          return {
            key:item,
            value:item,
            label:item,
          }
        })
        setVersionList(setVersionListData)
        setEboxFormData((prev:any)=>{
          return {
            ...prev,
            version:setVersionListData[0].value
          }
        })  
      }
    })
  }, [])

  useEffect(()=>{
    const setAllAreaListpropsData = allAreaList.map((item:any)=>{
      return {
        key:item.area_id,
        value:item.area_id,
        label:item.name,
      }
    })
    setAllAreaListprops(setAllAreaListpropsData)
  },[allAreaList])
  
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
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          lazy: false,
          swipeEnabled: true,
          animationEnabled: true,
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
        {TAB_CONFIG.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
            }}
          >
            {() => {
              switch (tab.name) {
                case 'ebox':
                  return <EboxForm formData={eboxFormData} versionList={versionList} onFormDataChange={setEboxFormData} allAreaList={allAreaListprops} />;
                case 'smartLamp':
                  return <SmartLampForm formData={smartLampFormData} onFormDataChange={setSmartLampFormData} allAreaList={allAreaListprops} />;
                case 'singleLamp':
                  return <SingleLampForm formData={singleLampFormData} onFormDataChange={setSingleLampFormData} allAreaList={allAreaListprops} />;
                default:
                  return null;
              }
            }}
          </Tab.Screen>
        ))}
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
