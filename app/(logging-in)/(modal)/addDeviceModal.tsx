import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

// 电箱表单组件
function EboxForm() {
  return (
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">设备名称</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入设备名称"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">设备编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入设备编号"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">安装位置</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入安装位置"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">所属区域</Text>
          <Pressable className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择所属区域</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

// 智能灯表单组件
function SmartLampForm() {
  return (
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">灯杆编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入灯杆编号"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">灯杆类型</Text>
          <Pressable className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择灯杆类型</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">安装位置</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入安装位置"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-tertiary-900 w-20">所属区域</Text>
          <Pressable className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择所属区域</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

export default function AddDeviceModal() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();

  const handleScanPress = () => {
    router.push('/(logging-in)/(modal)/scan');
  };

  return (
    <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center justify-between p-3 border-b border-tertiary-200" style={{backgroundColor:currentTheme.headerBg}}>
        <Pressable
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
        </Pressable>
        <Text className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>新增设备</Text>
        <Pressable
          onPress={handleScanPress}
          className="p-2"
        >
          <Ionicons name="scan-outline" size={24} color={currentTheme.textColor} />
        </Pressable>
      </View>

      {/* 设备类型选择 */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            backgroundColor: currentTheme.activeTint,
            height: 3,
            borderRadius: 1.5,
          },
          tabBarStyle: {
            backgroundColor: currentTheme.drawerBg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '500',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen
          name="ebox"
          options={{ title: '电箱' }}
          component={EboxForm}
        />
        <Tab.Screen
          name="smartLamp"
          options={{ title: '智能灯' }}
          component={SmartLampForm}
        />
      </Tab.Navigator>

      {/* 底部提交按钮 */}
      <View className="p-4 bg-white border-t border-tertiary-200">
        <Pressable 
          className="h-11 rounded-lg items-center justify-center "
          style={{ backgroundColor: currentTheme.activeTint }}
        >
          <Text className="text-base font-semibold text-white">提交</Text>
        </Pressable>
      </View>
    </View>
  );
}
