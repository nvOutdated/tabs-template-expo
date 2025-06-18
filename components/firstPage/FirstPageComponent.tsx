import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// 模拟数据
const mockDeviceData = {
  total: 1247,
  singleArmLampNum: 456,
  doubleArmLampNum: 234,
  yulanLampNum: 189,
  gardenLampNum: 245,
  otherLampNum: 123,
  lampHolderNum: 1247,
};

const mockLightingHours = {
  daily: [
    { value: 8.5, label: '00:00' },
    { value: 9.2, label: '04:00' },
    { value: 10.8, label: '08:00' },
    { value: 12.3, label: '12:00' },
    { value: 11.7, label: '16:00' },
    { value: 9.8, label: '20:00' },
  ],
  monthly: Array.from({ length: 30 }, (_, i) => ({
    value: Math.floor(Math.random() * 8) + 8,
    label: `${i + 1}`,
  })),
  yearly: Array.from({ length: 12 }, (_, i) => ({
    value: Math.floor(Math.random() * 15) + 10,
    label: `${i + 1}月`,
  })),
};

const mockPowerConsumption = {
  daily: [
    { value: 125, label: '00:00' },
    { value: 189, label: '04:00' },
    { value: 234, label: '08:00' },
    { value: 298, label: '12:00' },
    { value: 267, label: '16:00' },
    { value: 198, label: '20:00' },
  ],
  monthly: Array.from({ length: 30 }, (_, i) => ({
    value: Math.floor(Math.random() * 300) + 150,
    label: `${i + 1}`,
  })),
  yearly: Array.from({ length: 12 }, (_, i) => ({
    value: Math.floor(Math.random() * 800) + 400,
    label: `${i + 1}月`,
  })),
};

export default function FirstPageComponent() {
  const currentTheme = useCurrentTheme();
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const getDateDisplay = () => {
    switch (timeRange) {
      case 'daily':
        return selectedDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'monthly':
        return selectedDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit'
        });
      case 'yearly':
        return selectedDate.toLocaleDateString('zh-CN', {
          year: 'numeric'
        });
      default:
        return selectedDate.toLocaleDateString('zh-CN');
    }
  };

  const renderDateSelector = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
    }}>
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
      }}>选择时间</Text>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{
          fontSize: 14,
          color: '#374151',
          marginRight: 8,
        }}>{getDateDisplay()}</Text>
        <Text style={{
          fontSize: 12,
          color: '#9CA3AF',
        }}>▼</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );

  const renderBasicInfo = () => {
    const deviceTypes = [
      { label: '设备总数', value: mockDeviceData.total, color: '#3B82F6' },
      { label: '单挑臂', value: mockDeviceData.singleArmLampNum, color: '#10B981' },
      { label: '双挑臂', value: mockDeviceData.doubleArmLampNum, color: '#F59E0B' },
      { label: '玉兰灯', value: mockDeviceData.yulanLampNum, color: '#EF4444' },
      { label: '庭院灯', value: mockDeviceData.gardenLampNum, color: '#8B5CF6' },
      { label: '其他', value: mockDeviceData.otherLampNum, color: '#6B7280' },
    ];

    return (
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 10,
          marginBottom: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: 16,
        }}>设备概览</Text>
        
        <View>
          {deviceTypes.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: index === deviceTypes.length - 1 ? 0 : 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 4,
                  height: 16,
                  backgroundColor: item.color,
                  borderRadius: 2,
                  marginRight: 12,
                }} />
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                }}>{item.label}</Text>
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: item.color,
              }}>{item.value.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderTimeRangeSelector = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#F1F5F9',
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    }}>
      {[
        { key: 'daily', label: '日' },
        { key: 'monthly', label: '月' },
        { key: 'yearly', label: '年' },
      ].map((item) => (
        <Pressable
          key={item.key}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: timeRange === item.key ? '#3B82F6' : 'transparent',
            alignItems: 'center',
          }}
          onPress={() => setTimeRange(item.key as any)}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: timeRange === item.key ? '#FFFFFF' : '#64748B',
          }}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderLightingHours = () => {
    const data = mockLightingHours[timeRange];
    
    return (
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: 16,
        }}>亮灯时长统计</Text>
        
        {renderDateSelector()}
        {renderTimeRangeSelector()}
        
        <View style={{
          height: 280,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <LineChart
            data={data}
            height={250}
            width={width - 80}
            spacing={50}
            initialSpacing={20}
            color="#3B82F6"
            textColor="#1F2937"
            textShiftY={-8}
            textShiftX={-10}
            textFontSize={11}
            thickness={3}
            startFillColor="rgba(59, 130, 246, 0.3)"
            endFillColor="rgba(59, 130, 246, 0.01)"
            startOpacity={0.9}
            endOpacity={0.2}
            noOfSections={5}
            yAxisColor="#E5E7EB"
            xAxisColor="#E5E7EB"
            yAxisTextStyle={{ color: '#6B7280', fontSize: 11 }}
            rulesColor="#F3F4F6"
            rulesType="solid"
            yAxisTextNumberOfLines={1}
            showVerticalLines
            verticalLinesColor="#F3F4F6"
            xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center', fontSize: 11 }}
            dataPointsColor="#3B82F6"
            dataPointsRadius={4}
            focusEnabled
            showStripOnFocus
            stripColor="#3B82F6"
            stripOpacity={0.2}
            stripWidth={1}
          />
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>平均时长</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#3B82F6' }}>
              {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}h
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>最高时长</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
              {Math.max(...data.map(item => item.value)).toFixed(1)}h
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>最低时长</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444' }}>
              {Math.min(...data.map(item => item.value)).toFixed(1)}h
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPowerConsumption = () => {
    const data = mockPowerConsumption[timeRange];
    
    return (
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: 16,
        }}>用电量统计</Text>
        
        {renderDateSelector()}
        {renderTimeRangeSelector()}
        
        <View style={{
          height: 280,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <BarChart
            data={data}
            height={250}
            width={width - 80}
            spacing={30}
            initialSpacing={20}
            barWidth={25}
            noOfSections={5}
            barBorderRadius={6}
            frontColor="#10B981"
            gradientColor="#34D399"
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center', fontSize: 11 }}
            yAxisTextStyle={{ color: '#6B7280', fontSize: 11 }}
            labelWidth={40}
            rotateLabel
            showGradient
          />
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>总用电量</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
              {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}kWh
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>平均用量</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#3B82F6' }}>
              {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(0)}kWh
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>峰值用量</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444' }}>
              {Math.max(...data.map(item => item.value))}kWh
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ScrollView 
      style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingHorizontal: 0,
        paddingVertical: 5,
      }}
    >
      <Animated.View entering={FadeIn}>
        {renderBasicInfo()}
        {renderLightingHours()}
        {renderPowerConsumption()}
      </Animated.View>
    </ScrollView>
  );
}