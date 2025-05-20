import { useCustomToast } from '@/components/public/UIComponents/ToastComponent';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketStore } from '@/store/websocketStore';
import { getToken } from '@/utils/useStorageState';
import { Redirect, Stack } from 'expo-router';
import React, { JSX, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
export default function AuthLayout(): JSX.Element {
  const { init,disconnect,isConnected } = useWebSocketStore();
  const {showError}  = useCustomToast() 
  // console.log(useTheme(),"主题");
  useEffect(() => {
    getToken().then(token => {
      console.log("加载ws",isConnected);
      
      if(token&&!isConnected) {
        init()
      }
    })
    return ()=>{
      disconnect()
    }
   },[])
  const { isLoggedIn, isLoading, error } = useAuth();
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
      title:"错误信息",
      message:"认证错误,退出登录"
    })
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modal)" options={{ headerShown: false }} />
    </Stack>
  );
}
