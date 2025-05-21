import { stats_alarm_log_list } from '@/api/runLog/lampRunLogApi';
import { formatDate } from '@/utils/date';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchSection from '../common/SearchSection';

interface Container {
  id: string;
  device_code: string;
  name: string;
  searchName: string;
  deviceId: number;
}

export interface AlarmLogProps {
  containerList: Container[];
  selectedDevice: number | null;
  setSelectedDevice: (device: number | null) => void;
}

const ALARM_TYPES = [
  "未知报警",
  "电压电流恢复正常",
  "电压超下限报警",
  "电流超下限报警",
  "电压电流超下限报警",
  "关闭线路检测到电流报警",
  "电压超下限和关闭线路检测到电流报警",
  "电流超下限和关闭线路检测到电流报警",
  "输入开关量恢复正常",
  "输入开关量报警",
  "烟雾报警",
  "水浸报警"
];

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 180; // 增加卡片高度以适应更多内容

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
              <Text className="text-tertiary-900 font-bold text-sm">报警类型：</Text>
              <Text className="text-warning-500 text-sm">{item.alarmType}</Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">报警描述：</Text>
              <Text className={`text-sm ${item.description === '运行正常' ? 'text-success-600' : 'text-error-600'}`}>
                {item.description}
              </Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">三相电压：</Text>
              <Text className="text-tertiary-900 text-sm">{item.voltages}V</Text>
            </View>
            <View style={styles.logCardGridItem}>
              <Text className="text-tertiary-900 font-bold text-sm">电流值：</Text>
              <Text className="text-tertiary-900 text-sm">{item.currents}A</Text>
            </View>
          </View>

          <View style={styles.logCardGrid}>
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

const AlarmLog: React.FC<AlarmLogProps> = ({ containerList, selectedDevice, setSelectedDevice }) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedAlarmType, setSelectedAlarmType] = useState<string | null>(null);
  const [showAlarmTypePicker, setShowAlarmTypePicker] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
        alarmType: selectedAlarmType || null,
      }; 
      const response = await stats_alarm_log_list(params);
      if (response.code === 200) {
        const newLogs = response.data || [];
        if (page === 1 || isRefresh) {
          setLogs(newLogs);
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
  }, [selectedDevice, startTime, endTime, selectedAlarmType, formatDateTime]);

  useEffect(() => {
    setCurrent(1);
    fetchLogs(1, true);
  }, [selectedDevice,  selectedAlarmType, fetchLogs]);

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

  const handleAlarmTypeSelect = useCallback((type: string) => {
    setSelectedAlarmType(type);
    setShowAlarmTypePicker(false);
  }, []);

  const handleClearAlarmType = useCallback(() => {
    setSelectedAlarmType(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <LogItem item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => {
      return `${item.deviceCode}_${item.createTime}_${index}`;
    },
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={[styles.emptyContainer, { height: '100%' }]}>
        <Text style={styles.emptyText}>暂无报警日志数据</Text>
      </View>
    ),
    []
  );

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

  const additionalSearchContent = useMemo(() => (
    <View style={styles.searchItem}>
      <Text className="text-tertiary-900 text-sm">报警类型：</Text>
      <TouchableOpacity
        style={styles.searchInput}
        onPress={() => setShowAlarmTypePicker(true)}
        className="bg-background-100"
      >
        <Text className="text-tertiary-900 text-sm">
          {selectedAlarmType || '请选择报警类型'}
        </Text>
      </TouchableOpacity>
      {selectedAlarmType && (
        <TouchableOpacity
          onPress={handleClearAlarmType}
          className="ml-2"
        >
          <Text className="text-error-500 text-sm">清除</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [selectedAlarmType, handleClearAlarmType]);

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
        additionalSearchContent={additionalSearchContent}
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

      <Modal
        visible={showAlarmTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlarmTypePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent} className="bg-background-50">
            <View style={styles.modalHeader}>
              <Text className="text-tertiary-900 text-lg font-bold">选择报警类型</Text>
              <TouchableOpacity
                onPress={() => setShowAlarmTypePicker(false)}
                className="p-2"
              >
                <Text className="text-tertiary-500">关闭</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ALARM_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.alarmTypeItem}
                  onPress={() => handleAlarmTypeSelect(item)}
                >
                  <Text className="text-tertiary-900">{item}</Text>
                </TouchableOpacity>
              )}
            />
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
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 120,
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
  alarmTypeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
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

export default AlarmLog;
