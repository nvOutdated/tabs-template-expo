import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
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

const { width,height } = Dimensions.get('window');
const CHART_WIDTH = width * 0.7;
const CHART_HEIGHT = height * 0.25;

export default function LampBarChart({ data }: LampBarChartProps) {
  const currentTheme = useCurrentTheme();
  
  const chartData = [
    { 
      value: data.singleArmLampNum, 
      label: '单挑臂', 
      frontColor: '#4CAF50',
      sideColor: '#3B8C3D',
      topColor: '#66BB6A'
    },
    { 
      value: data.doubleArmLampNum, 
      label: '双挑臂', 
      frontColor: '#2196F3',
      sideColor: '#1976D2',
      topColor: '#42A5F5'
    },
    { 
      value: data.yulanLampNum, 
      label: '玉兰灯', 
      frontColor: '#FFC107',
      sideColor: '#FFA000',
      topColor: '#FFCA28'
    },
    { 
      value: data.gardenLampNum, 
      label: '庭院灯', 
      frontColor: '#9C27B0',
      sideColor: '#7B1FA2',
      topColor: '#AB47BC'
    },
    { 
      value: data.otherLampNum, 
      frontColor: '#FF5722',
      sideColor: '#E64A19',
      topColor: '#FF7043'
    },
  ];

  const renderTooltip = (item: any) => {
    return (
      <View className="bg-background-0 px-2 py-1 rounded-md shadow-sm">
        <Text className="text-typography-900 text-xs font-medium">
          {item.value}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View 
      className="items-center justify-center py-1 mt-4" 
      style={{ height: CHART_HEIGHT + 40 }}
      entering={FadeIn.duration(500)}
    >
      <BarChart
        data={chartData}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        barWidth={20}
        sideWidth={10}
        spacing={35}
        initialSpacing={30}
        noOfSections={3}
        maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
        frontColor={currentTheme.textColor}
        backgroundColor={currentTheme.headerBg}
        yAxisThickness={1}
        xAxisThickness={1}
        yAxisTextStyle={{ color: currentTheme.textColor, fontSize: 12 }}
        xAxisLabelTextStyle={{ 
          color: currentTheme.textColor, 
          fontSize: 12,
          marginTop: 2,
          width: 60,
          textAlign: 'center'
        }}
        hideRules
        renderTooltip={renderTooltip}
        isAnimated
        animationDuration={1000}
        isThreeD
        side="right"
        showFractionalValues
      />
    </Animated.View>
  );
} 