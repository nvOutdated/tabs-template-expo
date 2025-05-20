import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ContainerPieChartProps {
  data: {
    cabinetNum: number;
    transformerNum: number;
    otherNum: number;
  };
}

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.2;

export default function ContainerPieChart({ data }: ContainerPieChartProps) {
  const currentTheme = useCurrentTheme();
  
  const chartData = [
    { value: data.cabinetNum, text: '配电箱', color: '#4CAF50' },
    { value: data.transformerNum, text: '箱变', color: '#2196F3' },
    { value: data.otherNum, text: '其他', color: '#FFC107' },
  ];

  return (
    <Animated.View 
      className="items-center justify-center py-1" 
      style={{ height: CHART_SIZE }}
      entering={FadeIn.duration(500)}
    >
      <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
        <PieChart
          data={chartData}
          donut
          showText
          textColor={currentTheme.textColor}
          textSize={10}
          fontWeight="bold"
          innerRadius={8}
          radius={CHART_SIZE / 2 - 15}
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text className="text-sm font-bold" style={{ color: currentTheme.textColor }}>
                集中器
              </Text>
              <Text className="text-xs" style={{ color: currentTheme.textColor }}>
                分布
              </Text>
            </View>
          )}
        />
      </View>
    </Animated.View>
  );
} 