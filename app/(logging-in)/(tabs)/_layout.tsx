import { AlarmBadge } from '@/components/runlog/AlarmBadge';
import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

// 简化的 TabBarBackground 组件
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

export default function TabLoggingLayout() {
  const currentTheme = useCurrentTheme();
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);
  
  // 优化方向检测逻辑
  useEffect(() => {
    const newIsLandscape = width > height;
    if (newIsLandscape !== isLandscape) {
      setIsLandscape(newIsLandscape);
    }
  }, [width, height, isLandscape]);

  // 简化的 tabBarStyle
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

  // 简化的 TabBarBackground 组件引用
  const TabBarBackgroundComponent = useCallback(() => (
    <TabBarBackground 
      isLandscape={isLandscape}
      currentTheme={currentTheme}
    />
  ), [isLandscape, currentTheme]);

  // 简化的 screenOptions
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

  // 预计算图标尺寸，避免条件渲染
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


  const renderRunlogIcon = useCallback(({ color, focused }: any) => (
    <View>
      <Ionicons
        name={focused ? "list" : "list-outline"}
        color={color}
        size={focused ? iconSizes.focused : iconSizes.unfocused}
      />
      <AlarmBadge />
    </View>
  ), [iconSizes.focused, iconSizes.unfocused]);

  const renderPersonIcon = useCallback(({ color, focused }: any) => (
    <Ionicons
      name={focused ? "person" : "person-outline"}
      color={color}
      size={focused ? iconSizes.focused : iconSizes.unfocused}
    />
  ), [iconSizes.focused, iconSizes.unfocused]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="(devices)"
        options={{
          title: "设备",
          tabBarIcon: renderDevicesIcon,
        }}
      />
      <Tabs.Screen
        name="(runlog)"
        options={{
          title: '报警/运行日志',
          tabBarIcon: renderRunlogIcon,
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          title: "个人中心",
          tabBarIcon: renderPersonIcon,
        }}
      />
    </Tabs>
  );
}