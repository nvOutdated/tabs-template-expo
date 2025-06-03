import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { router } from "expo-router";
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

// 定义tab标题和对应的宽度
const TAB_CONFIG = [
  { name: "index", title: "集中器", width: 70 },
  { name: "smartLamp", title: "智慧网关", width: 80 },
  { name: "singleLamp", title: "单灯", width: 90 },
  { name: "camera", title: "摄像头", width: 70 },
];

// 计算总宽度和间距
const TOTAL_TABS = TAB_CONFIG.length;
const TOTAL_CONTENT_WIDTH = TAB_CONFIG.reduce((sum, tab) => sum + tab.width, 0);
const AVAILABLE_WIDTH = width * 0.9; // 90% of screen width
const TOTAL_GAP = AVAILABLE_WIDTH - TOTAL_CONTENT_WIDTH;
const GAP_BETWEEN_TABS = TOTAL_GAP / (TOTAL_TABS - 1);

export default function TabConfigurationLayout() {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();

  const renderLabel = ({
    focused,
    color,
    children,
  }: {
    focused: boolean;
    color: string;
    children: string;
  }) => {
    const tabConfig = TAB_CONFIG.find(tab => tab.title === children);
    const tabWidth = tabConfig?.width || 70; // 默认宽度

    return (
      <Text
        style={{
          color,
          fontSize: focused ? 16 : 14,
          fontWeight: focused ? "700" : "400",
          textTransform: "none",
          lineHeight: 36,
          height: 36,
          textAlignVertical: "center",
          textAlign: "center",
          width: tabWidth,
        }}
      >
        {children}
      </Text>
    );
  };

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
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            borderColor: currentTheme.textColor,
          },
          tabBarStyle: {
            backgroundColor: "transparent",
            height: 40,
            padding: 0,
            width: AVAILABLE_WIDTH,
            marginTop: insets.top - 10,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            borderRadius: 1,
          },
          tabBarItemStyle: {
            height: 40,
            padding: 0,
            margin: 0,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarLabel: renderLabel,
          tabBarGap: GAP_BETWEEN_TABS,
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
          right: 0,
          top: insets.top - 5,
          width: width * 0.1,
          height: 36,
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
        >
          <Ionicons name="add" size={22} color={currentTheme.activeTint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
