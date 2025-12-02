import { add_ebox, get_version_list } from '@/api/street/streetCommon';
import EboxForm, { EboxFormData } from '@/components/addDevice/EboxForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useAreaStore } from '@/store/areaStore';
import { useEboxStore } from '@/store/eboxStore';
import useLoadingStore from '@/store/loadingStore';
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import {locationService} from "@/utils/locationService"
// 初始化高德地图定位服务
const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836');

export default function AddDeviceModal() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const { showWarning, showSuccess } = useCustomToast();
  const [versionList, setVersionList] = useState<any>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { showLoading, hideLoading } = useLoadingStore()
  const { addEboxNode } = useEboxStore();
  const { allAreaList } = useAreaStore();
  const [allAreaListprops, setAllAreaListprops] = useState<any>([])
  // 表单数据状态
  const [eboxFormData, setEboxFormData] = useState<EboxFormData>({
    device_info: {
      device_code: "",
      device_type: "Central",
      e_meter: "",
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
    acProductId: 0,
  });

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
        // 更新集中器表单的位置信息
        setEboxFormData(prev => ({
          ...prev,
          lat: location.coords.latitude.toString(),
          lng: location.coords.longitude.toString()
        }));

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
    try {
      showLoading()
      add_ebox({ ...eboxFormData }).then(res => {
        if (res.code == 200) {
          const addEboxData: any = { ...eboxFormData, id: res?.data?.id }
          addEboxNode(addEboxData)
          showSuccess({ message: '添加成功' });
        } else {
          showWarning({ message: res.message || '添加失败' });
        }
      });
    } catch (error: any) {
      showWarning({ message: error.message || '添加失败' });
    } finally {
      hideLoading()
    }
  };

  useEffect(() => {
    get_version_list({}).then(res => {
      if (res.code === 200) {
        const setVersionListData = res.data.map((item: any) => {
          return {
            key: item,
            value: item,
            label: item,
          }
        })
        setVersionList(setVersionListData)
        setEboxFormData((prev: any) => {
          return {
            ...prev,
            version: setVersionListData[0].value
          }
        })
      }
    })
  }, [])

  useEffect(() => {
    const setAllAreaListpropsData = allAreaList.map((item: any) => {
      return {
        key: item.area_id,
        value: item.area_id,
        label: item.name,
      }
    })
    setAllAreaListprops(setAllAreaListpropsData)
  }, [allAreaList])

  // useEffect(()=>{
  //   getLocation()
  // },[])

  return (
    <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center  px-3 py-1 border-b border-outline-100" style={{ backgroundColor: currentTheme.headerBg }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 "
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-[30%]" style={{ color: currentTheme.textColor }}>新增集中器</Text>

        {/*   <TouchableOpacity
          onPress={() => router.push('/(logging-in)/(modal)/scannerModal')}
          className="p-2"
        >
          <Ionicons name="scan-outline" size={24} color={currentTheme.textColor} />
        </TouchableOpacity> */}
      </View>

      {/* 设备类型选择 */}
      <EboxForm formData={eboxFormData} versionList={versionList} onFormDataChange={setEboxFormData} allAreaList={allAreaListprops} />

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
