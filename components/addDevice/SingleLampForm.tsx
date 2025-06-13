import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function SingleLampForm() {
  return (
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">灯杆编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入灯杆编号"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">灯杆类型</Text>
          <Pressable className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择灯杆类型</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">安装位置</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入安装位置"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">所属区域</Text>
          <Pressable className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-tertiary-400">请选择所属区域</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
} 