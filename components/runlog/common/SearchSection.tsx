import { transferDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { memo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Container {
  id: string;
  device_code: string;
  name: string;
  searchName: string;
  deviceId: number;
}

interface SearchSectionProps {
  isSearchExpanded: boolean;
  setIsSearchExpanded: (value: boolean) => void;
  selectedDevice: number | null;
  setSelectedDevice: (value: number | null) => void;
  startTime: Date | null;
  endTime: Date | null;
  setStartTime: (date: Date | null) => void;
  setEndTime: (date: Date | null) => void;
//   onSearch: () => void;
  containerList: Container[];
  additionalSearchContent?: React.ReactNode;
}

const SearchSection = memo(({
  isSearchExpanded,
  setIsSearchExpanded,
  setSelectedDevice,
  setStartTime,
  setEndTime,
//   onSearch,
  containerList,
  additionalSearchContent
}: SearchSectionProps) => {
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Container[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempStartTime, setTempStartTime] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempEndTime, setTempEndTime] = useState<Date>(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  });

  const handleSearchInput = (text: string) => {
    setSearchText(text);
    if(text.length > 0) {
      const filtered = containerList.filter(item =>
        item.searchName && item.searchName.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 10);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSelectedDevice(null);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
    setSelectedDevice(null);
  };

  const handleSelectResult = (item: Container) => {
    setSearchText(item.device_code);
    setShowSearchResults(false);
    setSelectedDevice(item.deviceId);
  };

  const handleStartDateChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'set' && selectedDate) {
      setTempStartDate(selectedDate);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(tempStartTime.getHours());
      startDateTime.setMinutes(tempStartTime.getMinutes());
      startDateTime.setSeconds(tempStartTime.getSeconds());
      setStartTime(startDateTime);
    }
    setShowStartDatePicker(false);
  };

  const handleStartTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (event.type === 'set' && selectedTime) {
      setTempStartTime(selectedTime);
      if (tempStartDate) {
        const startDateTime = new Date(tempStartDate);
        startDateTime.setHours(selectedTime.getHours());
        startDateTime.setMinutes(selectedTime.getMinutes());
        startDateTime.setSeconds(selectedTime.getSeconds());
        setStartTime(startDateTime);
      }
    }
    setShowStartTimePicker(false);
  };

  const handleEndDateChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'set' && selectedDate) {
      setTempEndDate(selectedDate);
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(tempEndTime.getHours());
      endDateTime.setMinutes(tempEndTime.getMinutes());
      endDateTime.setSeconds(tempEndTime.getSeconds());
      setEndTime(endDateTime);
    }
    setShowEndDatePicker(false);
  };

  const handleEndTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (event.type === 'set' && selectedTime) {
      setTempEndTime(selectedTime);
      if (tempEndDate) {
        const endDateTime = new Date(tempEndDate);
        endDateTime.setHours(selectedTime.getHours());
        endDateTime.setMinutes(selectedTime.getMinutes());
        endDateTime.setSeconds(selectedTime.getSeconds());
        setEndTime(endDateTime);
      }
    }
    setShowEndTimePicker(false);
  };

  const clearStartTime = () => {
    setTempStartDate(null);
    setTempStartTime(() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    });
    setStartTime(null);
  };

  const clearEndTime = () => {
    setTempEndDate(null);
    setTempEndTime(() => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return now;
    });
    setEndTime(null);
  };

//   const handleSearch = () => {
//     onSearch();
//   };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <View className="bg-background-100 py-3 px-4 border-b border-tertiary-100">
      <View className="flex-row justify-between items-center">
        <View style={styles.searchItem}>
          <Text className="text-tertiary-900 text-sm">设备编号：</Text>
          <View style={[styles.searchInput, { minWidth: 200 }]} className="bg-background-50 border border-tertiary-200">
            <TextInput
              style={{ flex: 1 }}
              className="h-8 text-left py-1 align-middle text-typography-900"
              placeholder="搜索设备..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearchInput}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                className="p-1"
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {showSearchResults && searchResults.length > 0 && (
            <View className="absolute top-12 left-10 right-0 bg-white rounded-lg shadow-lg z-20">
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-2 border-b border-gray-100"
                    onPress={() => handleSelectResult(item)}
                  >
                    <Text className="text-typography-900">{item.searchName}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsSearchExpanded(!isSearchExpanded)}
          className="flex-row items-center"
        >
          <Text className="text-tertiary-900 mr-2 text-sm">时间范围</Text>
          <Ionicons
            name={isSearchExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {isSearchExpanded && (
        <View style={styles.searchContent}>
          <View style={styles.timeRow}>
            <Text className="text-tertiary-900 text-sm">开始时间：</Text>
            <View style={styles.timeInputGroup}>
              <TouchableOpacity
                style={styles.timeInput}
                className="bg-background-50 border border-tertiary-200"
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text className="text-tertiary-900 text-sm">
                  {tempStartDate ? transferDate(tempStartDate.getTime()) : '选择日期'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeInput}
                className="bg-background-50 border border-tertiary-200"
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text className="text-tertiary-900 text-sm">
                  {formatTime(tempStartTime)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearStartTime}
                className="p-2"
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text className="text-tertiary-900 text-sm">结束时间：</Text>
            <View style={styles.timeInputGroup}>
              <TouchableOpacity
                style={styles.timeInput}
                className="bg-background-50 border border-tertiary-200"
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text className="text-tertiary-900 text-sm">
                  {tempEndDate ? transferDate(tempEndDate.getTime()) : '选择日期'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeInput}
                className="bg-background-50 border border-tertiary-200"
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text className="text-tertiary-900 text-sm">
                  {formatTime(tempEndTime)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearEndTime}
                className="p-2"
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {additionalSearchContent}

        {/*   <TouchableOpacity
            style={styles.searchButton}
            className="bg-info-500 w-full text-center px-auto"
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText} className="text-white text-sm">查询</Text>
          </TouchableOpacity> */}

          {showStartDatePicker && (
            <DateTimePicker
              value={tempStartDate || new Date()}
              mode="date"
              onChange={handleStartDateChange}
            />
          )}

          {showStartTimePicker && (
            <DateTimePicker
              value={tempStartTime || new Date()}
              mode="time"
              is24Hour={true}
              onChange={handleStartTimeChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={tempEndDate || new Date()}
              mode="date"
              onChange={handleEndDateChange}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={tempEndTime || new Date()}
              mode="time"
              is24Hour={true}
              onChange={handleEndTimeChange}
            />
          )}
        </View>
      )}
    </View>
  );
});

SearchSection.displayName = "SearchSection";

const styles = StyleSheet.create({
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 120,
  },
  expandButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  searchContent: {
    marginTop: 8,
    gap: 12,
    paddingLeft: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginLeft: 0,
  },
  timeInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 100,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SearchSection; 