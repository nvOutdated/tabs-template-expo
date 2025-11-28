import { CollectionItem } from '@/components/collection/CollectionList';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControlProps,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const singleLampImage = require('@/assets/images/street/singleLamp/singleLampOfflin.png');

const getPoleTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    '1': '单挑臂',
    '2': '双挑臂',
    '3': '玉兰灯',
    '4': '庭院灯',
    '5': '其他',
  };
  return (type && map[type]) || '未知';
};

const getDirectionLabel = (direction?: number) => {
  const map: Record<number, string> = { 1: '东', 2: '南', 3: '西', 4: '北' };
  return (direction && map[direction]) || '未知';
};

const getLightingType = (type?: number) => {
  const map: Record<number, string> = {
    0: '未知',
    1: '机动车',
    2: '非机动车',
    3: '顶部灯',
    4: '节日灯',
    5: '其他',
  };
  return type === undefined ? '未知' : map[type] || '未知';
};

const getControllerTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    SINGLE_HEAD_PLC: 'PLC单头',
    DOUBLE_HEAD_PLC: 'PLC双头',
    SINGLE_HEAD_CAT1: 'Cat1单头',
    DOUBLE_HEAD_CAT1: 'Cat1双头',
  };
  return (type && map[type]) || type || '未知';
};

interface CollectionSingleLampListProps {
  items: CollectionItem[];
  loading: boolean;
  hasMore: boolean;
  onEndReached: () => void;
  onEditItem: (item: CollectionItem) => void;
  onDeleteItem: (item: CollectionItem) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const CollectionSingleLampList: React.FC<CollectionSingleLampListProps> = ({
  items,
  loading,
  hasMore,
  onEndReached,
  onEditItem,
  onDeleteItem,
  refreshControl,
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const handleToggle = useCallback((id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CollectionItem }) => {
      const isExpanded = !expanded[item.id];
      const controllers = item.controllers || [];

      return (
        <View className="bg-white mx-4 mb-3 rounded-2xl shadow-sm overflow-hidden">
          <View className="flex-row items-center p-3">
            <Image source={singleLampImage} className="w-16 h-16 rounded-lg mr-3" resizeMode="contain" />
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-gray-900">{item.pole_name || item.pole_code || '未命名灯杆'}</Text>
              <Text className="text-xs text-gray-500">编号：{item.pole_code || '--'}</Text>
              <Text className="text-xs text-gray-500">
                类型：{getPoleTypeLabel(item.pole_type)} · 方向：{getDirectionLabel(item.direction)}
              </Text>
              <Text className="text-xs text-gray-500">地址：{item.addr || item.location || '未填写'}</Text>
            </View>
            <View className="items-end gap-2">
              <TouchableOpacity className="px-3 py-1 rounded-full bg-blue-100" onPress={() => onEditItem(item)}>
                <Text className="text-xs text-blue-500">编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-3 py-1 rounded-full bg-rose-100" onPress={() => onDeleteItem(item)}>
                <Text className="text-xs text-rose-500">删除</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-3 py-1" onPress={() => handleToggle(item.id)}>
                <Text className="text-xs text-gray-600">{isExpanded ? '收起' : '展开'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isExpanded && (
            <View className="bg-gray-50 px-3 pb-3">
              {controllers.length === 0 ? (
                <Text className="text-xs text-gray-400 py-2 text-center">暂无控制器数据</Text>
              ) : (
                controllers.map((controller, idx) => (
                  <View key={`${controller.controllerId}-${idx}`} className="bg-white rounded-xl p-3 mb-2">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-sm font-semibold text-gray-800">
                        控制器：{controller.controllerId || '未知'}
                      </Text>
                      <Text className="text-xs text-gray-500">{getControllerTypeLabel(controller.controllerType)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs text-gray-500">所属组：{controller.groupIds4Save?.join(',') || '--'}</Text>
                      <Text className="text-xs text-gray-500">检测组：{controller.groupIds4Detect?.join(',') || '--'}</Text>
                    </View>
                    {(controller.lamps || []).map((lamp, lampIdx) => (
                      <View key={`${lamp.lightLoop}-${lampIdx}`} className="flex-row justify-between py-1 border-t border-gray-100">
                        <Text className="text-xs text-gray-600 w-1/5 text-center">{lamp.lightLoop}</Text>
                        <Text className="text-xs text-gray-600 w-1/5 text-center">{getLightingType(lamp.lightingType)}</Text>
                        <Text className="text-xs text-gray-600 w-1/5 text-center">{lamp.phase || '--'}</Text>
                        <Text className="text-xs text-gray-600 w-2/5 text-center">
                          交流接触器：{lamp.cfgName || '--'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      );
    },
    [expanded, handleToggle, onDeleteItem, onEditItem],
  );

  const footer = useMemo(() => {
    if (!loading && !hasMore) {
      return (
        <View className="py-4 items-center">
          <Text className="text-xs text-gray-400">没有更多数据了</Text>
        </View>
      );
    }
    return null;
  }, [hasMore, loading]);

  const empty = (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-gray-400 text-sm">暂无采集数据，点击上方按钮新增</Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
    />
  );
};

export default CollectionSingleLampList;

