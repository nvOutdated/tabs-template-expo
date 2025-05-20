import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import React from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeIn } from 'react-native-reanimated';

interface LampBarChartProps {
  data: {
    singleArmLampNum: number;
    doubleArmLampNum: number;
    yulanLampNum: number;
    gardenLampNum: number;
    otherLampNum: number;
  };
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width * 0.9;
const CHART_HEIGHT = 250;

export default function LampBarChart({ data }: LampBarChartProps) {
  const currentTheme = useCurrentTheme();
  
  const chartData = [
    { value: data.singleArmLampNum, label: '单挑臂', frontColor: '#4CAF50' },
    { value: data.doubleArmLampNum, label: '双挑臂', frontColor: '#2196F3' },
    { value: data.yulanLampNum, label: '玉兰灯', frontColor: '#FFC107' },
    { value: data.gardenLampNum, label: '庭院灯', frontColor: '#9C27B0' },
    { value: data.otherLampNum, label: '其他', frontColor: '#FF5722' },
  ];

  return (
    <Animated.View 
      className="items-center justify-center py-2" 
      style={{ height: CHART_HEIGHT }}
      entering={FadeIn.duration(500)}
    >
      <BarChart
        data={chartData}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        barWidth={40}
        spacing={20}
        initialSpacing={20}
        noOfSections={4}
        maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
        barBorderRadius={4}
        frontColor={currentTheme.textColor}
        backgroundColor={currentTheme.drawerBg}
        yAxisThickness={1}
        xAxisThickness={1}
        yAxisTextStyle={{ color: currentTheme.textColor }}
        xAxisLabelTextStyle={{ color: currentTheme.textColor }}
        hideRules
        showGradient
        gradientColor={currentTheme.drawerBg}
      />
    </Animated.View>
  );
} 