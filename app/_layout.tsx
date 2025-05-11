import { ThemeProvider } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import "@/global.css";
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AMapSdk } from 'react-native-amap3d';

export default function RootLayout() {
  useEffect(() => {
    // 初始化高德地图SDK
    AMapSdk.init(
      Platform.select({
        android: "46706639eb0fcf93547033af8ea5b079",
        ios: "您的iOS API Key",
      })
    );
  }, []);

  return (
    // <GluestackUIProvider mode="light">
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
      >
        <Stack.Screen name="is-login" options={{ headerShown: false }} />
        <Stack.Screen name="(logging-in)" options={{ headerShown: false }} />
      </Stack>
      </ThemeProvider>
    // </GluestackUIProvider>
  );
}
