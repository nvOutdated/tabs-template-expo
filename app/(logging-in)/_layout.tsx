import { useAuth } from '@/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';
import React, { JSX } from 'react';
import { ActivityIndicator, View } from 'react-native';
export default function AuthLayout(): JSX.Element {
  // console.log(useTheme(),"主题");
  
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
    console.error('认证错误:', error);
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
