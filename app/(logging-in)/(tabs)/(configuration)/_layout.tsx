import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router } from "expo-router";
import { Dimensions, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CameraScreen from "./camera";
import EleBoxScreen from "./ebox";
import SmartLampScreen from "./smartLamp";
const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

export default function TabConfigurationLayout() {
  const currentTheme = useCurrentTheme()
  const insets = useSafeAreaInsets();

  const renderLabel = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => (
    <Text
      style={{
        color,
        fontSize: focused ? 16 : 14,
        fontWeight: focused ? '700' : '400',
        textTransform: 'none',
        lineHeight: 36,
        height: 36,
        textAlignVertical: 'center',
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.headerBg, }}>
      <StatusBar
        translucent
        backgroundColor={currentTheme.headerBg}
        barStyle={currentTheme.headerBg === '#fff' ? 'dark-content' : 'light-content'}
      />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            borderColor: currentTheme.textColor
          },
          tabBarStyle: {
            backgroundColor: 'transparent',
            height: 40,
            padding: 0,
            marginTop: insets.top - 10,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            borderRadius: 1,
          },
          tabBarItemStyle: {
            width: width * 0.25,
            height: 40,
            padding: 0,
            margin: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabel: renderLabel,
          tabBarGap: 0,
        }}
      >
        <Tab.Screen
          name="index"
          options={{
            title: "集中器",
          }}
          component={EleBoxScreen}
        />
        <Tab.Screen
          name="smartLamp"
          options={{
            title: "智慧网关",
          }}
          component={SmartLampScreen}
        />
        <Tab.Screen
          name="camera"
          options={{
            title: "摄像头",
          }}
          component={CameraScreen}
        />

      </Tab.Navigator>
      <View style={{
        position: 'absolute',
        right: 0,
        top: insets.top - 5,
        width: width * 0.1,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: currentTheme.headerBg,
        zIndex: 1,
      }}>
        <TouchableOpacity
          className="flex-row items-center w-full h-full justify-center pt-1"
          onPress={() => {router.push("/(logging-in)/(modal)/addDeviceModal") }}
        >
          <Ionicons
              name="add"
              size={22}
              color={currentTheme.activeTint}
            />
        </TouchableOpacity>
      </View>
    </View>
  );
}
