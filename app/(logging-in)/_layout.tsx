import { useCustomToast } from '@/components/public/UIComponents/ToastComponent';
import { useAuth } from '@/hooks/useAuth';
import { useAreaStore } from "@/store/areaStore";
import { DEVICE_STATUS, useEboxStore } from "@/store/eboxStore";
import { useRunLogStore } from '@/store/runlogStore';
import { useSmartLightStore } from "@/store/smartLightStore";
import { useWebSocketStore } from '@/store/websocketStore';
import { AlarmMessage } from '@/types/runlog';
import { getToken } from '@/utils/useStorageState';
import { Redirect, Stack } from 'expo-router';
import React, { JSX, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout(): JSX.Element {
  const { init, disconnect, isConnected, WS_SmartLight_Data } = useWebSocketStore();
  const { showError } = useCustomToast();
  const { isLoggedIn, isLoading, error } = useAuth();
  const { initializeEboxTree } = useEboxStore();
  const { initializeSmartLightTree } = useSmartLightStore();
  const { fetchAreaList } = useAreaStore();
  const { addAlarm } = useRunLogStore();
  const insets = useSafeAreaInsets();
  // 监听 WebSocket 报警数据
  useEffect(() => {
    if (WS_SmartLight_Data?.type === "warning"&& isConnected) {
      const deviceInfo = {
        online: WS_SmartLight_Data.data?.online ?? true,
        open: WS_SmartLight_Data.data?.open ?? false,
        warn: WS_SmartLight_Data.data?.warn ?? false,
        loops: WS_SmartLight_Data.data?.loops || Array(8).fill(false),
      };

      // 根据状态确定模块
      const deviceStatus = Object.values(DEVICE_STATUS).find((status) =>
        status.condition(deviceInfo)
      ) || DEVICE_STATUS.ONLINE;

      // 添加报警记录
      const newAlarm: Omit<AlarmMessage, 'id' | 'isRead' | 'timestamp'> = {
        title: `${WS_SmartLight_Data.deviceName || ""} - ${WS_SmartLight_Data.data?.eventType || "报警"}`,
        content: `设备状态: ${WS_SmartLight_Data.data?.description || "无描述"}\n操作模式: ${WS_SmartLight_Data.data?.mode || "未知"}\n操作时间: ${WS_SmartLight_Data.data?.optTime || "未知"}`,
        type: "alarm",
        module: deviceStatus.module,
        status: "pending",
        sn: WS_SmartLight_Data.sn || "",
        deviceName: WS_SmartLight_Data.deviceName || "",
        data: {
          phase3Voltage: WS_SmartLight_Data.data?.phase3Voltage || [0, 0, 0],
          phase3Electric: WS_SmartLight_Data.data?.phase3Electric || [0, 0, 0],
          power: WS_SmartLight_Data.data?.power || 0,
          dateTime: WS_SmartLight_Data.data?.dateTime || "",
          powerOff: WS_SmartLight_Data.data?.powerOff || "",
          powerOn: WS_SmartLight_Data.data?.powerOn || "",
          loops: WS_SmartLight_Data.data?.loops || Array(8).fill(false),
          ios: WS_SmartLight_Data.data?.ios || Array(8).fill(false),
          enabledWeekly: WS_SmartLight_Data.data?.enabledWeekly || false,
          enabledAlways: WS_SmartLight_Data.data?.enabledAlways || false,
          enabledLocation: WS_SmartLight_Data.data?.enabledLocation || false,
          enabledMultiple: WS_SmartLight_Data.data?.enabledMultiple || false,
          enabledLight: WS_SmartLight_Data.data?.enabledLight || false,
          enabledWater: WS_SmartLight_Data.data?.enabledWater || false,
          enabledOneByOne: WS_SmartLight_Data.data?.enabledOneByOne || false,
          mode: WS_SmartLight_Data.data?.mode || "未知",
          optTime: WS_SmartLight_Data.data?.optTime || "未知",
          eventType: WS_SmartLight_Data.data?.eventType || "报警",
          reportTime: WS_SmartLight_Data.data?.reportTime || "",
          description: WS_SmartLight_Data.data?.description || "无描述",
          warn: deviceInfo.warn,
        },
      };
      addAlarm(newAlarm);
    }
  }, [WS_SmartLight_Data, isConnected, addAlarm]);

  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const token = await getToken();
        if (token && token !== 'tokenKey' && !isConnected) {
          init();
          initializeEboxTree();
          initializeSmartLightTree();
          fetchAreaList();
        }
      } catch (err) {
        console.error('Failed to setup WebSocket:', err);
      }
    };

    if (isLoggedIn) {
      setupWebSocket();
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isLoggedIn, isConnected, init, disconnect]);

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Handle authentication errors
  if (error) {
    // console.error('认证错误:', error);
    showError({
      title: "错误信息",
      message: "认证错误,退出登录"
    });
    return <Redirect href="/is-login" />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Redirect href="/is-login" />;
  }

  // Render the main stack if authenticated
  return (
    // <Slot/>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false,contentStyle: { paddingBottom: insets.bottom } }} />
      <Stack.Screen name="(modal)" options={{ headerShown: false }} />
    </Stack>
  );
}
