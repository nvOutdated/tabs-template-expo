import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useScannerStore } from '@/store/scannerStore';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// 电箱表单组件
function EboxForm() {
  const { scanResult, setScanResult } = useScannerStore();
  useEffect(() => {
    if(scanResult){
      console.log('scanResult', scanResult);
    }
    // return () => {
    //   setScanResult('');
    // };
  }, [scanResult]);
  return (
    <ScrollView className="flex-1 px-4 py-2 bg-background-50">
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base text-tertiary-900 w-20">设备名称</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入设备名称"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base text-tertiary-900 w-20">设备编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入设备编号"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base text-tertiary-900 w-20">安装位置</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900"
            placeholder="请输入安装位置"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base text-tertiary-900 w-20">所属区域</Text>
          <Pressable className="flex-1 h-11 bg-white border border-tertiary-200 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择所属区域</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base text-tertiary-900 w-20">扫码结果</Text>
          {
           ( scanResult&&scanResult.length>0)?
           <Text className="text-base text-tertiary-400">{scanResult}</Text>:
           <Text className="text-base text-tertiary-400">暂无扫码结果</Text>
          }
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
  const { showWarning } = useCustomToast();
  const handleScanPress = () => {
    // router.push('/(logging-in)/(modal)/scan');
    router.push('/(logging-in)/(modal)/scannerModal');
  };
  const handleScanResult = (result: { data: string; type: string }) => {
    console.log('扫码结果:', result);
  };
  return (
    <View className="flex-1 bg-primary-100" style={{ paddingTop: insets.top }}>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center justify-between px-3 py-1 border-b border-tertiary-200" style={{backgroundColor:currentTheme.headerBg}}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>Add Device</Text>
        <TouchableOpacity
          onPress={handleScanPress}
          className="p-2"
        >
          <Ionicons name="scan-outline" size={24} color={currentTheme.textColor} />
          {/* <ScannerComponent onScanResult={handleScanResult} /> */}
        </TouchableOpacity>
      </View>

      {/* 设备类型选择 */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: currentTheme.activeTint,
          tabBarInactiveTintColor: currentTheme.inactiveTint,
          tabBarIndicatorStyle: {
            backgroundColor: currentTheme.activeTint,
            // height: 3,
            // borderRadius: 1.5,
          },
          tabBarStyle: {
            backgroundColor: currentTheme.drawerBg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            padding:0,
            height:40,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '500',
            textTransform: 'none',
            padding:0,
            margin:0,
          },
          tabBarItemStyle:{
            width: width * 0.3, // 两个标签各占40%总宽度
            height: 40,
            padding: 0,
            margin: 0,
           
          }
        }}
      >
        <Tab.Screen
          name="ebox"
          options={{ title: 'EBOX' }}
          component={EboxForm}
        />
        <Tab.Screen
          name="smartLamp"
          options={{ title: 'SmartLight' }}
          component={SmartLampForm}
        />
      </Tab.Navigator>

      {/* 底部提交按钮 */}
      <View className="p-4 bg-secondary-200 border-t text-center border-outline-100">
        <TouchableOpacity 
          className="h-11  rounded-lg items-center justify-center bg-primary-100"
          // style={{ backgroundColor: currentTheme.activeTint }}
          onPress={()=>{
            showWarning({
              message:"提交失败",
              
            })
          }}
        >
          <Text className="text-base font-semibold text-tertiary-100">提交</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
