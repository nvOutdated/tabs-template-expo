import { AlarmBadge } from '@/components/runlog/AlarmBadge';
import { useCurrentTheme, useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, View, useWindowDimensions } from "react-native";
export default function TabLoggingLayout() {
  const currentTheme = useCurrentTheme();
  const {theme} = useTheme()
  // const currentTheme = themeColors[theme as keyof typeof themeColors];
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
        name="(devices)"
        options={{
          title: "devices",
          tabBarIcon: ({ color, focused }: any) => (
            <MaterialIcons
              name={
                'devices'
              }
              color={color}
              size={focused ? 25 : 18}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="(plan)"
        options={{
          title: "plan",
          tabBarIcon: ({ color, focused }: any) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              size={isLandscape ? 30 : 20}
            />
          ),
        }}
      />
       <Tabs.Screen
        name="(gis)"
        options={{
          title: "GIS",
          tabBarIcon: ({ color, focused }: any) => (
            <Feather
              name={
                focused ? "map-pin" : "map-pin"
              }
              color={color}
              size={focused ? 25 : 18}
            />
          ),
        }}
      />
       <Tabs.Screen
        name="(runlog)"
        options={{
          title: 'runLog',
          tabBarIcon: ({ color, focused }: any) => (
            <View>
              <Ionicons
                name={focused ? "list" : "list-outline"}
                color={color}
                size={focused ? 25 : 18}
              />
              <AlarmBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          title: "person",
          tabBarIcon: ({ color, focused }: any) => (
            <Ionicons
              name={
                focused ? "person" : "person-outline"
              }
              color={color}
              size={focused ? 25 : 18}
            />
          ),
        }}
      />
     
    </Tabs>
    
  );
}
