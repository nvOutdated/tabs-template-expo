import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { CollectionDevice, useCollectionStore } from '@/store/collectionStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import XLSX from 'xlsx';

export default function CollectionHome() {
  const router = useRouter();
  const currentTheme = useCurrentTheme();
  const { devices, deleteDevice } = useCollectionStore();
  const [searchText, setSearchText] = useState('');

  const filteredDevices = useMemo(() => {
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.sn.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [devices, searchText]);

  const handleExport = async () => {
    try {
      if (devices.length === 0) {
        Alert.alert('提示', '暂无数据可导出');
        return;
      }

      const data = devices.map((d) => ({
        '设备名称': d.name,
        '设备编号': d.sn,
        '安装地址': d.address,
        '所属区域': d.area,
        '纬度': d.latitude,
        '经度': d.longitude,
        '采集时间': new Date(d.createTime).toLocaleString(),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '采集数据');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      // const FS = FileSystem as any;
      // const uri = (FS.cacheDirectory || FS.documentDirectory) + 'collection_data.xlsx';

      // await FS.writeAsStringAsync(uri, wbout, {
      //   encoding: FS.EncodingType.Base64,
      // });

      // await Sharing.shareAsync(uri, {
      //   mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      //   dialogTitle: '导出采集数据',
      //   UTI: 'com.microsoft.excel.xlsx',
      // });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('错误', '导出失败，请重试');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('确认删除', '确定要删除该设备吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteDevice(id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: CollectionDevice }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: currentTheme.headerBg }]}
      onPress={() => router.push({ pathname: '/(collection)/detail', params: { id: item.id } })}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: currentTheme.activeTint }]}>{item.name}</Text>
        <Text style={[styles.itemTime, { color: currentTheme.inactiveTint }]}>
          {new Date(item.createTime).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.itemSn, { color: currentTheme.inactiveTint }]}>SN: {item.sn}</Text>
      <Text style={[styles.itemAddress, { color: currentTheme.inactiveTint }]} numberOfLines={1}>
        地址: {item.address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.drawerBg }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="search" size={20} color={currentTheme.inactiveTint} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.activeTint }]}
            placeholder="搜索设备名称或SN"
            placeholderTextColor={currentTheme.inactiveTint}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
          <Ionicons name="share-outline" size={24} color={currentTheme.activeTint} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>router.push('/is-login')}>
          <Text>退出</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentTheme.inactiveTint }]}>
              暂无采集数据，点击右下角添加
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#007AFF' }]}
        onPress={() => router.push('/(collection)/detail')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  exportButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemTime: {
    fontSize: 12,
  },
  itemSn: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
  },
});
