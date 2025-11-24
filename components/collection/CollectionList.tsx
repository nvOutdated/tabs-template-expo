import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControlProps,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const centralControllerImage = require("@/assets/images/street/electricBox/centralController.png");

export type CollectionItem = {
  id: number;
  name: string;
  sn: string;
  device_code: string;
  device_type: string;
  ebox_type: string;
  area_id: number;
  version: string;
  install_time: string;
  lng: string;
  lat: string;
  model: string;
  e_meter: string;
  remark: string;
  device_info: any;
  created_at: string;
  area_name?: string;
};

interface CollectionListProps {
  items: CollectionItem[];
  loading: boolean;
  hasMore: boolean;
  onEndReached: () => void;
  onEditItem: (item: CollectionItem) => void;
  onDeleteItem: (item: CollectionItem) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const CollectionList: React.FC<CollectionListProps> = ({
  items,
  loading,
  hasMore,
  onEndReached,
  onEditItem,
  onDeleteItem,
  refreshControl,
}) => {
  const currentTheme = useCurrentTheme();

  const renderItem = ({ item }: { item: CollectionItem }) => (
    <View style={[styles.card, { backgroundColor: currentTheme.headerBg }]}>
      <View style={styles.cardContent}>
        {/* 左侧图片 */}
        <Image
          source={centralControllerImage}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* 中间内容 */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: currentTheme.activeTint }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.sn, { color: currentTheme.inactiveTint }]} numberOfLines={1}>
            SN: {item.sn}
          </Text>
          <Text style={[styles.detail, { color: currentTheme.inactiveTint }]} numberOfLines={1}>
            区域: {item.area_name || '未知'}
          </Text>
          <Text style={[styles.detail, { color: currentTheme.inactiveTint }]} numberOfLines={1}>
            采集时间: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* 右侧操作按钮 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => onEditItem(item)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => onDeleteItem(item)}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color={currentTheme.inactiveTint} />
      <Text style={[styles.emptyText, { color: currentTheme.inactiveTint }]}>
        暂无采集数据
      </Text>
      <Text style={[styles.emptySubText, { color: currentTheme.inactiveTint }]}>
        点击右下角"+"按钮添加设备
      </Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sn: {
    fontSize: 13,
    marginBottom: 2,
  },
  detail: {
    fontSize: 12,
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default CollectionList;
