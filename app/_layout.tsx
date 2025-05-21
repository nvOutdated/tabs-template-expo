import { ThemeProvider } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import "@/global.css";
import { useAuthStore } from "@/store/autherStore";
import { useGlobalStore } from "@/store/globalStateStore";
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Suppress the layout animation warning
// LogBox.ignoreLogs(['setLayoutAnimationEnabledExperimental']);

export default function RootLayout() {
  useEffect(() => {
    // 初始化全局状态
    useGlobalStore.getState().initializeServer();
    // 初始化认证状态
    useAuthStore.getState().initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="is-login" options={{ headerShown: false }} />
          <Stack.Screen name="(logging-in)" options={{ headerShown: false }} />
          <Stack.Screen name='change-ip' options={{ headerShown: true,title:'切换访问地址' }}/>
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
