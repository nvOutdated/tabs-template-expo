import { stats_runLog_quey_list } from "@/api/runLog/lampRunLogApi";
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 模拟数据
const mockDevices = [
  { id: '1', code: 'LD001' },
  { id: '2', code: 'LD002' },
  { id: '3', code: 'LD003' },
];

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 220; // 添加固定卡片高度常量

// 将搜索条件部分抽离为独立组件
const SearchSection = memo(({ 
  isSearchExpanded, 
  setIsSearchExpanded,
  selectedDevice,
  setSelectedDevice,
  startTime,
  endTime,
  setShowStartTimePicker,
  setShowEndTimePicker,
  setShowDevicePicker,
  handleSearch
}: {
  isSearchExpanded: boolean;
  setIsSearchExpanded: (value: boolean) => void;
  selectedDevice: string;
  setSelectedDevice: (value: string) => void;
  startTime: Date | null;
  endTime: Date | null;
  setShowStartTimePicker: (value: boolean) => void;
  setShowEndTimePicker: (value: boolean) => void;
  setShowDevicePicker: (value: boolean) => void;
  handleSearch: () => void;
}) => (
  <View className="bg-background-100 py-3 px-6 border-b border-tertiary-100">
    <TouchableOpacity 
      style={styles.expandButton}
      onPress={() => setIsSearchExpanded(!isSearchExpanded)}
      className="flex-row items-center self-end"
    >
      <Text className="text-tertiary-900 mr-2 text-sm">搜索条件</Text>
      <Ionicons 
        name={isSearchExpanded ? "chevron-up" : "chevron-down"} 
        size={16} 
        color="#666" 
      />
    </TouchableOpacity>

    {isSearchExpanded && (
      <View style={styles.searchContent}>
        <View style={styles.searchItem}>
          <Text className="text-tertiary-900 text-sm">设备编号：</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
            onPress={() => setShowDevicePicker(true)}
          >
            <Text className="text-tertiary-900 text-sm">
              {selectedDevice || '请选择设备'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchItem}>
          <Text className="text-tertiary-900 text-sm">时间范围：</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text className="text-tertiary-900 text-sm">
              {startTime ? formatDate(startTime.getTime()) : '开始时间'}
            </Text>
          </TouchableOpacity>
          <Text className="text-tertiary-900 mx-2 text-sm">至</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text className="text-tertiary-900 text-sm">
              {endTime ? formatDate(endTime.getTime()) : '结束时间'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          className="bg-info-500"
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText} className="text-white text-sm">查询</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
));

SearchSection.displayName = "SearchSection";

// Move LogItem outside the main component and optimize it
const LogItem = memo(({ item }: { item: any }) => {
  const renderLoops = useMemo(() => (
    <View style={styles.loopsContainer}>
      {item.loops.map((status: boolean, loopIndex: number) => (
        <View
          key={loopIndex}
          style={[
            styles.loopBall,
            status ? styles.loopActive : styles.loopInactive,
          ]}
        >
          <Text style={styles.loopText}>{loopIndex + 1}</Text>
        </View>
      ))}
    </View>
  ), [item.loops]);

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
              <Text className="text-tertiary-900 font-bold text-sm">操作方式：</Text>
              <Text className="text-tertiary-900 text-sm">{item.mode}</Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">三相电压：</Text>
              <Text className="text-tertiary-900 text-sm">{item.voltages}V</Text>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">三相电流：</Text>
              <Text className="text-tertiary-900 text-sm">{item.currents}A</Text>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">用电量：</Text>
              <Text className="text-tertiary-900 text-sm">{item.power}kW·h</Text>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">设备温度：</Text>
              <Text className="text-tertiary-900 text-sm">{item.temperature}℃</Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">开关灯时间：</Text>
              <View>
                <Text className="text-tertiary-900 text-sm">开灯: {item.powerOn}</Text>
                <Text className="text-tertiary-900 text-sm">关灯: {item.powerOff}</Text>
              </View>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">开关量状态：</Text>
              <Text className="text-tertiary-900 text-sm">{item.ios}</Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">回路状态：</Text>
              {renderLoops}
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">操作时间：</Text>
              <Text className="text-tertiary-900 text-sm">{formatDate(item.optTime)}</Text>
            </View>
          </View>
          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">设备时间：</Text>
              <Text className="text-tertiary-900 text-sm">{formatDate(item.dateTime)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item);
});

LogItem.displayName = "LogItem";

export default function LampRunLog(){
  const [selectedDevice, setSelectedDevice] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 使用 ref 来跟踪 loading 状态，避免触发重渲染
  const loadingRef = useRef(false);

  const formatDateTime = useCallback((date: Date, isEnd: boolean = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} ${isEnd ? '23:59:59' : '00:00:00'}`;
  }, []);

  const fetchLogs = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    if (loadingRef.current) return; // 使用 ref 检查是否正在加载
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        current: page,
        page_size: 10,
        deviceId: selectedDevice || '',
        start_time: startTime ? formatDateTime(startTime) : null,
        end_time: endTime ? formatDateTime(endTime, true) : null,
      };

      const response = await stats_runLog_quey_list(params);
      if(response.code===200&&response.data){
        const newLogs = response.data || []; 
        if (isRefresh) {
          setLogs(newLogs);
        } else {
          // 优化：使用函数式更新，避免闭包问题
          setLogs(prevLogs => {
            // 检查是否有重复数据
            // const uniqueLogs = newLogs.filter((newLog: { id: any; }) => 
            //   !prevLogs.some(prevLog => prevLog.id === newLog.id)
            // );
            return [...prevLogs, ...newLogs];
          });
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
  }, [selectedDevice, startTime, endTime, formatDateTime]); // 添加必要的依赖

  // 使用 useRef 来跟踪是否是手动刷新
  const isManualRefresh = useRef(false);

  useEffect(() => {
    if (!isManualRefresh.current) {
      fetchLogs(1, true);
    }
    isManualRefresh.current = false;
  }, [fetchLogs]);

  const handleRefresh = useCallback(() => {
    if (loadingRef.current) return; // 防止重复刷新
    isManualRefresh.current = true;
    setRefreshing(true);
    fetchLogs(1, true);
  }, [fetchLogs]);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || loading) return;
    
    // 使用 requestAnimationFrame 来优化渲染时机
    requestAnimationFrame(() => {
      fetchLogs(current + 1);
    });
  }, [hasMore, current, fetchLogs, loading]);

  const handleTimeChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setShowStartTimePicker(false);
      if (selectedDate) {
        setStartTime(selectedDate);
      }
    } else {
      setShowEndTimePicker(false);
      if (selectedDate) {
        setEndTime(selectedDate);
      }
    }
  };

  const handleSearch = useCallback(() => {
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
      // 使用设备编号和时间戳组合作为唯一标识
      return `${item.deviceCode}_${item.optTime}_${index}`;
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无运行日志数据</Text>
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
          <Text style={styles.footerText}>暂无数据</Text>
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
        setShowStartTimePicker={setShowStartTimePicker}
        setShowEndTimePicker={setShowEndTimePicker}
        setShowDevicePicker={setShowDevicePicker}
        handleSearch={handleSearch}
      />

      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.logsContainer,
          logs.length === 0 && styles.emptyContainer
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2} // 降低阈值，提前触发加载
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
        maintainVisibleContentPosition={{ // 保持滚动位置
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />

      {showStartTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          is24Hour={true}
          // display="default"
          onChange={(event, date) => {
            if (event.type === 'set') {
              handleTimeChange(event, date, 'start');
            } else {
              setShowStartTimePicker(false);
            }
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          is24Hour={true}
          // display="default"
          onChange={(event, date) => {
            if (event.type === 'set') {
              handleTimeChange(event, date, 'end');
            } else {
              setShowEndTimePicker(false);
            }
          }}
        />
      )}

      <Modal
        visible={showDevicePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent} className="bg-background-50">
            <View style={styles.modalHeader}>
              <Text className="text-tertiary-900 text-lg font-bold">选择设备</Text>
              <TouchableOpacity onPress={() => setShowDevicePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {mockDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => {
                    setSelectedDevice(device.code);
                    setShowDevicePicker(false);
                  }}
                >
                  <Text className="text-tertiary-900">{device.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    padding: 12,
  },
  expandButton: {
    paddingVertical: 1,
  },
  searchContent: {
    marginTop: 8,
    gap: 8,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 100,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  searchButtonText: {
    fontSize: 12,
  },
  logsContainer: {
    padding: 8,
    paddingBottom: 50, // 增加底部padding，确保内容不被遮挡
  },
  logCardWrapper: {
    marginBottom: 8,
    height: CARD_HEIGHT, // 使用固定高度
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
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  loopsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  loopBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopActive: {
    backgroundColor: '#4CAF50',
  },
  loopInactive: {
    backgroundColor: '#9E9E9E',
  },
  loopText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  footer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50, // 确保底部组件有足够的高度
    marginBottom: 20, // 增加底部间距
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

// export default LampRunLog;
