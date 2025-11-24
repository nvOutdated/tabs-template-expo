import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

// Simplified TabBarBackground
const TabBarBackground = memo(({
    isLandscape,
    currentTheme,
}: {
    isLandscape: boolean;
    currentTheme: any;
}) => {
    const containerStyle = useMemo(() => ({
        flex: 1,
        backgroundColor: currentTheme.drawerBg,
        height: isLandscape ? 50 : 60,
    }), [currentTheme.drawerBg, isLandscape]);

    return <View style={containerStyle} />;
});

TabBarBackground.displayName = 'TabBarBackground';

export default function CollectionTabsLayout() {
    const currentTheme = useCurrentTheme();
    const { width, height } = useWindowDimensions();
    const [isLandscape, setIsLandscape] = useState(width > height);

    useEffect(() => {
        const newIsLandscape = width > height;
        if (newIsLandscape !== isLandscape) {
            setIsLandscape(newIsLandscape);
        }
    }, [width, height, isLandscape]);

    const tabBarStyle = useMemo(() => ({
        backgroundColor: 'transparent',
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
        height: isLandscape ? 40 : 50,
        paddingBottom: isLandscape ? 5 : 0,
        borderTopWidth: 0,
        shadowOpacity: 0,
    }), [isLandscape]);

    const TabBarBackgroundComponent = useCallback(() => (
        <TabBarBackground
            isLandscape={isLandscape}
            currentTheme={currentTheme}
        />
    ), [isLandscape, currentTheme]);

    const screenOptions = useMemo(() => ({
        tabBarActiveTintColor: currentTheme.activeTint,
        tabBarInactiveTintColor: currentTheme.inactiveTint,
        headerStyle: {
            backgroundColor: currentTheme.headerBg,
        },
        headerShadowVisible: false,
        headerTintColor: currentTheme.textColor,
        headerShown: false,
        tabBarStyle,
        tabBarBackground: TabBarBackgroundComponent,
        tabBarHideOnKeyboard: true,
        animationEnabled: false,
    }), [currentTheme, tabBarStyle, TabBarBackgroundComponent]);

    const iconSizes = useMemo(() => ({
        home: isLandscape ? 30 : 20,
        default: 20,
        focused: 25,
        unfocused: 18,
    }), [isLandscape]);

    const renderDevicesIcon = useCallback(({ color, focused }: any) => (
        <MaterialIcons
            name="devices"
            color={color}
            size={focused ? iconSizes.focused : iconSizes.unfocused}
        />
    ), [iconSizes.focused, iconSizes.unfocused]);

    const renderAreaIcon = useCallback(({ color, focused }: any) => (
        <Ionicons
            name={focused ? "map" : "map-outline"}
            color={color}
            size={focused ? iconSizes.focused : iconSizes.unfocused}
        />
    ), [iconSizes.focused, iconSizes.unfocused]);

    const renderSettingsIcon = useCallback(({ color, focused }: any) => (
        <Ionicons
            name={focused ? "settings" : "settings-outline"}
            color={color}
            size={focused ? iconSizes.focused : iconSizes.unfocused}
        />
    ), [iconSizes.focused, iconSizes.unfocused]);

    return (
        <Tabs screenOptions={screenOptions}>
            <Tabs.Screen
                name="devices"
                options={{
                    title: "设备",
                    tabBarIcon: renderDevicesIcon,
                }}
            />
            <Tabs.Screen
                name="area"
                options={{
                    title: '区域',
                    tabBarIcon: renderAreaIcon,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "设置",
                    tabBarIcon: renderSettingsIcon,
                }}
            />
        </Tabs>
    );
}
