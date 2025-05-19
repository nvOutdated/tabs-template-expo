import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
/* import DateTimePicker from '@react-native-community/datetimepicker'; */
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  {
    id: '5',
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
  {
    id: '2',
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
  {
    id: '3',
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
  {
    id: '4',
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

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

  return (
    <View style={styles.container} className="bg-background-50">
      <View  className="bg-background-100 py-2 px-6 border-b border-tertiary-100">
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
            >
              <Text style={styles.searchButtonText} className="text-white text-sm">查询</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <View key={`log-${log.id || index}`} style={styles.logCard} className="bg-background-50">
            <View style={styles.logCardContent}>
              <View style={styles.logCardHeader}>
                <View style={styles.logCardRow}>
                  <Text className="text-tertiary-900 font-bold text-sm">设备编号：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.deviceCode}</Text>
                </View>
                <View style={styles.logCardRow}>
                  <Text className="text-tertiary-900 font-bold text-sm">操作方式：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.mode}</Text>
                </View>
              </View>

              <View style={styles.logCardGrid}>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">三相电压：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.voltages}V</Text>
                </View>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">三相电流：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.currents}A</Text>
                </View>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">用电量：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.power}kW·h</Text>
                </View>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">设备温度：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.temperature}℃</Text>
                </View>
              </View>

              <View style={styles.logCardGrid}>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">开关灯时间：</Text>
                  <View>
                    <Text className="text-tertiary-900 text-sm">开灯: {log.powerOn}</Text>
                    <Text className="text-tertiary-900 text-sm">关灯: {log.powerOff}</Text>
                  </View>
                </View>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">开关量状态：</Text>
                  <Text className="text-tertiary-900 text-sm">{log.ios}</Text>
                </View>
              </View>

              <View style={styles.logCardGrid}>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">回路状态：</Text>
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
              </View>

              <View style={styles.logCardGrid}>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">操作时间：</Text>
                  <Text className="text-tertiary-900 text-sm">{formatDate(log.optTime)}</Text>
                </View>
              </View>
              <View style={styles.logCardGrid}>
                <View style={styles.logCardGridItem}>
                  <Text className="text-tertiary-900 font-bold text-sm">创建时间：</Text>
                  <Text className="text-tertiary-900 text-sm">{formatDate(log.createTime)}</Text>
                </View>
              </View>

            </View>
          </View>
        ))}
      </ScrollView>

    {/*   {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="datetime"
          onChange={(event, date) => handleTimeChange(event, date, 'start')}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="datetime"
          onChange={(event, date) => handleTimeChange(event, date, 'end')}
        />
      )} */}

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
    flex: 1,
    padding: 8,
  },
  logCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logCardContent: {
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
});

export default LampRunLog;
