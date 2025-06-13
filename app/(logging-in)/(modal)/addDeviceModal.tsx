import { get_version_list } from '@/api/street/streetCommon';
import EboxForm from '@/components/addDevice/EboxForm';
import SingleLampForm from '@/components/addDevice/SingleLampForm';
import SmartLampForm from '@/components/addDevice/SmartLampForm';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// 自定义Tab组件
const CustomTab = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: focused ? color + '10' : 'transparent',
      transform: [{ scale: withSpring(focused ? 1.02 : 1) }],
    };
  });

  return (
    <Animated.View style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }, animatedStyle]}>
      <Text
        style={{
          color,
          fontSize: 15,
          fontWeight: focused ? '600' : '500',
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </Animated.View>
  );
};

export default function AddDeviceModal() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const { showWarning } = useCustomToast();
  const [versionList,setVersionList] = useState<any>([])
  useEffect(()=>{
    get_version_list({}).then(res=>{
      if(res.code==200){
        console.log(333);
        
        setVersionList(res.data)
      }
    })
  },[])
  return (
    <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center justify-between px-3 py-1 border-b border-outline-100" style={{backgroundColor:currentTheme.headerBg}}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>新增设备</Text>
        <TouchableOpacity
          onPress={() => router.push('/(logging-in)/(modal)/scannerModal')}
          className="p-2"
        >
          <Ionicons name="scan-outline" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
      </View>

      {/* 设备类型选择 */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            backgroundColor: currentTheme.activeTint,
            height: 2,
            width: width / 3,
          },
          tabBarStyle: {
            backgroundColor: currentTheme.drawerBg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            padding: 0,
            height: 44,
          },
          tabBarLabel: (props) => <CustomTab {...props} />,
          tabBarItemStyle: {
            width: width / 3,
            height: 44,
            padding: 0,
            margin: 0,
          },
          tabBarIndicatorContainerStyle: {
            backgroundColor: currentTheme.drawerBg,
          },
          tabBarPressColor: 'transparent',
          tabBarPressOpacity: 0.7,
        }}
      >
        <Tab.Screen
          name="ebox"
          options={{ 
            title: '集中器',
          }}
          component={EboxForm}
        />
        <Tab.Screen
          name="smartLamp"
          options={{ 
            title: '网关',
          }}
          component={SmartLampForm}
        />
        <Tab.Screen
          name="singleLamp"
          options={{ 
            title: '单灯',
          }}
          component={SingleLampForm}
        />
      </Tab.Navigator>

      {/* 底部提交按钮 */}
      <View className="p-4 bg-secondary-200 border-t border-t-outline-100 text-center border-outline-100">
        <TouchableOpacity 
          className="h-11 rounded-lg items-center justify-center bg-blue-500"
          onPress={() => {
            showWarning({
              message: "提交失败",
            });
          }}
        >
          <Text className="text-base font-semibold text-tertiary-100">提交</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
