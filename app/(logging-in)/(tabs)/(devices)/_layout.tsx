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
  View,
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

// 自定义TabBar组件
function CustomTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
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
        marginTop: insets.top -5,
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
              }}
              activeOpacity={1} // 完全禁用按压透明度变化
            >
              <Text
                style={{
                  color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
                  fontSize: isFocused ? 16 : 14,
                  fontWeight: isFocused ? "700" : "400",
                  textAlign: 'center',
                  borderBottomWidth:2,
                  borderBottomColor:isFocused ? currentTheme.activeTint:'transparent'
                }}
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
          lazy: false,
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
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
          activeOpacity={1}
        >
          <Ionicons name="add" size={22} color={currentTheme.activeTint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}