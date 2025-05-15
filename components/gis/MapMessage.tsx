import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

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

export default function MapMessage() {
  const currentTheme = useCurrentTheme();

  return (
    <View className="flex-1 bg-white rounded-t-3xl shadow-lg">
      <View className="p-4 border-b border-tertiary-200">
        <Text className="text-lg font-medium text-tertiary-900">设备信息</Text>
      </View>
      <ScrollView className="flex-1">
        {devices.map((device) => (
          <Pressable
            key={device.id}
            className="p-4 border-b border-tertiary-200 active:bg-tertiary-100"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name={device.type === 'ebox' ? 'cube' : 'bulb'}
                  size={24}
                  color={currentTheme.activeTint}
                  className="mr-2"
                />
                <View>
                  <Text className="text-base font-medium text-tertiary-900">
                    {device.name}
                  </Text>
                  <Text className="text-sm text-tertiary-500">
                    类型: {device.type === 'ebox' ? '配电箱' : '单灯'}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-sm text-green-600">{device.status}</Text>
                <Text className="text-xs text-tertiary-500">
                  {device.lastUpdate}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}