import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import {
    clearAreas,
    clearConcentrators,
    clearLines,
    clearSingleLamps,
    getAllEboxes,
    getAllLines,
    getAllSingleLamps,
    getAreaList
} from '@/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import XLSX from 'xlsx';
const SERVER_URL_KEY = 'remote_server_url';

export default function SettingsScreen() {
    const currentTheme = useCurrentTheme();
    const [serverUrl, setServerUrl] = useState('');
    const [loading, setLoading] = useState(false);
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
        generateExcel(data, 'areas_export.xlsx');
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
        generateExcel(cleanData, 'concentrators_export.xlsx');
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

    const handleExportSingleLamps = () => {
        const data = getAllSingleLamps();
        const cleanData = data.map(item => ({
            ...item,
            controllers: JSON.stringify(item.controllers),
            lamp_attachments: JSON.stringify(item.lamp_attachments)
        }));
        generateExcel(cleanData, 'single_lamps_export.xlsx');
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
                        <DataManagementRow
                            title="线路数据 (Lines)"
                            onExport={handleExportLines}
                            onClear={handleClearLines}
                            exportColor="#722ed1"
                        />
                        <DataManagementRow
                            title="单灯数据 (Single Lamps)"
                            onExport={handleExportSingleLamps}
                            onClear={handleClearSingleLamps}
                            exportColor="#fa8c16"
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
                            backgroundColor: '#ff4d4f',
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
