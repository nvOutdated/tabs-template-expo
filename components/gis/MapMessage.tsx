import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LampBarChart from '../charts/LampBarChart';

interface DeviceQuantity {
  total: number;
  singleArmLampNum: number;
  doubleArmLampNum: number;
  yulanLampNum: number;
  gardenLampNum: number;
  otherLampNum: number;
  lampHolderNum: number;
}

interface MapMessageProps {
  deviceQuantity?: DeviceQuantity;
  containerList?: any[];
}

export default function MapMessage({ deviceQuantity, containerList }: MapMessageProps) {
  const currentTheme = useCurrentTheme();
  const [activeTab, setActiveTab] = useState<'basic' | 'chart'>('basic');

  const calculateContainerStats = () => {
    if (!containerList) return { cabinetNum: 0, transformerNum: 0, otherNum: 0 };
    
    return containerList.reduce((acc, item) => {
      if (item.container_type === "CABINET") {
        acc.cabinetNum += 1;
      } else if (item.container_type === "TRANSFORMER") {
        acc.transformerNum += 1;
      } else {
        acc.otherNum += 1;
      }
      return acc;
    }, { cabinetNum: 0, transformerNum: 0, otherNum: 0 });
  };

  const renderBasicInfo = () => {
    if (!deviceQuantity) return null;

    const containerStats = calculateContainerStats();
    const totalContainers = containerStats.cabinetNum + containerStats.transformerNum + containerStats.otherNum;

    return (
      <BottomSheetScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, minHeight: 300 }}
      >
        <View className="flex-row">
          <View className="w-1/2">
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">设备总数</Text>
              <Text className="text-sm font-semibold text-info-500">{deviceQuantity.total}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">集中器总数</Text>
              <Text className="text-sm font-semibold text-info-500">{totalContainers}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">配电箱</Text>
              <Text className="text-sm font-semibold text-info-500">{containerStats.cabinetNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">箱变</Text>
              <Text className="text-sm font-semibold text-info-500">{containerStats.transformerNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">其他</Text>
              <Text className="text-sm font-semibold text-info-500">{containerStats.otherNum}</Text>
            </View>
          </View>
          <View className="w-1/2 pl-5">
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">单挑臂</Text>
              <Text className="text-sm font-semibold text-warning-500">{deviceQuantity.singleArmLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">双挑臂</Text>
              <Text className="text-sm font-semibold text-warning-500">{deviceQuantity.doubleArmLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">玉兰灯</Text>
              <Text className="text-sm font-semibold text-warning-500">{deviceQuantity.yulanLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">庭院灯</Text>
              <Text className="text-sm font-semibold text-warning-500">{deviceQuantity.gardenLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">其他</Text>
              <Text className="text-sm font-semibold text-warning-500">{deviceQuantity.otherLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-typography-900">灯头数量</Text>
              <Text className="text-sm font-semibold text-info-500">{deviceQuantity.lampHolderNum}</Text>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    );
  };

  const renderChart = () => {
    if (!deviceQuantity) return null;
    const containerStats = calculateContainerStats();

    return (
      <BottomSheetScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8, paddingBottom: 20, minHeight: 300 }}
      >
        <View className="flex-row items-center">
         {/*  <View className="flex-1 pr-1">
            <Text className="text-center text-typography-900 font-semibold mb-1 text-xs">集中器分布</Text>
            <ContainerPieChart data={containerStats} />
          </View> */}
          <View className="flex-1 pl-1">
           {/*  <Text className="text-center text-typography-900 font-semibold mb-1 text-xs">单灯分布</Text> */}
            <LampBarChart data={deviceQuantity} />
          </View>
        </View>
      </BottomSheetScrollView>
    );
  };

  return (
    <View className="flex-1 bg-background-0 rounded-t-3xl shadow-lg">
      {/* Tabs */}
      <View className="flex-row border-b border-outline-200">
        <Pressable
          className={`flex-1 py-3 ${activeTab === 'basic' ? 'border-b-2 border-info-500' : ''}`}
          onPress={() => setActiveTab('basic')}
        >
          <Text className={`text-center font-medium ${activeTab === 'basic' ? 'text-info-500' : 'text-typography-500'}`}>
            基本信息
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 ${activeTab === 'chart' ? 'border-b-2 border-info-500' : ''}`}
          onPress={() => setActiveTab('chart')}
        >
          <Text className={`text-center font-medium ${activeTab === 'chart' ? 'text-info-500' : 'text-typography-500'}`}>
            图表
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <Animated.View 
        className="flex-1"
        entering={FadeIn}
        exiting={FadeOut}
      >
        {activeTab === 'basic' ? renderBasicInfo() : renderChart()}
      </Animated.View>
    </View>
  );
}