import SingleLampForm, { SingleLampFormData } from '@/components/addDevice/SingleLampForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { addSingleLamp, getSingleLampById, updateSingleLamp } from '@/services/database';
import { useAreaStore } from '@/store/areaStore';
import useLoadingStore from '@/store/loadingStore';
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836');

export default function AddSingleLampModal() {
    const insets = useSafeAreaInsets();
    const currentTheme = useCurrentTheme();
    const { showWarning, showSuccess } = useCustomToast();
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const { showLoading, hideLoading } = useLoadingStore();
    const { allAreaList } = useAreaStore();
    const [allAreaListprops, setAllAreaListprops] = useState<any>([]);
    const { id } = useLocalSearchParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState<SingleLampFormData>({
        pole_code: '',
        pole_type: '',
        location: '',
        area_id: '',
        lat: '',
        lng: '',
    });

    useEffect(() => {
        if (isEdit) {
            const data = getSingleLampById(Number(id));
            if (data) {
                setFormData({
                    pole_code: data.pole_code,
                    pole_type: data.pole_type || '',
                    location: data.location || '',
                    area_id: data.area_id?.toString() || '',
                    lat: data.lat || '',
                    lng: data.lng || '',
                });
            }
        }
    }, [id, isEdit]);

    const getCurrentLocation = async () => {
        try {
            setIsLoadingLocation(true);
            const location = await locationService.getCurrentLocation({
                enableHighAccuracy: true,
                timeout: 15000,
                useIPFallback: true,
                useCachedLocation: true
            });

            if (location && location.coords) {
                setFormData(prev => ({
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
            showWarning({
                message: error.message || "获取位置信息失败",
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleSubmit = () => {
        try {
            showLoading();
            if (isEdit) {
                updateSingleLamp(Number(id), formData);
                showSuccess({ message: '更新成功' });
            } else {
                addSingleLamp(formData);
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
        const setAllAreaListpropsData = allAreaList.map((item: any) => {
            return {
                key: item.area_id,
                value: item.area_id,
                label: item.name,
            }
        })
        setAllAreaListprops(setAllAreaListpropsData)
    }, [allAreaList]);

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
                    {isEdit ? '编辑单灯' : '新增单灯'}
                </Text>
            </View>

            <SingleLampForm
                formData={formData}
                onFormDataChange={setFormData}
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
