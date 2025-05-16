import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// 示例设备数据
const devices = [
  {
    id: '1',
    name: '集中器',
    type: 'ebox',
    status: '正常',
    lastUpdate: '2024-03-20 10:30',
  },
  {
    id: '2',
    name: '灯杆',
    type: 'smartLamp',
    status: '正常',
    lastUpdate: '2024-03-20 10:30',
  },
];

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
      <View className="flex-1 p-4">
        <View className="flex-row">
          <View className="w-1/2">
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">设备总数</Text>
              <Text className="text-sm font-semibold text-blue-500">{deviceQuantity.total}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">集中器总数</Text>
              <Text className="text-sm font-semibold text-blue-500">{totalContainers}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">配电箱</Text>
              <Text className="text-sm font-semibold text-blue-500">{containerStats.cabinetNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">箱变</Text>
              <Text className="text-sm font-semibold text-blue-500">{containerStats.transformerNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">其他</Text>
              <Text className="text-sm font-semibold text-blue-500">{containerStats.otherNum}</Text>
            </View>
          </View>
          <View className="w-1/2 pl-5">
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">单挑臂</Text>
              <Text className="text-sm font-semibold text-amber-500">{deviceQuantity.singleArmLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">双挑臂</Text>
              <Text className="text-sm font-semibold text-amber-500">{deviceQuantity.doubleArmLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">玉兰灯</Text>
              <Text className="text-sm font-semibold text-amber-500">{deviceQuantity.yulanLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">庭院灯</Text>
              <Text className="text-sm font-semibold text-amber-500">{deviceQuantity.gardenLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">其他</Text>
              <Text className="text-sm font-semibold text-amber-500">{deviceQuantity.otherLampNum}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs font-semibold text-black">灯头数量</Text>
              <Text className="text-sm font-semibold text-blue-500">{deviceQuantity.lampHolderNum}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    return (
      <View className="flex-1 p-4">
        <Text className="text-center text-gray-500">图表内容将在这里显示</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white rounded-t-3xl shadow-lg">
      {/* Tabs */}
      <View className="flex-row border-b border-tertiary-200">
        <Pressable
          className={`flex-1 py-3 ${activeTab === 'basic' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('basic')}
        >
          <Text className={`text-center font-medium ${activeTab === 'basic' ? 'text-blue-500' : 'text-gray-500'}`}>
            基本信息
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 ${activeTab === 'chart' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('chart')}
        >
          <Text className={`text-center font-medium ${activeTab === 'chart' ? 'text-blue-500' : 'text-gray-500'}`}>
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