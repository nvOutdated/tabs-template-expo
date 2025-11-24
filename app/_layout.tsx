import LoadingModal from '@/components/LoadingModal';
import { ThemeProvider } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import MessageGlobalModal from '@/components/ui/MessageGlobalModal';
import "@/global.css";
import { useAuthStore } from "@/store/autherStore";
import { useGlobalStore } from "@/store/globalStateStore";
import useLoadingStore from '@/store/loadingStore';
import useMessageModalStore from '@/store/messageModalStore';
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Suppress the layout animation warning
// LogBox.ignoreLogs(['setLayoutAnimationEnabledExperimental']);

export default function RootLayout() {
  const { visible, modalOptions, hideMessage } = useMessageModalStore();
  const { isLoading } = useLoadingStore();

  useEffect(() => {
    // 初始化全局状态
    useGlobalStore.getState().initializeServer();
    // 初始化认证状态
    useAuthStore.getState().initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="is-login" options={{ headerShown: false }} />
            <Stack.Screen name="(logging-in)" options={{ headerShown: false }} />
            <Stack.Screen name='change-ip' options={{ headerShown: true, title: '切换访问地址' }} />
            <Stack.Screen name='collection' options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
      <LoadingModal visible={isLoading} />
      <MessageGlobalModal
        visible={visible}
        {...modalOptions}
        onClose={hideMessage}
      />
    </GestureHandlerRootView>
  );
}
