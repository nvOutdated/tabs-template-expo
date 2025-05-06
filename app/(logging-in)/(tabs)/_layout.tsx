import { useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { themeColors } from "@/constants/themeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, View, useWindowDimensions } from "react-native";

export default function TabCameraLayout() {
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    setIsLandscape(width > height);
  }, [width, height]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentTheme.activeTint,
        tabBarInactiveTintColor: currentTheme.inactiveTint,
        headerStyle: {
          backgroundColor: currentTheme.headerBg,
        },
        headerShadowVisible: false,
        headerTintColor: currentTheme.textColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: isLandscape ? 40 : 50,
          paddingBottom: isLandscape ? 5 : 0,
        },
        tabBarBackground: () => (
          <View style={{ 
            flex: 1, 
            backgroundColor: currentTheme.drawerBg,
            height: isLandscape ? 50 : 60,
          }}>
            <ImageBackground
              source={require('@/assets/images/background/birdBgc.png')}
              style={{
                width: '100%',
                height: '100%',
                opacity: theme === 'dark' ? 0.3 : 0.5,
              }}
              resizeMode="cover"
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="(camera)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }: any) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={isLandscape ? 20 : 24}
            />
          ),
        }}
      />
       <Tabs.Screen
        name="(configuration)"
        options={{
          title: "config",
          tabBarIcon: ({ color, focused }: any) => (
            <Ionicons
              name={
                focused ? "settings" : "settings-outline"
              }
              color={color}
              size={focused ? 30 : 20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          title: "personal",
          tabBarIcon: ({ color, focused }: any) => (
            <Ionicons
              name={
                focused ? "person" : "person-outline"
              }
              color={color}
              size={focused ? 30 : 20}
            />
          ),
        }}
      />
    </Tabs>
    
  );
}
