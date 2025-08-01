import { AlarmBadge } from '@/components/runlog/AlarmBadge';
import { useCurrentTheme, useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useSegments } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

// 提取并优化 TabBarBackground 组件，使用 memo 避免不必要的重渲染
const TabBarBackground = memo(({ 
  isHomePage, 
  isLandscape, 
  currentTheme, 
  theme 
}: {
  isHomePage: boolean;
  isLandscape: boolean;
  currentTheme: any;
  theme: string;
}) => {
  // 预计算渐变色，避免每次渲染时重新创建数组
  const gradientColors = useMemo(() => 
    theme === 'dark'
      ? ['#232526', '#414345'] // 深色模式下的渐变色
      : ['#fffbe6', '#e0c3fc'], // 浅色模式下的渐变色
    [theme]
  );

  const containerStyle = useMemo(() => ({ 
    flex: 1, 
    backgroundColor: currentTheme.drawerBg,
    height: isLandscape ? 50 : 60,
  }), [currentTheme.drawerBg, isLandscape]);

  const gradientStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    opacity: 0.8,
  }), []);

  return (
    <View style={containerStyle}>
      {isHomePage && (
        <LinearGradient
          colors={gradientColors as any}
          style={gradientStyle as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
    </View>
  );
});

TabBarBackground.displayName = 'TabBarBackground';

export default function TabLoggingLayout() {
  const currentTheme = useCurrentTheme();
  const { theme } = useTheme();
  const segments = useSegments();
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);

  // 检查当前是否在首页 - 使用 useMemo 缓存结果
  const isHomePage = useMemo(() => 
    segments.includes('(firstPage)' as never), 
    [segments]
  );
  
  // 优化方向检测逻辑，减少不必要的状态更新
  useEffect(() => {
    const newIsLandscape = width > height;
    if (newIsLandscape !== isLandscape) {
      setIsLandscape(newIsLandscape);
    }
  }, [width, height, isLandscape]);

  // 使用 useMemo 缓存 tabBarStyle，添加更多性能优化属性
  const tabBarStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    height: isLandscape ? 40 : 50,
    paddingBottom: isLandscape ? 5 : 0,
    // 添加性能优化属性
    borderTopWidth: 0,
    shadowOpacity: 0,
  }), [isLandscape]);

  // 创建稳定的 TabBarBackground 组件引用
  const TabBarBackgroundComponent = useCallback(() => (
    <TabBarBackground 
      isHomePage={isHomePage} 
      isLandscape={isLandscape}
      currentTheme={currentTheme}
      theme={theme}
    />
  ), [isHomePage, isLandscape, currentTheme, theme]);

  // 使用 useMemo 缓存 screenOptions，优化性能配置
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
    // 性能优化配置
    lazy: false, // 改为 false，预加载所有页面避免切换时的加载延迟
    tabBarHideOnKeyboard: true,
    animationEnabled: false, // 禁用动画减少延迟
    // 移除 animationTypeForReplace，使用默认配置
    tabBarBackground: TabBarBackgroundComponent,
    // 添加性能优化选项
    unmountOnBlur: false, // 保持页面挂载状态
    freezeOnBlur: true, // 冻结非活跃页面
  }), [currentTheme, tabBarStyle, TabBarBackgroundComponent]);

  // 预计算图标尺寸，避免条件渲染
  const iconSizes = useMemo(() => ({
    home: isLandscape ? 30 : 20,
    default: 20,
    focused: 25,
    unfocused: 18,
  }), [isLandscape]);

  // 使用 useCallback 缓存图标渲染函数，优化尺寸计算
  const renderHomeIcon = useCallback(({ color, focused }: any) => (
    <Ionicons
      name={focused ? "home" : "home-outline"}
      color={color}
      size={iconSizes.home}
    />
  ), [iconSizes.home]);

  const renderDevicesIcon = useCallback(({ color, focused }: any) => (
    <MaterialIcons
      name="devices"
      color={color}
      size={focused ? iconSizes.focused : iconSizes.unfocused}
    />
  ), [iconSizes.focused, iconSizes.unfocused]);

  const renderGisIcon = useCallback(({ color, focused }: any) => (
    <Feather
      name="map-pin"
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
}