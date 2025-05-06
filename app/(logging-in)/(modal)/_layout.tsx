import { Stack } from "expo-router";
import React from "react";
export default function ModalLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom'  
        }}>
            <Stack.Screen name="videoModal" options={{ headerShown: false }} />
            <Stack.Screen name="messageModal" options={{ headerShown: true }} />
            <Stack.Screen name="configuration" options={{ headerShown: false }} />
        </Stack>
    );
}