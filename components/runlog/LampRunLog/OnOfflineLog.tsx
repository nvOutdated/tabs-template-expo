import { stats_onlineOffline_log_list } from '@/api/runLog/lampRunLogApi';
import { formatDate } from '@/utils/date';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.logCardWrapper}>
      <View style={styles.logCard} className="bg-background-50">
        <View style={styles.logCardContent}>
          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">设备编号：</Text>
              <Text className="text-tertiary-900 text-sm">{item.deviceCode}</Text>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">设备状态：</Text>
              <View className={`px-2 py-1 rounded ${item.isOnline ? 'bg-success-100' : 'bg-tertiary-100'}`}>
                <Text className={`text-sm ${item.isOnline ? 'text-success-600' : 'text-tertiary-600'}`}>
                  {item.isOnline ? '设备上线' : '设备下线'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
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
      <View style={[styles.emptyContainer, { height: '100%' }]}>
        <Text style={styles.emptyText}>暂无上下线日志数据</Text>
      </View>
    ),
    []
  );

  // Memoize ListFooterComponent
  const ListFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        {loading && logs.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : logs.length === 0 ? (
          <Text style={styles.emptyText}>暂无数据</Text>
        ) : !hasMore ? (
          <Text style={styles.footerText}>没有更多数据了</Text>
        ) : null}
      </View>
    ),
    [loading, logs.length, hasMore]
  );

  return (
    <View style={styles.container} className="bg-background-50">
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
          styles.logsContainer,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logsContainer: {
    padding: 8,
    paddingBottom: 50,
  },
  logCardWrapper: {
    marginBottom: 8,
    height: CARD_HEIGHT,
  },
  logCard: {
    flex: 1,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#fff',
  },
  logCardContent: {
    flex: 1,
    padding: 12,
  },
  logCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  logCardGridItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  footer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OnOfflineLog;
