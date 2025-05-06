import { useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { themeColors } from "@/constants/themeColors";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, ImageBackground, StatusBar, StyleProp, TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EleBoxScreen from "./ebox";
import SmartLampScreen from "./smartLamp";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');
const seaImage = require('@/assets/images/background/birdBgc.png');

export default function TabMusicLayout() {
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const insets = useSafeAreaInsets();

  const labelStyle: StyleProp<TextStyle> = {
    textTransform: 'none',
    fontWeight: '600',
    fontSize: 14,
  };

  const activeLabelStyle: StyleProp<TextStyle> = {
    ...labelStyle,
    fontSize: 18,
    fontWeight: 'bold',
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground 
        source={seaImage}
        resizeMode="cover"
        style={{ 
          flex: 1,
          paddingTop: insets.top 
        }}
      >
        <StatusBar 
          translucent 
          backgroundColor="transparent"
        />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: currentTheme.activeTint,
            tabBarInactiveTintColor: currentTheme.inactiveTint,
            tabBarIndicatorStyle: {
              display: 'none',
            },
            tabBarStyle: {
              backgroundColor: 'transparent',
              height: 44,
              paddingTop: 0,
              margin: 0,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            tabBarItemStyle: {
              width: width / 2,
            },
            tabBarLabelStyle: labelStyle,
          }}
        >
          <Tab.Screen
            name="index"
            options={{
              title: "ebox",
              tabBarLabelStyle: activeLabelStyle,
            }}
            component={EleBoxScreen}
          />
          <Tab.Screen
            name="smartLamp"
            options={{
              title: "smartLamp",
              tabBarLabelStyle: activeLabelStyle,
            }}
            component={SmartLampScreen}
          />
        </Tab.Navigator>
      </ImageBackground>
    </View>
  );
}
