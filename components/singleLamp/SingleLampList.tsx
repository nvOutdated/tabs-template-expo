import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

interface SingleLamp {
  poleName: string;
  poleCode: string;
  poleType: string;
  direction: number;
}

interface SingleLampListProps {
  singleLamps: SingleLamp[];
  loading: boolean;
  hasMore: boolean;
  onEndReached: () => void;
  refreshControl?: React.ReactElement<RefreshControl["props"]>;
  ListEmptyComponent?: React.ReactElement;
}

const SingleLampList = ({
  singleLamps,
  loading,
  hasMore,
  onEndReached,
  refreshControl,
  ListEmptyComponent,
}: SingleLampListProps) => {
  const getPoleType = useCallback((type: string) => {
    switch (type) {
      case '1': return '单挑臂';
      case '2': return '双挑臂';
      case '3': return '玉兰灯';
      case '4': return '庭院灯';
      case '5': return '其他';
      default: return '未知';
    }
  }, []);

  const getDirection = useCallback((direction: number) => {
    switch (direction) {
      case 1: return '东';
      case 2: return '南';
      case 3: return '西';
      case 4: return '北';
      default: return '未知';
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: SingleLamp }) => {
    return (
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{item.poleName}</Text>
          <Text className="text-sm text-gray-500 mt-1">编号: {item.poleCode}</Text>
        </View>
        <View className="flex-row items-center space-x-4">
          <View className="bg-blue-100 px-2 py-1 rounded">
            <Text className="text-sm text-blue-600">{getPoleType(item.poleType)}</Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-sm text-green-600">{getDirection(item.direction)}</Text>
          </View>
        </View>
      </View>
    );
  }, [getPoleType, getDirection]);

  return (
    <FlatList
      data={singleLamps}
      renderItem={renderItem}
      keyExtractor={(item) => item.poleCode}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={singleLamps.length === 0 ? { flex: 1 } : undefined}
    />
  );
};

export default SingleLampList;

