import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EleBoxScreen from "./ebox";
import SingleLampScreen from "./singleLamp";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

// 简化后的tab配置
const TAB_CONFIG = [
  { name: "index", title: "集中器" },
  { name: "singleLamp", title: "单灯" },
] as const;

// 单个Tab项组件 - 使用memo优化
const TabItem = memo(({
  route,
  index,
  isFocused,
  tabWidth,
  currentTheme,
  onPress,
}: {
  route: any;
  index: number;
  isFocused: boolean;
  tabWidth: number;
  currentTheme: any;
  onPress: () => void;
}) => {
  const label = route.options?.tabBarLabel || route.options?.title || route.name;
  const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
  const displayLabel = typeof label === 'string' ? label : (tabConfig?.title || route.name);

  return (
    <View
      style={{
        width: tabWidth,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
            fontSize: isFocused ? 16 : 14,
            fontWeight: isFocused ? "700" : "400",
            textAlign: 'center',
            opacity: isFocused ? 1 : 0.7,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

TabItem.displayName = 'TabItem';

// 自定义TabBar组件 - 优化版本
const CustomTabBar = memo(({ state, descriptors, navigation, onTabChange }: MaterialTopTabBarProps & { onTabChange?: (tabName: string) => void }) => {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  
  const tabWidth = useMemo(() => {
    const availableWidth = width * 0.5;
    return availableWidth / TAB_CONFIG.length;
  }, []);

  // 当tab变化时，通知父组件
  useEffect(() => {
    if (onTabChange && state?.routes && state?.index !== undefined) {
      const route = state.routes[state.index];
      if (route?.name) {
        onTabChange(route.name);
      }
    }
  }, [state.index, state.routes, onTabChange]);

  // 下划线位置动画值
  // const indicatorPosition = useSharedValue(state.index * tabWidth);

  // // 更新下划线位置
  // useEffect(() => {
  //   indicatorPosition.value = withTiming(state.index * tabWidth, {
  //     duration: 250,
  //     easing: Easing.out(Easing.cubic),
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [state.index, tabWidth]);

  // 下划线动画样式
  // const indicatorStyle = useAnimatedStyle(() => ({
  //   transform: [{ translateX: indicatorPosition.value }],
  // }));

  // 优化onPress回调
  const handlePress = useCallback((route: any, index: number) => {
    const isFocused = state.index === index;
    if (isFocused) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [state.index, navigation]);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'transparent',
        height: 40,
        width: width * 0.8,
        marginTop: insets.top - 5,
        position: 'relative',
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const routeOptions = descriptors[route.key].options;

        return (
          <TabItem
            key={route.key}
            route={{ name: route.name, options: routeOptions }}
            index={index}
            isFocused={isFocused}
            tabWidth={tabWidth}
            currentTheme={currentTheme}
            onPress={() => handlePress(route, index)}
          />
        );
      })}
      {/* 下划线指示器 */}
    {/*   <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left:tabWidth/4,
            width: tabWidth/2,
            height: 2,
            backgroundColor: currentTheme.activeTint,
          },
          indicatorStyle,
        ]}
      /> */}
    </View>
  );
});

CustomTabBar.displayName = 'CustomTabBar';

export default function TabConfigurationLayout() {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  
  // 跟踪当前选中的tab
  const [currentTab, setCurrentTab] = useState<string>('index');

  // 优化screenOptions配置
  const screenOptions = useMemo(() => ({
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: 'transparent',
      elevation: 0,
      shadowOpacity: 0,
    },
  }), []);

  // 优化StatusBar样式
  const statusBarStyle = useMemo(() => 
    currentTheme.headerBg === "#fff" ? "dark-content" : "light-content",
    [currentTheme.headerBg]
  );

  // 优化添加按钮样式
  const addButtonStyle = useMemo(() => ({
    position: "absolute" as const,
    right: 10,
    top: insets.top - 5,
    width: width * 0.1,
    height: 34,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: currentTheme.headerBg,
    zIndex: 1,
  }), [insets.top, currentTheme.headerBg]);

  // 根据当前tab跳转到不同的新增页面
  const handleAddPress = useCallback(() => {
    if (currentTab === 'singleLamp') {
      router.push("/(logging-in)/(modal)/addSinglamp");
    } else {
      // 默认跳转到集中器新增页面
      router.push("/(logging-in)/(modal)/addDeviceModal");
    }
  }, [currentTab]);

  // 处理tab变化回调
  const handleTabChange = useCallback((tabName: string) => {
    setCurrentTab(tabName);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.headerBg }}>
      <StatusBar
        translucent
        backgroundColor={currentTheme.headerBg}
        barStyle={statusBarStyle}
      />
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} onTabChange={handleTabChange} />}
        screenOptions={screenOptions}
      >
        <Tab.Screen
          name="index"
          component={EleBoxScreen}
          options={{
            tabBarLabel: '集中器',
          }}
        />
        <Tab.Screen
          name="singleLamp"
          component={SingleLampScreen}
          options={{
            tabBarLabel: '单灯',
          }}
        />
      </Tab.Navigator>
      {currentTab === 'index' && (
        <View style={addButtonStyle}>
          <TouchableOpacity
            className="flex-row items-center w-full h-full justify-center pt-1"
            onPress={handleAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={currentTheme.activeTint} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}