import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useCollectionStore } from '@/store/collectionStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DeviceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const currentTheme = useCurrentTheme();
  const { addDevice, updateDevice, getDevice } = useCollectionStore();

  const [name, setName] = useState('');
  const [sn, setSn] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (id) {
      const device = getDevice(id);
      if (device) {
        setName(device.name);
        setSn(device.sn);
        setAddress(device.address);
        setArea(device.area);
        setLatitude(device.latitude);
        setLongitude(device.longitude);
        navigation.setOptions({ title: '编辑设备' });
      }
    } else {
      navigation.setOptions({ title: '添加设备' });
    }
  }, [id]);

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要位置权限才能获取当前位置');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      
      // 尝试获取地址
      try {
        let addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const addr = addressResponse[0];
          const fullAddress = `${addr.region || ''}${addr.city || ''}${addr.district || ''}${addr.street || ''}${addr.streetNumber || ''}`;
          if (fullAddress && !address) {
            setAddress(fullAddress);
          }
        }
      } catch (e) {
        console.log('Reverse geocode failed', e);
      }

    } catch (error) {
      Alert.alert('错误', '获取位置失败');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !sn.trim()) {
      Alert.alert('提示', '设备名称和编号不能为空');
      return;
    }

    const deviceData = {
      name,
      sn,
      address,
      area,
      latitude,
      longitude,
    };

    if (id) {
      updateDevice(id, deviceData);
    } else {
      addDevice(deviceData);
    }

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.drawerBg }]}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.activeTint }]}>设备名称 *</Text>
          <TextInput
            style={[styles.input, { color: currentTheme.activeTint, borderColor: currentTheme.inactiveTint }]}
            value={name}
            onChangeText={setName}
            placeholder="请输入设备名称"
            placeholderTextColor={currentTheme.inactiveTint}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.activeTint }]}>设备编号 (SN) *</Text>
          <TextInput
            style={[styles.input, { color: currentTheme.activeTint, borderColor: currentTheme.inactiveTint }]}
            value={sn}
            onChangeText={setSn}
            placeholder="请输入设备编号"
            placeholderTextColor={currentTheme.inactiveTint}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.activeTint }]}>所属区域</Text>
          <TextInput
            style={[styles.input, { color: currentTheme.activeTint, borderColor: currentTheme.inactiveTint }]}
            value={area}
            onChangeText={setArea}
            placeholder="请输入所属区域"
            placeholderTextColor={currentTheme.inactiveTint}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: currentTheme.activeTint }]}>安装地址</Text>
            <TouchableOpacity onPress={handleGetLocation} disabled={loadingLocation}>
              <View style={styles.locationBtn}>
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <>
                    <Ionicons name="location-outline" size={16} color="#007AFF" />
                    <Text style={styles.locationBtnText}>获取定位</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { color: currentTheme.activeTint, borderColor: currentTheme.inactiveTint }]}
            value={address}
            onChangeText={setAddress}
            placeholder="请输入安装地址"
            placeholderTextColor={currentTheme.inactiveTint}
            multiline
          />
          {latitude && longitude && (
            <Text style={[styles.coords, { color: currentTheme.inactiveTint }]}>
              经纬度: {longitude.toFixed(6)}, {latitude.toFixed(6)}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationBtnText: {
    color: '#007AFF',
    fontSize: 14,
  },
  coords: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
