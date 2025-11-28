import { Stack } from "expo-router";
import React from "react";

export default function CollectionModalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
            }}
        >
            <Stack.Screen name="addDevice" options={{ headerShown: false }} />
        </Stack>
    );
}
