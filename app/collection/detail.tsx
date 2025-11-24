import { get_version_list } from '@/api/street/streetCommon';
import EboxForm, { EboxFormData } from '@/components/addDevice/EboxForm';
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { addEbox, getEboxById, initDatabase, updateEbox } from '@/services/database';
import { useAreaStore } from '@/store/areaStore';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeviceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const currentTheme = useCurrentTheme();
  
  const [formData, setFormData] = useState<EboxFormData>({
    device_info: {
        device_code: '',
        device_type: '',
        e_meter: ''
    },
    ebox_type: '',
    name: '',
    sn: '',
    area_id: '',
    version: '',
    install_time: new Date(),
    lng: '',
    lat: '',
    model: '',
    e_meter: '',
    remark: ''
  });
  const [versionList, setVersionList] = useState<any>([]);
  const { allAreaList } = useAreaStore();
  const [allAreaListprops, setAllAreaListprops] = useState<any>([]);

  useEffect(() => {
    initDatabase();
    
    // Fetch version list
    get_version_list({}).then(res => {
      if (res.code === 200) {
        const setVersionListData = res.data.map((item:any)=>{
          return {
            key:item,
            value:item,
            label:item,
          }
        })
        setVersionList(setVersionListData)
      }
    });

    // Prepare area list
    const setAllAreaListpropsData = allAreaList.map((item:any)=>{
      return {
        key:item.area_id,
        value:String(item.area_id),
        label:item.name,
      }
    })
    setAllAreaListprops(setAllAreaListpropsData);

    // Load existing data if id is present
    if (id) {
      navigation.setOptions({ title: '编辑设备' });
      // Temporary: fetch list and find (inefficient but works for small data)
      const found = getEboxById(parseInt(id));
      if (found) {
        setFormData({
            ...found,
            area_id: String(found.area_id),
            install_time: found.install_time ? new Date(found.install_time) : undefined
        });
      }
    } else {
      navigation.setOptions({ title: '添加设备' });
    }
  }, [id, allAreaList]);

  const handleSave = (data: EboxFormData) => {
    try {
      if (id) {
        updateEbox(parseInt(id), data);
        Alert.alert('成功', '修改成功');
      } else {
        addEbox(data);
        Alert.alert('成功', '添加成功');
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '保存失败');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.drawerBg }]}>
      <View style={styles.form}>
        <EboxForm
            formData={formData}
            onFormDataChange={setFormData}
            versionList={versionList}
            allAreaList={allAreaListprops}
        />
        
        <View style={{ marginTop: 20 }}>
             <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: '#007AFF' }]} 
                onPress={() => handleSave(formData)}
             >
                <Text style={styles.saveButtonText}>保存</Text>
             </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 10,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
