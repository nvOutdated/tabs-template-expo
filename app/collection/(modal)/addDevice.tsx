import EboxForm, { EboxFormData } from '@/components/addDevice/EboxForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { getEboxById } from '@/services/database';
import { useCollectionEntitiesStore } from '@/store/collectionEntitiesStore';
import useLoadingStore from '@/store/loadingStore';
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836');

export default function AddDeviceModal() {
    const insets = useSafeAreaInsets();
    const currentTheme = useCurrentTheme();
    const { showWarning, showSuccess } = useCustomToast();
    const [versionList, setVersionList] = useState<any>([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const { showLoading, hideLoading } = useLoadingStore();
    const [allAreaListprops, setAllAreaListprops] = useState<any>([]);
    const { id, area_id } = useLocalSearchParams();
    const isEdit = !!id;

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
        version: '未知协议',
        install_time: undefined,
        lng: '',
        lat: '',
        model: '',
        e_meter: '',
        remark: '',
    });

    const flatAreas = useCollectionEntitiesStore(state => state.flatAreas);
    const refreshAreas = useCollectionEntitiesStore(state => state.refreshAreas);
    const createEbox = useCollectionEntitiesStore(state => state.createEbox);
    const editEbox = useCollectionEntitiesStore(state => state.editEbox);

    useEffect(() => {
        refreshAreas();
    }, [refreshAreas]);

    useEffect(() => {
        const options = flatAreas.map((item: any) => ({
            key: item.area_id,
            value: item.area_id,
            label: item.name,
        }));
        setAllAreaListprops(options);
    }, [flatAreas]);

    useEffect(() => {
        if (isEdit) {
            const data = getEboxById(Number(id));
            if (data) {
                setEboxFormData({
                    ...data,
                    area_id: data.area_id?.toString() || '',
                    install_time: data.install_time ? new Date(data.install_time) : undefined,
                });
            }
        } else if (area_id) {
            setEboxFormData(prev => ({
                ...prev,
                area_id: area_id.toString()
            }));
        }
    }, [id, isEdit, area_id]);

    const getCurrentLocation = async () => {
        try {
            setIsLoadingLocation(true);
            const location = await locationService.getCurrentLocation({
                enableHighAccuracy: true,
                timeout: 3000,
                useIPFallback: true,
                useCachedLocation: true
            });

            if (location && location.coords) {
                setEboxFormData(prev => ({
                    ...prev,
                    lat: location.coords.latitude.toString(),
                    lng: location.coords.longitude.toString()
                }));
                showSuccess({
                    message: `位置获取成功`,
                });
            } else {
                const location = await Location.getLastKnownPositionAsync();
                if (location) {
                    setEboxFormData(prev => ({
                        ...prev,
                        lat: location.coords.latitude.toString(),
                        lng: location.coords.longitude.toString()
                    }));
                    showSuccess({
                        message: `位置获取成功`,
                    });
                } else {
                    throw new Error('获取位置信息失败');
                }
            }
        } catch (error: any) {
            showWarning({
                message: error.message || "获取位置信息失败",
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleSubmit = () => {
        // Validate area_id
        if (!eboxFormData.area_id) {
            Alert.alert('提示', '请选择区域');
            return;
        }

        try {
            showLoading();
            if (isEdit) {
                editEbox(Number(id), eboxFormData);
                showSuccess({ message: '更新成功' });
            } else {
                createEbox(eboxFormData);
                showSuccess({ message: '添加成功' });
            }
            router.back();
        } catch (error: any) {
            showWarning({ message: error.message || '操作失败' });
        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        // Mock version list for offline mode
        setVersionList([
            { key: 0, value: '未知协议', label: '未知协议' },
            { key: 1, value: '老协议', label: '老协议' },
            { key: 2, value: '20240424协议', label: '20240424协议' },
        ]);
        if (!isEdit) {
            setEboxFormData(prev => ({ ...prev, version: '20240424协议' }));
        }
    }, [isEdit]);

    return (
        <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center px-3 py-1 border-b border-outline-100" style={{ backgroundColor: currentTheme.headerBg }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 "
                >
                    <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold ml-[30%]" style={{ color: currentTheme.textColor }}>
                    {isEdit ? '编辑集中器' : '新增集中器'}
                </Text>
            </View>

            <EboxForm
                formData={eboxFormData}
                versionList={versionList}
                onFormDataChange={setEboxFormData}
                allAreaList={allAreaListprops}
            />

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
