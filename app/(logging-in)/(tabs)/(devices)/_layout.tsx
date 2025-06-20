import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScreen from "./camera";
import EleBoxScreen from "./ebox";
import SingleLampScreen from "./singleLamp";
import SmartLampScreen from "./smartLamp";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

// 定义tab标题
const TAB_CONFIG = [
  { name: "index", title: "集中器" },
  { name: "smartLamp", title: "智慧网关" },
  { name: "singleLamp", title: "单灯" },
  { name: "camera", title: "摄像头" },
] as const;

// 自定义TabBar组件 - 优化版本
function CustomTabBar({ state, descriptors, navigation, position }: MaterialTopTabBarProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  
  const tabWidth = useMemo(() => {
    const availableWidth = width * 0.8;
    return availableWidth / TAB_CONFIG.length;
  }, []);

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
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // 从配置中获取标题
        const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
        const displayLabel = typeof label === 'string' ? label : (tabConfig?.title || route.name);

        return (
          <View
            key={route.key}
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
                paddingHorizontal: 4, // 添加内边距防止文字被截断
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
                  fontSize: isFocused ? 16 : 14,
                  fontWeight: isFocused ? "700" : "400",
                  textAlign: 'center',
                  // 添加过渡效果，让文字变化更平滑
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
      })}
    </View>
  );
}

export default function TabConfigurationLayout() {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.headerBg }}>
      <StatusBar
        translucent
        backgroundColor={currentTheme.headerBg}
        barStyle={
          currentTheme.headerBg === "#fff" ? "dark-content" : "light-content"
        }
      />
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          lazy: true,
          swipeEnabled: true,
          animationEnabled: true,
        }}
        initialLayout={{ width }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              lazy: true,
            }}
            component={
              tab.name === "index"
                ? EleBoxScreen
                : tab.name === "smartLamp"
                ? SmartLampScreen
                : tab.name === "singleLamp"
                ? SingleLampScreen
                : CameraScreen
            }
          />
        ))}
      </Tab.Navigator>
      <View
        style={{
          position: "absolute",
          right: 10,
          top: insets.top - 5,
          width: width * 0.1,
          height: 34,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentTheme.headerBg,
          zIndex: 1,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center w-full h-full justify-center pt-1"
          onPress={() => {
            router.push("/(logging-in)/(modal)/addDeviceModal");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color={currentTheme.activeTint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}