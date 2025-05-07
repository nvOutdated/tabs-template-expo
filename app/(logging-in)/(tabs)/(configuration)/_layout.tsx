import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EleBoxScreen from "./ebox";
import SmartLampScreen from "./smartLamp";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');
const seaImage = require('@/assets/images/background/birdBgc.png');

export default function TabMusicLayout() {
  // const { theme } = useTheme();
  // const currentTheme = themeColors[theme as keyof typeof themeColors];
  const currentTheme = useCurrentTheme()
  const insets = useSafeAreaInsets();

  const renderLabel = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => (
    <Text
      style={{
        color,
        fontSize: focused ? 20 : 16,
        fontWeight: focused ? '800' : '400',
        textTransform: 'none',
        lineHeight:20,
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
            display: "none"
          },
          tabBarStyle: {
            backgroundColor: 'transparent',
            height: 40,
            padding: 0,
            marginTop: insets.top-5,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarItemStyle: {
            width: width*0.2,
            height: 40,
            padding: 0,
            margin:0,
          },
          tabBarLabel: renderLabel,
        }}
      >
        <Tab.Screen
          name="index"
          options={{
            title: "ebox",
          }}
          component={EleBoxScreen}
        />
        <Tab.Screen
          name="smartLamp"
          options={{
            title: "smart",
          }}
          component={SmartLampScreen}
        />
      </Tab.Navigator>
    </View>
  );
}
