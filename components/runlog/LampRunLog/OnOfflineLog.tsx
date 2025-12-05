import { stats_onlineOffline_log_list } from '@/api/runLog/lampRunLogApi';
import { formatDate } from '@/utils/date';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, Text, View } from 'react-native';
import SearchSection from '../common/SearchSection';

interface Container {
  id: string;
  device_code: string;
  name: string;
  searchName: string;
  deviceId: number;
}

export interface OnOfflineLogProps {
  containerList: Container[];
  selectedDevice: number | null;
  setSelectedDevice: (device: number | null) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 80; // 减小卡片高度，因为内容较少

// Move LogItem outside the main component and optimize it
const LogItem = memo(({ item }: { item: any }) => {
  return (
    <View className="mb-2 h-[80px]">
      <View className="flex-1 rounded-lg shadow-sm bg-background-50 p-3">
        <View className="flex-1">
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">设备编号：</Text>
              <Text className="text-tertiary-900 text-sm">{item.deviceCode}</Text>
            </View>
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">设备状态：</Text>
              <View className={`px-2 py-1 rounded ${item.isOnline ? 'bg-success-100' : 'bg-tertiary-100'}`}>
                <Text className={`text-sm ${item.isOnline ? 'text-success-600' : 'text-tertiary-600'}`}>
                  {item.isOnline ? '设备上线' : '设备下线'}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">创建时间：</Text>
              <Text className="text-tertiary-900 text-sm">{formatDate(item.createTime)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item);
});

LogItem.displayName = "LogItem";

const OnOfflineLog: React.FC<OnOfflineLogProps> = ({ containerList, selectedDevice, setSelectedDevice }) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 使用 ref 来跟踪 loading 状态，避免触发重渲染
  const loadingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const formatDateTime = useCallback((date: Date, isEnd: boolean = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} ${isEnd ? '23:59:59' : '00:00:00'}`;
  }, []);

  const fetchLogs = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        current: page,
        page_size: 10,
        deviceId: selectedDevice || null,
        start_time: startTime ? formatDateTime(startTime) : null,
        end_time: endTime ? formatDateTime(endTime, true) : null,
      };
      const response = await stats_onlineOffline_log_list(params);
      if (response.code === 200) {
        const newLogs = response.data || [];
        if (page === 1 || isRefresh) {
          setLogs(newLogs);
          // 重置滚动位置到顶部
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        } else {
          setLogs(prevLogs => [...prevLogs, ...newLogs]);
        }

        setHasMore(newLogs.length === 10);
        setCurrent(page);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDevice, startTime, endTime, formatDateTime]);

  // 监听查询条件变化
  useEffect(() => {
    setCurrent(1);
    fetchLogs(1, true);
  }, [selectedDevice, fetchLogs]);

  const handleRefresh = useCallback(() => {
    if (loadingRef.current) return;
    setRefreshing(true);
    fetchLogs(1, true);
  }, [fetchLogs]);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || loading) return;
    requestAnimationFrame(() => {
      fetchLogs(current + 1);
    });
  }, [hasMore, current, fetchLogs, loading]);

  const handleSearch = useCallback(() => {
    setCurrent(1);
    fetchLogs(1, true);
  }, [fetchLogs]);

  // Optimize renderItem with useCallback
  const renderItem = useCallback(
    ({ item }: { item: any }) => <LogItem item={item} />,
    []
  );

  // Optimize keyExtractor with useCallback
  const keyExtractor = useCallback(
    (item: any, index: number) => {
      return `${item.deviceCode}_${item.createTime}_${index}`;
    },
    []
  );

  // Optimize getItemLayout with useCallback
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
  );

  // Memoize ListEmptyComponent
  const ListEmptyComponent = useMemo(
    () => (
      <View className="flex-1 justify-center items-center p-5 h-full">
        <Text className="text-base text-tertiary-600 flex-1">暂无上下线日志数据</Text>
      </View>
    ),
    []
  );

  // Memoize ListFooterComponent
  const ListFooterComponent = useMemo(
    () => (
      <View className="p-2.5 items-center justify-center min-h-[50px] mb-5">
        {loading && logs.length > 0 ? (
          <View className="flex-row items-center justify-center p-2.5">
            <ActivityIndicator size="small" color="#666" />
            <Text className="ml-2 text-sm text-tertiary-600">加载中...</Text>
          </View>
        ) : logs.length === 0 ? (
          <Text className="text-base text-tertiary-600 flex-1">暂无数据</Text>
        ) : !hasMore ? (
          <Text className="text-sm text-tertiary-600 text-center">没有更多数据了</Text>
        ) : null}
      </View>
    ),
    [loading, logs.length, hasMore]
  );

  return (
    <View className="flex-1 bg-background-50">
      <SearchSection
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        // onSearch={handleSearch}
        containerList={containerList}
      />

      <FlatList
        ref={flatListRef}
        data={logs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { padding: 8, paddingBottom: 50 },
          logs.length === 0 && { flex: 1 }
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
};

export default OnOfflineLog;
