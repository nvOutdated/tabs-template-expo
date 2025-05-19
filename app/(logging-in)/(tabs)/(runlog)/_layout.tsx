import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlarmScreen from "./alarm";
import LogScreen from './lampLog';
const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

export default function TabRunLogLayout() {
  const currentTheme = useCurrentTheme()
  const insets = useSafeAreaInsets();

  const renderLabel = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => (
    <Text
      style={{
        color,
        fontSize: focused ? 20 : 16,
        fontWeight: focused ? '800' : '400',
        textTransform: 'none',
        lineHeight: 20,
      }}
    >
      {children}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.headerBg }}>
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
            borderColor: currentTheme.textColor,
            display:"none"
          },
          tabBarStyle: {
            backgroundColor: 'transparent',
            height: 45,
            padding: 0,
            marginTop: insets.top - 5,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarItemStyle: {
            width: width * 0.3,
            height: 40,
            padding: 0,
            margin: 0,
          },
          tabBarLabel: renderLabel,
        }}
      >
        <Tab.Screen
          name="alarm"
          options={{
            title: "实时报警",
          }}
          component={AlarmScreen}
        />
        <Tab.Screen
          name="lampLog"
          options={{
            title: "路灯日志",
          }}
          component={LogScreen} // 暂时使用 AlarmList 作为占位
        />
      </Tab.Navigator>
    </View>
  );
}