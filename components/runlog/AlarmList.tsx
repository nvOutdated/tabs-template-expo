import { useRunLogStore } from '@/store/runlogStore';
import { AlarmMessage } from '@/types/runlog';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const AlarmList: React.FC = () => {
  const { alarms, markAlarmAsRead } = useRunLogStore();
  const [selectedAlarms, setSelectedAlarms] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedAlarms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAlarms.size === alarms.length) {
      setSelectedAlarms(new Set());
    } else {
      setSelectedAlarms(new Set(alarms.map(alarm => alarm.id)));
    }
  };

  const handleMarkAsRead = () => {
    selectedAlarms.forEach(id => {
      markAlarmAsRead(id);
    });
    setSelectedAlarms(new Set());
  };

  const renderAlarm = ({ item }: { item: AlarmMessage }) => (
    <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
      <TouchableOpacity
        className="flex-row p-3 rounded-lg mb-2 items-center shadow-sm bg-background-0"
        onPress={() => toggleSelect(item.id)}
      >
        <TouchableOpacity
          className="mr-2 p-1"
          onPress={() => toggleSelect(item.id)}
        >
          <Ionicons
            name={selectedAlarms.has(item.id) ? "checkbox" : "square-outline"}
            size={24}
            color={selectedAlarms.has(item.id) ? "#409eff" : "#909399"}
          />
        </TouchableOpacity>
        <View className={`w-1 h-full rounded-sm mr-3 ${item.type === 'alarm' ? 'bg-error-500' :
            item.type === 'warning' ? 'bg-warning-500' : 'bg-info-500'
          }`} />
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base font-bold flex-1 mr-2 text-error-500" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs px-2 py-0.5 rounded bg-tertiary-100 text-tertiary-900">
              {item.module}
            </Text>
          </View>
          <Text className="text-sm mb-1 leading-5 text-tertiary-900" numberOfLines={2}>
            {item.content}
          </Text>
          <Text className="text-xs text-tertiary-500">
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const EmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-8">
      <Ionicons name="notifications-off-outline" size={48} color="#909399" />
      <Text className="mt-3 text-base text-tertiary-500">暂无报警信息</Text>
    </View>
  );

  const ListFooterComponent = () => (
    <View className="py-4 items-center">
      {alarms.length > 0 ? (
        <Text className="text-sm text-tertiary-500">
          暂无更多报警信息
        </Text>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-background-50">
      <View className="flex-row justify-between items-center p-4 bg-background-100 border-b border-tertiary-100">
        <Text className="text-lg font-bold text-info-500">未读信息</Text>
        <View className="flex-row gap-3">
          {alarms.length > 0 && (
            <>
              <TouchableOpacity
                className="px-2 py-1"
                onPress={toggleSelectAll}
              >
                <Text className="text-sm text-info-500">
                  {selectedAlarms.size === alarms.length ? '取消全选' : '全选'}
                </Text>
              </TouchableOpacity>
              {selectedAlarms.size > 0 && (
                <TouchableOpacity
                  className="px-2 py-1"
                  onPress={handleMarkAsRead}
                >
                  <Text className="text-sm text-success-500">已读</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      <FlatList
        data={alarms}
        renderItem={renderAlarm}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
          flexGrow: alarms.length === 0 ? 1 : 0
        }}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AlarmList;