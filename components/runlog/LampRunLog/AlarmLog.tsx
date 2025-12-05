import { stats_alarm_log_list } from '@/api/runLog/lampRunLogApi';
import { formatDate } from '@/utils/date';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
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
const CARD_HEIGHT = 160; // 增加卡片高度以适应更多内容

// Move LogItem outside the main component and optimize it
const LogItem = memo(({ item }: { item: any }) => {
  const renderLoops = useMemo(() => (
    <View className="flex-row flex-wrap gap-1">
      {item.loops.map((status: boolean, loopIndex: number) => (
        <View
          key={loopIndex}
          className={`w-5 h-5 rounded-full justify-center items-center ${status ? 'bg-success-500' : 'bg-tertiary-300'
            }`}
        >
          <Text className="text-white text-[10px] font-bold">{loopIndex + 1}</Text>
        </View>
      ))}
    </View>
  ), [item.loops]);

  return (
    <View className="mb-2 h-[160px]">
      <View className="flex-1 rounded-lg shadow-sm bg-background-50 p-3 border border-outline-100">
        <View className="flex-1">
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">设备编号：</Text>
              <Text className="text-tertiary-900 text-sm">{item.deviceCode}</Text>
            </View>
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">三相电压：</Text>
              <Text className="text-tertiary-900 text-sm">{item.voltages}V</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {/* <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">三相电压：</Text>
              <Text className="text-tertiary-900 text-sm">{item.voltages}V</Text>
            </View> */}
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">电流值：</Text>
              <Text className="text-tertiary-900 text-sm">{item.currents}A</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-2">
          <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">报警类型：</Text>
              <Text className="text-warning-500 text-sm">{item.alarmType}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">报警描述：</Text>
              <Text className={`text-sm ${item.description === '运行正常' ? 'text-success-600' : 'text-error-600'}`}>
                {item.description}
              </Text>
            </View>
          </View>

          

         {/*  <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">开关量状态：</Text>
              <Text className="text-tertiary-900 text-sm">{item.ios}</Text>
            </View>
          </View> */}

          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-1 min-w-[45%] flex-row items-center gap-1">
              <Text className="text-tertiary-900 font-bold text-sm">回路状态：</Text>
              {renderLoops}
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
  }, [selectedDevice, selectedAlarmType, fetchLogs]);

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
      <View className="flex-1 justify-center items-center p-5 h-full">
        <Text className="text-base text-tertiary-600 flex-1">暂无报警日志数据</Text>
      </View>
    ),
    []
  );

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

  const additionalSearchContent = useMemo(() => (
    <View className="flex-row items-center mb-2">
      <Text className="text-tertiary-900 text-sm">报警类型：</Text>
      <TouchableOpacity
        className="flex-1 px-2 py-1 rounded bg-background-100 min-w-[120px]"
        onPress={() => setShowAlarmTypePicker(true)}
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
        additionalSearchContent={additionalSearchContent}
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

      <Modal
        visible={showAlarmTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlarmTypePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background-50 rounded-t-2xl p-4 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
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
                  className="py-3 px-4 border-b border-outline-100"
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

export default AlarmLog;
