import { transferDate } from '@/utils/date';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const gatewayTypes = [
  { label: "集中控制器", value: "Central" },
  { label: "景观灯控制器", value: "LandscapeLamp" },
  { label: "景观亮化模块", value: "LandscapeLightingModule" },
  { label: "光照度传感器", value: "LightSensor" },
  { label: "电缆防盗网关", value: "EcsGateway" },
];

const containerTypes = [
  { value: 'CABINET', label: "配电箱" },
  { value: 'TRANSFORMER', label: "箱变" },
  { value: "OTHER", label: "其他" }
];

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
    flex: 1,
    fontSize: 14,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 50,
    fontSize: 14,
    color: '#333',
  },
});

export interface EboxFormData {
  device_info: {
    device_code:string,
    device_type:string,
    e_meter:string,
  },
  ebox_type: string;
  name: string;
  sn: string;
  area_id: string;
  version: string;
  install_time: Date | undefined;
  lng: string;
  lat: string;
  model: string;
  e_meter: string;
  remark: string;
}
interface EboxFormProps {
  formData: EboxFormData;
  onFormDataChange: (data: EboxFormData) => void;
  versionList:string[];
  allAreaList:any[];
}

const EboxForm =({formData, onFormDataChange,versionList,allAreaList}:EboxFormProps) => {
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <>
    {
      showDatePicker && (
        <DateTimePicker
          value={formData.install_time || new Date()}
          mode="date"
          onChange={(event, date) => {
            if (event.type === 'set' && date) {
              onFormDataChange({ ...formData, install_time: date });
            }
            setShowDatePicker(false)
          }}
        />
      )
    }
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">网关编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="1-11个数字(必填)"
            placeholderTextColor="#999"
            value={formData.device_info?.device_code || ''}
            onChangeText={(value) =>
              onFormDataChange({ ...formData, device_info:{...formData.device_info ?? {}, device_code:value} })
            }
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">网关类型</Text>
      
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={gatewayTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="请选择网关类型"
              searchPlaceholder="搜索..."
              value={formData.device_info?.device_type}
              onChange={(item) => {
                onFormDataChange({ ...formData, device_info:{...formData.device_info ?? {}, device_type:item.value} });
              }}
            />
      
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备名称</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="1-20个字(必填)"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => onFormDataChange({ ...formData, name: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="1-12个字(必填)"
            placeholderTextColor="#999"
            value={formData.sn}
            onChangeText={(value) => onFormDataChange({ ...formData, sn: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">容器类型</Text>
       
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={containerTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="请选择容器类型" 
              searchPlaceholder="搜索..."
              value={formData.ebox_type}
              onChange={(item) => {
                onFormDataChange({ ...formData, ebox_type: item.value });
              }}
            />
        
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">区域名称</Text>
          
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={allAreaList}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="请选择区域"
              searchPlaceholder="搜索..."
              mode='default'
              value={formData.area_id}
              onChange={(item) => {
                onFormDataChange({ ...formData, area_id: item.value });
              }}
            /> 
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">版本协议</Text>
          
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={versionList}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="请选择版本协议"
              searchPlaceholder="搜索..."
              value={formData.version}
              onChange={(item) => {
                onFormDataChange({ ...formData, version: item.value });
              }}
            /> 
         
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">安装时间</Text>
          <Pressable onPress={() => setShowDatePicker(true)}  
          className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 flex-row items-center justify-between">
            <Text className="text-base text-primary-400">{formData.install_time ? transferDate((formData.install_time).getTime()) : '请选择安装时间'}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </Pressable>
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备经度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="请输入经度"
            placeholderTextColor="#999"
            value={formData.lng}
            onChangeText={(value) => onFormDataChange({ ...formData, lng: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备纬度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="请输入纬度"
            placeholderTextColor="#999"
            value={formData.lat}
            onChangeText={(value) => onFormDataChange({ ...formData, lat: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">容器型号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="请输入容器型号"
            placeholderTextColor="#999"
            value={formData.model}
            onChangeText={(value) => onFormDataChange({ ...formData, model: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">电表地址</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="请输入电表地址"
            placeholderTextColor="#999"
            value={formData.e_meter}
            onChangeText={(value) =>
              onFormDataChange({ ...formData, e_meter: value })
            }
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">备注</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 py-2 text-base text-primary-500"
            placeholder="请输入备注"
            placeholderTextColor="#999"
            value={formData.remark}
            onChangeText={(value) =>
              onFormDataChange({ ...formData, remark: value })
            }
          />
        </View>
      </View>
    </ScrollView>
    </>
  );
};

EboxForm.displayName = 'EboxForm';

export default EboxForm;
