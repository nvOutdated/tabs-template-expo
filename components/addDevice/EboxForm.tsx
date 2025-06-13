import { get_version_list } from '@/api/street/streetCommon';
import { useAreaStore } from '@/store/areaStore';
import { transferDate } from '@/utils/date';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
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

export default function EboxForm() {
  const [formData, setFormData] = useState({
    device_code: "",
    device_type: "Central",
    name: "",
    sn: "",
    ebox_type: "CABINET",
    area_id: "",
    version: "",
    install_time: undefined as Date|undefined,
    lng: "",
    lat: "",
    model: "",
    e_meter: "",
    remark: "",
  });
  const [versionList,setVersionList] = useState<string[]>([]);
  const {allAreaList}  =useAreaStore()
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(()=>{
    get_version_list({}).then(res=>{
      if(res.code==200){
        const data = res.data.map((item:string)=>{  
          return {
            label:item,
            value:item
          }
        })
        setFormData({...formData,version:data[0].value})
        setVersionList(data)
      }
    })
  },[]) 
  
  return (
    <>
    {
      showDatePicker && (
        <DateTimePicker
          value={formData.install_time || new Date()}
          mode="date"
          onChange={(event, date) => {
            if (event.type === 'set' && date) {
              setFormData({ ...formData, install_time: date });
            }
          }}
        />
      )
    }
    <ScrollView className="flex-1 p-4 bg-background-50">
      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">网关编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="1-11个数字(必填)"
            placeholderTextColor="#999"
            value={formData.device_code}
            onChangeText={(value) =>
              setFormData({ ...formData, device_code: value })
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
              value={formData.device_type}
              onChange={(item) => {
                setFormData({ ...formData, device_type: item.value });
              }}
            />
      
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备名称</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="1-20个字(必填)"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备编号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="1-12个字(必填)"
            placeholderTextColor="#999"
            value={formData.sn}
            onChangeText={(value) => setFormData({ ...formData, sn: value })}
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
                setFormData({ ...formData, ebox_type: item.value });
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
              labelField="name"
              valueField="area_id"
              placeholder="请选择区域"
              searchPlaceholder="搜索..."
              mode='default'
              value={formData.area_id}
              onChange={(item) => {
                setFormData({ ...formData, area_id: item.value });
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
                setFormData({ ...formData, version: item.value });
              }}
            /> 
         
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">安装时间</Text>
          <Pressable onPress={() => setShowDatePicker(true)}  
          className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 flex-row items-center justify-between">
            <Text className="text-base text-primary-400">{formData.install_time ? transferDate((formData.install_time).getTime()) : '请选择安装时间'}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </Pressable>
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备经度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="请输入经度"
            placeholderTextColor="#999"
            value={formData.lng}
            onChangeText={(value) => setFormData({ ...formData, lng: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">设备纬度</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="请输入纬度"
            placeholderTextColor="#999"
            value={formData.lat}
            onChangeText={(value) => setFormData({ ...formData, lat: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">容器型号</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="请输入容器型号"
            placeholderTextColor="#999"
            value={formData.model}
            onChangeText={(value) => setFormData({ ...formData, model: value })}
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">电表地址</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="请输入电表地址"
            placeholderTextColor="#999"
            value={formData.e_meter}
            onChangeText={(value) =>
              setFormData({ ...formData, e_meter: value })
            }
          />
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-0">
          <Text className="text-base text-primary-500 w-20">备注</Text>
          <TextInput
            className="flex-1 h-11 bg-white border border-outline-100 rounded-lg px-3 text-base text-primary-500"
            placeholder="请输入备注"
            placeholderTextColor="#999"
            value={formData.remark}
            onChangeText={(value) =>
              setFormData({ ...formData, remark: value })
            }
          />
        </View>
      </View>
    </ScrollView>
    </>
  );
}
