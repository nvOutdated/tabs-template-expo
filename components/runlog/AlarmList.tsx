import { useRunLogStore } from '@/store/runlogStore';
import { AlarmMessage } from '@/types/runlog';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        style={styles.alarmItem}
        className="bg-background-50"
        onPress={() => toggleSelect(item.id)}
      >
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleSelect(item.id)}
        >
          <Ionicons 
            name={selectedAlarms.has(item.id) ? "checkbox" : "square-outline"} 
            size={24} 
            color={selectedAlarms.has(item.id) ? "#409eff" : "#909399"}
          />
        </TouchableOpacity>
        <View style={[styles.typeIndicator, styles[item.type]]} />
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} className="text-error-500" numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.module} className="bg-tertiary-100 text-tertiary-900">
              {item.module}
            </Text>
          </View>
          <Text style={styles.content} className="text-tertiary-900" numberOfLines={2}>
            {item.content}
          </Text>
          <Text style={styles.timestamp} className="text-tertiary-500">
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={48} color="#909399" />
      <Text style={styles.emptyText} className="text-tertiary-500">暂无报警信息</Text>
    </View>
  );

  const ListFooterComponent = () => (
    <View style={styles.footer}>
      {alarms.length > 0 ? (
        <Text style={styles.footerText} className="text-tertiary-500">
          暂无更多报警信息
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container} className="bg-background-50">
      <View style={styles.header} className="bg-background-100 border-b border-tertiary-100">
        <Text style={styles.headerTitle} className="text-info-500">未读信息</Text>
        <View style={styles.headerButtons}>
          {alarms.length > 0 && (
            <>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={toggleSelectAll}
              >
                <Text style={styles.selectButton} className="text-info-500">
                  {selectedAlarms.size === alarms.length ? '取消全选' : '全选'}
                </Text>
              </TouchableOpacity>
              {selectedAlarms.size > 0 && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleMarkAsRead}
                >
                  <Text style={styles.clearButton} className="text-success-500">已读</Text>
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
        contentContainerStyle={[
          styles.list,
          alarms.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectButton: {
    fontSize: 14,
  },
  clearButton: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  alarmItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkbox: {
    marginRight: 8,
    padding: 4,
  },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  alarm: {
    backgroundColor: '#F56C6C',
  },
  warning: {
    backgroundColor: '#E6A23C',
  },
  info: {
    backgroundColor: '#409EFF',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  module: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default AlarmList;