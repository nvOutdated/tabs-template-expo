import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export interface SmartLampFormData {
  name: string;
  device_code: string;
  location: string;
  gateway_code: string;
  area_id: string;
  lat: string;
  lng: string;
}

interface SmartLampFormProps {
  formData: SmartLampFormData;
  onFormDataChange: (data: SmartLampFormData) => void;
  allAreaList:any[];
}

const SmartLampForm = ({ formData, onFormDataChange,allAreaList }: SmartLampFormProps) => {
  return (
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">设备名称</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入设备名称"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => onFormDataChange({ ...formData, name: value })}
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">设备编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入设备编号"
            placeholderTextColor="#999"
            value={formData.device_code}
            onChangeText={(value) => onFormDataChange({ ...formData, device_code: value })}
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">安装位置</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入安装位置"
            placeholderTextColor="#999"
            value={formData.location}
            onChangeText={(value) => onFormDataChange({ ...formData, location: value })}
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">网关编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入网关编号"
            placeholderTextColor="#999"
            value={formData.gateway_code}
            onChangeText={(value) => onFormDataChange({ ...formData, gateway_code: value })}
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
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">纬度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入纬度"
            placeholderTextColor="#999"
            value={formData.lat}
            onChangeText={(value) => onFormDataChange({ ...formData, lat: value })}
          />
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base text-parimay-500 w-20">经度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-parimay-500"
            placeholder="请输入经度"
            placeholderTextColor="#999"
            value={formData.lng}
            onChangeText={(value) => onFormDataChange({ ...formData, lng: value })}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SmartLampForm;