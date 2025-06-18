import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { useMemo } from "react";
import { Dimensions, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlarmScreen from "./alarm";
import LogScreen from "./lampLog";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

// 定义tab标题
const TAB_CONFIG = [
  { name: "alarm", title: "实时报警" },
  { name: "lampLog", title: "路灯日志" },

] as const;

// 自定义TabBar组件
function CustomTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  
  const tabWidth = useMemo(() => {
    const availableWidth = width * 0.2;
    return availableWidth;
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'transparent',
        height: 35,
        width: width * 0.5,
        marginTop: insets.top - 5,
        justifyContent: 'center',
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
              height: 36,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 4,
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
              activeOpacity={1}
            >
              <Text
                style={{
                  color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
                  fontSize: isFocused ? 16 : 14,
                  fontWeight: isFocused ? "600" : "400",
                  textTransform: "none",
                  lineHeight: 16,
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

export default function TabRunLogLayout() {
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
            component={tab.name === "lampLog" ? LogScreen : AlarmScreen}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}
