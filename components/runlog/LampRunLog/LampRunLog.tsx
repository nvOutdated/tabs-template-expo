import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 模拟数据
const mockDevices = [
  { id: '1', code: 'LD001' },
  { id: '2', code: 'LD002' },
  { id: '3', code: 'LD003' },
];

const mockLogs = [
  {
    id: '1',
    deviceCode: 'LD001',
    mode: '自动',
    voltages: '220/220/220',
    currents: '10/10/10',
    power: '2.2',
    temperature: '35',
    powerOn: '18:00',
    powerOff: '06:00',
    ios: '正常',
    loops: [true, true, false, true],
    optTime: Date.now(),
    dateTime: Date.now(),
    createTime: Date.now(),
  },
  // ... 可以添加更多模拟数据
];

const LampRunLog: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [logs, setLogs] = useState(mockLogs);

  return (
    <View style={styles.container} className="bg-background-50">
      <View style={styles.searchBar} className="bg-background-100 border-b border-tertiary-100">
        <View style={styles.searchItem}>
          <Text className="text-tertiary-900">设备编号：</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
          >
            <Text className="text-tertiary-900">
              {selectedDevice || '请选择设备'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchItem}>
          <Text className="text-tertiary-900">时间范围：</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
          >
            <Text className="text-tertiary-900">
              {startTime ? formatDate(startTime.getTime()) : '开始时间'}
            </Text>
          </TouchableOpacity>
          <Text className="text-tertiary-900 mx-2">至</Text>
          <TouchableOpacity 
            style={styles.searchInput}
            className="bg-background-50 border border-tertiary-200"
          >
            <Text className="text-tertiary-900">
              {endTime ? formatDate(endTime.getTime()) : '结束时间'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          className="bg-info-500"
        >
          <Text style={styles.searchButtonText} className="text-white">查询</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow} className="bg-background-100">
            <Text style={styles.headerCell} className="text-tertiary-900">设备编号</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">操作方式</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">三相电压(V)</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">电流值</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">用电量(kW·h)</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">设备温度(℃)</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">经纬度开关灯时间</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">开关量状态</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">回路状态</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">操作时间</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">设备时间</Text>
            <Text style={styles.headerCell} className="text-tertiary-900">创建时间</Text>
          </View>
          <ScrollView>
            {logs.map((log, index) => (
              <View key={`log-${log.id || index}`} style={styles.logItem} className="bg-background-50">
                <View style={styles.logRow}>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.deviceCode}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.mode}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.voltages}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.currents}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.power}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.temperature}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">开灯: {log.powerOn}</Text>
                    <Text className="text-tertiary-900">关灯: {log.powerOff}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{log.ios}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <View style={styles.loopsContainer}>
                      {log.loops.map((status, loopIndex) => (
                        <View
                          key={`${log.id || index}-loop-${loopIndex}`}
                          style={[
                            styles.loopBall,
                            status ? styles.loopActive : styles.loopInactive,
                          ]}
                        >
                          <Text style={styles.loopText}>{loopIndex + 1}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{formatDate(log.optTime)}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{formatDate(log.dateTime)}</Text>
                  </View>
                  <View style={styles.logCell}>
                    <Text className="text-tertiary-900">{formatDate(log.createTime)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 120,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  searchButtonText: {
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    width: 120,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  logCell: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  loopsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  loopBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopActive: {
    backgroundColor: '#409EFF',
  },
  loopInactive: {
    backgroundColor: '#909399',
  },
  loopText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default LampRunLog;
