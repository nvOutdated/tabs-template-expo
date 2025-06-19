import { AlarmBadge } from '@/components/runlog/AlarmBadge';
import { useCurrentTheme, useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useSegments } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

export default function TabLoggingLayout() {
  const currentTheme = useCurrentTheme();
  const {theme} = useTheme()
  const segments = useSegments();
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
 
  // 检查当前是否在首页 - 使用 useMemo 缓存结果
  const isHomePage = useMemo(() => 
    segments.includes('(firstPage)' as never), 
    [segments]
  );
  
  useEffect(() => {
    const newIsLandscape = width > height;
    if (newIsLandscape !== isLandscape) {
      setIsLandscape(newIsLandscape);
    }
  }, [width, height, isLandscape]);

  // 使用 useMemo 缓存 tabBarStyle
  const tabBarStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    height: isLandscape ? 40 : 50,
    paddingBottom: isLandscape ? 5 : 0,
  }), [isLandscape]);

  // 使用 useMemo 缓存 screenOptions
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
    lazy:true,
    tabBarBackground: () => (
      <TabBarBackground 
        isHomePage={isHomePage} 
        isLandscape={isLandscape}
        currentTheme={currentTheme}
        theme={theme}
      />
    ),
  }), [currentTheme, tabBarStyle, isHomePage, isLandscape, theme]);

  // 使用 useCallback 缓存图标渲染函数
  const renderHomeIcon = useCallback(({ color, focused }: any) => (
    <Ionicons
      name={focused ? "home" : "home-outline"}
      color={color}
      size={isLandscape ? 30 : 20}
    />
  ), [isLandscape]);

  const renderDevicesIcon = useCallback(({ color, focused }: any) => (
    <MaterialIcons
      name="devices"
      color={color}
      size={focused ? 25 : 18}
    />
  ), []);

  const renderGisIcon = useCallback(({ color, focused }: any) => (
    <Feather
      name="map-pin"
      color={color}
      size={focused ? 25 : 18}
    />
  ), []);

  const renderRunlogIcon = useCallback(({ color, focused }: any) => (
    <View>
      <Ionicons
        name={focused ? "list" : "list-outline"}
        color={color}
        size={focused ? 25 : 18}
      />
      <AlarmBadge />
    </View>
  ), []);

  const renderPersonIcon = useCallback(({ color, focused }: any) => (
    <Ionicons
      name={focused ? "person" : "person-outline"}
      color={color}
      size={focused ? 25 : 18}
    />
  ), []);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="(firstPage)"
        options={{
          title: "Home",
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="(devices)"
        options={{
          title: "devices",
          tabBarIcon: renderDevicesIcon,
        }}
      />
      <Tabs.Screen
        name="(gis)"
        options={{
          title: "GIS",
          tabBarIcon: renderGisIcon,
        }}
      />
      <Tabs.Screen
        name="(runlog)"
        options={{
          title: 'runLog',
          tabBarIcon: renderRunlogIcon,
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          title: "person",
          tabBarIcon: renderPersonIcon,
        }}
      />
    </Tabs>
  );
}// 提取 TabBarBackground 组件避免重复渲染
const TabBarBackground = ({ 
  isHomePage, 
  isLandscape, 
  currentTheme, 
  theme 
}: {
  isHomePage: boolean;
  isLandscape: boolean;
  currentTheme: any;
  theme: string;
}) => (
  <View style={{ 
    flex: 1, 
    backgroundColor: currentTheme.drawerBg,
    height: isLandscape ? 50 : 60,
  }}>
    {isHomePage ? (
      <LinearGradient
        colors={
          theme === 'dark'
            ? ['#232526', '#414345'] // 深色模式下的渐变色
            : ['#fffbe6', '#e0c3fc'] // 浅色模式下的渐变色
        }
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.8,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    ) : null}
  </View>
);

