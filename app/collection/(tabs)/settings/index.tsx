import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import {
    clearAreas,
    clearConcentrators,
    clearLines,
    clearSingleLamps,
    getAllEboxes,
    getAllLines,
    getAreaList,
    getLinesByEboxId,
    getSingleLampList
} from '@/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import XLSX from 'xlsx';
import { AREA_HEADERS_MAP, CONCENTRATOR_HEADERS_MAP, SINGLE_LAMP_HEADERS_MAP, translateHeaders } from '../../../../utils/excelHeaders';
const SERVER_URL_KEY = 'remote_server_url';

export default function SettingsScreen() {
    const currentTheme = useCurrentTheme();
    const [serverUrl, setServerUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConcentratorModal, setShowConcentratorModal] = useState(false);
    const [concentratorList, setConcentratorList] = useState<any[]>([]);
    const insets = useSafeAreaInsets();
    useEffect(() => {
        loadServerUrl();
    }, []);

    const loadServerUrl = async () => {
        try {
            const url = await AsyncStorage.getItem(SERVER_URL_KEY);
            if (url) {
                setServerUrl(url);
            }
        } catch (error) {
            console.error('Failed to load server URL:', error);
        }
    };

    const saveServerUrl = async () => {
        try {
            await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
            Alert.alert('成功', '服务器地址已保存');
        } catch (error) {
            console.error('Failed to save server URL:', error);
            Alert.alert('错误', '保存失败');
        }
    };

    const handleLogout = () => {
        router.replace('/is-login');
    };

    const generateExcel = async (data: any[], fileName: string) => {
        if (!data || data.length === 0) {
            Alert.alert('提示', '没有数据可导出');
            return;
        }

        try {
            setLoading(true);
            console.log(`Exporting ${fileName}:`, JSON.stringify(data, null, 2));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

            // Cast FileSystem to any to avoid type errors with cacheDirectory
            const fs = FileSystem as any;
            const uri = (fs.cacheDirectory || fs.documentDirectory) + fileName;

            await fs.writeAsStringAsync(uri, wbout, {
                encoding: 'base64'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: '导出数据',
                    UTI: 'com.microsoft.excel.xlsx' // for iOS
                });
            } else {
                Alert.alert('错误', '无法分享文件');
            }
        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert('错误', '导出失败: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportAreas = () => {
        const data = getAreaList();
        const translatedData = translateHeaders(data, AREA_HEADERS_MAP);
        generateExcel(translatedData, 'areas_export.xlsx');
    };

    const handleClearAreas = () => {
        Alert.alert(
            '确认清空',
            '确定要清空所有区域数据吗？\n注意：这将可能导致关联的设备数据（集中器、单灯）失去区域关联！建议先备份导出。',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '确定清空',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearAreas();
                            Alert.alert('成功', '区域数据已清空');
                        } catch (e) {
                            Alert.alert('错误', '清空失败');
                        }
                    }
                }
            ]
        );
    };

    const handleExportConcentrators = () => {
        const data = getAllEboxes();
        const cleanData = data.map(item => ({
            ...item,
            device_info: JSON.stringify(item.device_info)
        }));
        const translatedData = translateHeaders(cleanData, CONCENTRATOR_HEADERS_MAP);
        generateExcel(translatedData, 'concentrators_export.xlsx');
    };

    const handleClearConcentrators = () => {
        Alert.alert(
            '确认清空',
            '确定要清空所有集中器数据吗？\n注意：这将可能导致关联的线路和单灯数据异常！',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '确定清空',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearConcentrators();
                            Alert.alert('成功', '集中器数据已清空');
                        } catch (e) {
                            Alert.alert('错误', '清空失败');
                        }
                    }
                }
            ]
        );
    };

    const handleExportLines = () => {
        const data = getAllLines();
        generateExcel(data, 'lines_export.xlsx');
    };

    const handleClearLines = () => {
        Alert.alert(
            '确认清空',
            '确定要清空所有线路数据吗？',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '确定清空',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearLines();
                            Alert.alert('成功', '线路数据已清空');
                        } catch (e) {
                            Alert.alert('错误', '清空失败');
                        }
                    }
                }
            ]
        );
    };

    const executeSingleLampExport = async (concentrator: any) => {
        setShowConcentratorModal(false);
        setLoading(true);
        try {
            const lines = getLinesByEboxId(concentrator.id);
            const wb = XLSX.utils.book_new();
            let hasData = false;

            // Process each line as a separate sheet
            for (const line of lines) {
                const lamps = getSingleLampList({ ebox_id: concentrator.id, line_id: line.id });
                if (lamps.length === 0) continue;

                const flattenedData = lamps.flatMap(lamp => {
                    const baseInfo = {
                        poleName: lamp.pole_name || '',
                        poleCode: lamp.pole_code,
                        poleType: lamp.pole_type,
                        direction: lamp.direction === 1 ? '东' : lamp.direction === 2 ? '南' : lamp.direction === 3 ? '西' : lamp.direction === 4 ? '北' : '', // Simple mapping, adjust as needed
                        lng: lamp.lng,
                        lat: lamp.lat,
                        remark: '', // Not in DB currently
                    };

                    if (!lamp.controllers || lamp.controllers.length === 0) {
                        return [baseInfo];
                    }

                    return lamp.controllers.flatMap(controller => {
                        const controllerInfo = {
                            controllerId: controller.controllerId,
                            controllerType: controller.controllerType,
                            groupIds4Save: controller.groupIds4Save?.join(',') || '',
                            productId: controller.productId || '',
                        };

                        if (!controller.lamps || controller.lamps.length === 0) {
                            return [{ ...baseInfo, ...controllerInfo }];
                        }

                        return controller.lamps.map(head => ({
                            ...baseInfo,
                            ...controllerInfo,
                            lightLoop: head.lightLoop,
                            lightingType: head.lightingType === 1 ? '机动车' : head.lightingType === 2 ? '非机动车' : '其他', // Simple mapping
                            cfgName: head.cfgName,
                            phase: head.phase
                        }));
                    });
                });

                if (flattenedData.length > 0) {
                    const translatedData = translateHeaders(flattenedData, SINGLE_LAMP_HEADERS_MAP);
                    const ws = XLSX.utils.json_to_sheet(translatedData);
                    XLSX.utils.book_append_sheet(wb, ws, line.name || `Line ${line.id}`);
                    hasData = true;
                }
            }



            if (!hasData) {
                Alert.alert('提示', '该集中器下没有线路或单灯数据');
                return;
            }

            const fileName = `${concentrator.device_code || concentrator.sn || 'export'}.xlsx`;
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

            const fs = FileSystem as any;
            const uri = (fs.cacheDirectory || fs.documentDirectory) + fileName;

            await fs.writeAsStringAsync(uri, wbout, { encoding: 'base64' });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: '导出数据',
                    UTI: 'com.microsoft.excel.xlsx'
                });
            }
        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert('错误', '导出失败: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportSingleLamps = () => {
        const eboxes = getAllEboxes();
        if (eboxes.length === 0) {
            Alert.alert('提示', '没有集中器数据，无法导出');
            return;
        }
        setConcentratorList(eboxes);
        setShowConcentratorModal(true);
    };

    const handleClearSingleLamps = () => {
        Alert.alert(
            '确认清空',
            '确定要清空所有单灯数据吗？',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '确定清空',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearSingleLamps();
                            Alert.alert('成功', '单灯数据已清空');
                        } catch (e) {
                            Alert.alert('错误', '清空失败');
                        }
                    }
                }
            ]
        );
    };

    const handleClearAll = () => {
        Alert.alert(
            '严重警告',
            '确定要清空所有本地数据吗？此操作不可恢复！\n包括：区域、集中器、线路、单灯所有数据。',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '全部清空',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearSingleLamps();
                            clearLines();
                            clearConcentrators();
                            clearAreas();
                            Alert.alert('成功', '所有数据已清空');
                        } catch (e) {
                            Alert.alert('错误', '清空失败');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: currentTheme.drawerBg, paddingTop: insets.top }}>
            <View style={{ padding: 10 }}>
                {/* Server Configuration */}
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: currentTheme.textColor }}>
                        服务器配置
                    </Text>
                    <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10 }}>
                        <Text style={{ marginBottom: 5, color: '#666' }}>远程服务器地址</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#ddd',
                                padding: 4,
                                borderRadius: 5,
                                marginBottom: 10,
                                fontSize: 16,
                                lineHeight: 26
                            }}
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            placeholder="http://example.com:8080"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#1890ff',
                                padding: 12,
                                borderRadius: 5,
                                alignItems: 'center'
                            }}
                            onPress={saveServerUrl}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>保存地址</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Data Export */}
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: currentTheme.textColor }}>
                        数据导出
                    </Text>
                    <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10, gap: 5 }}>
                        <DataManagementRow
                            title="区域数据 (Areas)"
                            onExport={handleExportAreas}
                            onClear={handleClearAreas}
                            exportColor="#52c41a"
                        />
                        <DataManagementRow
                            title="集中器数据 (Concentrators)"
                            onExport={handleExportConcentrators}
                            onClear={handleClearConcentrators}
                            exportColor="#13c2c2"
                        />
                        {/*   <DataManagementRow
                            title="线路数据 (Lines)"
                            onExport={handleExportLines}
                            onClear={handleClearLines}
                            exportColor="#722ed1"
                        /> */}
                        <DataManagementRow
                            title="单灯数据 (Single Lamps)"
                            onExport={handleExportSingleLamps}
                            onClear={handleClearSingleLamps}
                            exportColor="orange"
                        />

                        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#ff4d4f',
                                padding: 10,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={handleClearAll}
                        >
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>清空所有数据</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout */}
                <View style={{ marginTop: 0, padding: 10 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#fa8c16',
                            padding: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                        onPress={handleLogout}
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>退出信息采集系统</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ActivityIndicator size="large" color="#1890ff" />
                </View>
            )}

            <Modal
                visible={showConcentratorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowConcentratorModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
                        <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>选择集中器导出</Text>
                            <TouchableOpacity onPress={() => setShowConcentratorModal(false)}>
                                <Text style={{ color: '#666', fontSize: 16 }}>取消</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={concentratorList}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                                    onPress={() => executeSingleLampExport(item)}
                                >
                                    <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                                        SN: {item.sn} | Code: {item.device_code || 'N/A'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const DataManagementRow = ({ title, onExport, onClear, exportColor }: { title: string, onExport: () => void, onClear: () => void, exportColor: string }) => (
    <View style={{ marginBottom: 15 }}>
        <Text style={{ marginBottom: 8, fontWeight: '600', color: '#333' }}>{title}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: exportColor,
                    padding: 12,
                    borderRadius: 5,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}
                onPress={onExport}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>导出 Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{
                    flex: 0.4,
                    backgroundColor: '#ff4d4f',
                    padding: 12,
                    borderRadius: 5,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}
                onPress={onClear}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>清空</Text>
            </TouchableOpacity>
        </View>
    </View>
);
