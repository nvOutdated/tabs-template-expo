import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { getAllEboxes, getAllLines, getAllSingleLamps, getAreaList } from '@/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
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

            // Cast FileSystem to any to avoid type errors with cacheDirectory/documentDirectory
            const fs = FileSystem as any;
            const directory = fs.cacheDirectory || fs.documentDirectory;

            if (!directory) {
                throw new Error('No valid file directory found');
            }
            const uri = directory + fileName;

            await fs.writeAsStringAsync(uri, wbout, {
                encoding: 'base64'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
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

    const handleExportConcentrators = () => {
        const data = getAllEboxes();
        // Flatten or clean data if necessary
        const cleanData = data.map(item => ({
            ...item,
            device_info: JSON.stringify(item.device_info) // Convert object to string for Excel
        }));
        generateExcel(cleanData, 'concentrators_export.xlsx');
    };

    const handleExportLines = () => {
        const data = getAllLines();
        generateExcel(data, 'lines_export.xlsx');
    };

    const handleExportSingleLamps = () => {
        const data = getAllSingleLamps();
        // Flatten complex objects
        const cleanData = data.map(item => ({
            ...item,
            controllers: JSON.stringify(item.controllers),
            lamp_attachments: JSON.stringify(item.lamp_attachments)
        }));
        generateExcel(cleanData, 'single_lamps_export.xlsx');
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: currentTheme.drawerBg, paddingTop: insets.top,paddingBottom: insets.bottom }}>
            <View style={{ padding: 20 }}>
                {/* Server Configuration */}
                <View style={{ marginBottom: 30 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: currentTheme.textColor }}>
                        服务器配置
                    </Text>
                    <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10 }}>
                        <Text style={{ marginBottom: 5, color: '#666' }}>远程服务器地址</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#ddd',
                                padding: 10,
                                borderRadius: 5,
                                marginBottom: 10,
                                fontSize: 16
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
                <View style={{ marginBottom: 30 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: currentTheme.textColor }}>
                        数据导出
                    </Text>
                    <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, gap: 10 }}>
                        <ExportButton title="导出区域数据 (Areas)" onPress={handleExportAreas} color="#52c41a" />
                        <ExportButton title="导出集中器数据 (Concentrators)" onPress={handleExportConcentrators} color="#13c2c2" />
                        <ExportButton title="导出线路数据 (Lines)" onPress={handleExportLines} color="#722ed1" />
                        <ExportButton title="导出单灯数据 (Single Lamps)" onPress={handleExportSingleLamps} color="#fa8c16" />
                    </View>
                </View>

                {/* Logout */}
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#ff4d4f',
                            padding: 15,
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

const ExportButton = ({ title, onPress, color }: { title: string, onPress: () => void, color: string }) => (
    <TouchableOpacity
        style={{
            backgroundColor: color,
            padding: 12,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 5
        }}
        onPress={onPress}
    >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
    </TouchableOpacity>
);
