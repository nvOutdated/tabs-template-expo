import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { ElectricItem, useEboxStore } from "@/store/eboxStore";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.85;

export type Device = {
  id: number;
  sn: string;
  name: string;
  area_id: number;
  device_info: {
    device_code: string;
    online: boolean;
    open: boolean;
    warn: boolean;
    loops: boolean[];
    id:number;
  };
};

export type AreaWithDevices = {
  area_id: number;
  name: string;
  children?: AreaWithDevices[];
  devices?: Device[];
};

// 添加状态配置常量
const DEVICE_STATUS = {
  OFFLINE: {
    condition: (info: Device['device_info']) => !info.online && !info.open && !info.warn,
    label: '离线',
    dotStyle: 'offline',
    textStyle: 'offlineText'
  },
  ONLINE: {
    condition: (info: Device['device_info']) => info.online && !info.open && !info.warn,
    label: '在线',
    dotStyle: 'online',
    textStyle: 'onlineText'
  },
  OPEN: {
    condition: (info: Device['device_info']) => info.online && info.open && !info.warn,
    label: '打开',
    dotStyle: 'open',
    textStyle: 'openText'
  },
  WARN: {
    condition: (info: Device['device_info']) => info.online && info.warn,
    label: '报警',
    dotStyle: 'warn',
    textStyle: 'warnText'
  }
} as const;

type DeviceDrawerProps = {
  visible: boolean;
  onClose: () => void;
  areas: AreaWithDevices[];
  selectedDevices: Map<number, ElectricItem>;
  onDeviceSelect: (deviceId: number) => void;
  onAreaSelect: (areaId: number) => void;
};

// 设备项组件
const DeviceItem = memo(({ 
  device, 
  level, 
  isSelected, 
  onSelect 
}: { 
  device: Device; 
  level: number; 
  isSelected: boolean; 
  onSelect: (id: number) => void;
}) => {
  // 获取设备状态
  const deviceStatus = Object.values(DEVICE_STATUS).find(
    status => status.condition(device.device_info)
  ) || DEVICE_STATUS.OFFLINE;

  const handlePress = useCallback(() => {
    onSelect(device.id);
  }, [device.id, onSelect]);

  return (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        { paddingLeft: 10 + (level + 1) * 20 },
        isSelected && styles.selectedItem,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"}
          size={20}
          color={isSelected ? "#409eff" : "#909399"}
        />
      </View>
      <View style={styles.deviceContent}>
        <Text
          style={[
            styles.deviceName,
            { color: "#666666" },
            isSelected && { color: "#409eff" },
          ]}
        >
          {device.name} ({device.sn})
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, styles[deviceStatus.dotStyle]]} />
          <Text style={[styles.statusText, styles[deviceStatus.textStyle]]}>
            {deviceStatus.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

DeviceItem.displayName = 'DeviceItem';

// 区域项组件
const AreaItem = memo(({ 
  area, 
  level, 
  isExpanded, 
  isSelected, 
  isPartiallySelected, 
  hasChildren,
  onToggle,
  onSelect,
  themeColor
}: { 
  area: AreaWithDevices; 
  level: number; 
  isExpanded: boolean; 
  isSelected: boolean; 
  isPartiallySelected: boolean;
  hasChildren: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
  themeColor: string;
}) => {
  const handleToggle = useCallback((e: any) => {
    e.stopPropagation();
    onToggle(area.area_id);
  }, [area.area_id, onToggle]);

  const handleSelect = useCallback(() => {
    onSelect(area.area_id);
  }, [area.area_id, onSelect]);

  return (
    <View
      style={[
        styles.areaItem,
        { paddingLeft: 10 + level * 20 },
      ]}
    >
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={handleSelect}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={
            isSelected ? "checkbox" :
            isPartiallySelected ? "square" : "square-outline"
          }
          size={20}
          color={isSelected ? "#409eff" : "#909399"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.areaContent}
        onPress={handleSelect}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.areaName,
            { color: themeColor },
          ]}
        >
          {area.name}
        </Text>
        {hasChildren && (
          <TouchableOpacity
            onPress={handleToggle}
            activeOpacity={0.7}
            style={styles.expandButton}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={themeColor}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
});

AreaItem.displayName = 'AreaItem';

export default function DeviceDrawer({
  visible,
  onClose,
  areas,
  selectedDevices,
  onDeviceSelect,
  onAreaSelect,
}: DeviceDrawerProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const [expandedAreas, setExpandedAreas] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const { allEboxes } = useEboxStore();
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const opacity = useSharedValue(0);

  // 初始化时展开所有区域
  useEffect(() => {
    const expandAllAreas = (areas: AreaWithDevices[]) => {
      areas.forEach(area => {
        setExpandedAreas(prev => new Set(prev).add(area.area_id));
        if (area.children) {
          expandAllAreas(area.children);
        }
      });
    };
    expandAllAreas(areas);
  }, [areas]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      // 恢复滚动位置
      if (scrollPositionRef.current > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: scrollPositionRef.current,
            animated: false,
          });
        }, 100);
      }
    } else {
      opacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.ease),
      });
      translateX.value = withTiming(-DRAWER_WIDTH, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: `rgba(0, 0, 0, ${opacity.value * 0.5})`,
  }));

  const toggleArea = useCallback((areaId: number) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
      }
      return newSet;
    });
  }, []);

  // 递归查找指定区域ID的区域对象（在任何层级）
  const findAreaById = useCallback((areaId: number, areasToSearch: AreaWithDevices[] = areas): AreaWithDevices | null => {
    for (const area of areasToSearch) {
      if (area.area_id === areaId) {
        return area;
      }
      if (area.children) {
        const found = findAreaById(areaId, area.children);
        if (found) return found;
      }
    }
    return null;
  }, [areas]);

  // 获取区域下所有设备ID（包括子区域的设备）
  const getAreaDeviceIds = useCallback((area: AreaWithDevices): number[] => {
    const deviceIds: number[] = [];
    
    // 获取当前区域的设备
    const currentAreaDevices = allEboxes.filter(device => device.area_id === area.area_id);
    deviceIds.push(...currentAreaDevices.map(device => device.id));
    
    // 递归获取子区域的设备
    if (area.children) {
      area.children.forEach(child => {
        deviceIds.push(...getAreaDeviceIds(child));
      });
    }
    
    return deviceIds;
  }, [allEboxes]);

  // 处理区域选择
  const handleAreaSelect = useCallback((areaId: number) => {
    // 使用递归查找函数查找区域
    const area = findAreaById(areaId);
    if (!area) {
      // console.warn(`Area with id ${areaId} not found`);
      return;
    }

    const deviceIds = getAreaDeviceIds(area);
    
    if (deviceIds.length === 0) {
      // console.warn(`No devices found for area ${areaId}`);
      return;
    }

    // 检查当前区域是否已全部选中
    const isSelected = deviceIds.every(id => selectedDevices.has(id));

    if (isSelected) {
      // 如果已全选，则取消选择所有设备
      deviceIds.forEach(id => {
        if (selectedDevices.has(id)) {
          onDeviceSelect(id);
        }
      });
    } else {
      // 如果未全选，则选择所有未选中的设备
      deviceIds.forEach(id => {
        if (!selectedDevices.has(id)) {
          onDeviceSelect(id);
        }
      });
    }
  }, [findAreaById, getAreaDeviceIds, selectedDevices, onDeviceSelect]);

  const isAreaSelected = useCallback((area: AreaWithDevices) => {
    const deviceIds = getAreaDeviceIds(area);
    if (deviceIds.length === 0) return false;
    return deviceIds.every(id => selectedDevices.has(id));
  }, [getAreaDeviceIds, selectedDevices]);

  const isAreaPartiallySelected = useCallback((area: AreaWithDevices) => {
    const deviceIds = getAreaDeviceIds(area);
    if (deviceIds.length === 0) return false;
    const hasSelected = deviceIds.some(id => selectedDevices.has(id));
    const allSelected = deviceIds.every(id => selectedDevices.has(id));
    return hasSelected && !allSelected;
  }, [getAreaDeviceIds, selectedDevices]);

  // 将区域和设备数据扁平化为列表项，并添加搜索过滤
  const listData = useMemo(() => {
    const flattenData = (area: AreaWithDevices, level: number = 0) => {
      const items = [];
      const isExpanded = expandedAreas.has(area.area_id);
      const devices = allEboxes.filter(device => device.area_id === area.area_id);
      const hasChildren = (area.children && area.children.length > 0) || devices.length > 0;

      // 添加区域项
      items.push({
        type: 'area',
        data: area,
        level,
        isExpanded,
        hasChildren,
      });

      // 如果展开，添加设备项
      if (isExpanded) {
        // 根据搜索文本过滤设备
        const filteredDevices = searchText
          ? devices.filter(device => 
              device.name.toLowerCase().includes(searchText.toLowerCase()) ||
              device.sn.toLowerCase().includes(searchText.toLowerCase())
            )
          : devices;

        filteredDevices.forEach(device => {
          items.push({
            type: 'device',
            data: device,
            level,
          });
        });

        // 递归添加子区域
        if (area.children) {
          area.children.forEach(child => {
            items.push(...flattenData(child, level + 1));
          });
        }
      }

      return items;
    };

    return areas.flatMap(area => flattenData(area));
  }, [areas, expandedAreas, allEboxes, searchText]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'area') {
      return (
        <AreaItem
          area={item.data}
          level={item.level}
          isExpanded={item.isExpanded}
          isSelected={isAreaSelected(item.data)}
          isPartiallySelected={isAreaPartiallySelected(item.data)}
          hasChildren={item.hasChildren}
          onToggle={toggleArea}
          onSelect={handleAreaSelect}
          themeColor={currentTheme.activeTint}
        />
      );
    } else {
      return (
        <DeviceItem
          device={item.data}
          level={item.level}
          isSelected={selectedDevices.has(item.data.id)}
          onSelect={onDeviceSelect}
        />
      );
    }
  }, [isAreaSelected, isAreaPartiallySelected, selectedDevices, currentTheme.activeTint, toggleArea, handleAreaSelect, onDeviceSelect]);
  
  const keyExtractor = useCallback((item: any) => {
    if (item.type === 'area') {
      return `area-${item.data.area_id}`;
    } else {
      return `device-${item.data.id}-${item.data.sn}`;
    }
  }, []);

  const handleScroll = useCallback((event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  // 添加 getItemLayout 函数
  const getItemLayout = useCallback((data: any, index: number) => {
    const item = data[index];
    const height = item.type === 'area' ? 40 : 36; // 区域项和设备项的高度
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  return (
    <View style={[styles.overlay, { display: visible ? 'flex' : 'none' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            height: height,
            width: DRAWER_WIDTH,
            top: 0,
          },
          drawerStyle,
        ]}
        className="bg-secondary-300"
      >
        <View style={[styles.header]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={currentTheme.activeTint} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.activeTint }]}
              placeholder="搜索设备名称或编号"
              placeholderTextColor={currentTheme.inactiveTint}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={currentTheme.activeTint} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close"
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          getItemLayout={getItemLayout}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,       
  },
  drawer: {
    position: "absolute",
    left: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 36,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // 增加底部内边距，确保内容完全显示
  },
  areaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingRight: 12,
  },
  areaContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingRight: 12,
  },
  checkbox: {
    marginRight: 8,
    padding: 4,
  },
  areaName: {
    fontSize: 14,
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    flex: 1,
  },
  deviceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  online: {
    backgroundColor: "#52c41a",
  },
  offline: {
    backgroundColor: "#909399",
  },
  open: {
    backgroundColor: "#E6A23C",
  },
  warn: {
    backgroundColor: "#F56C6C",
  },
  onlineText: {
    color: "#52c41a",
  },
  offlineText: {
    color: "#909399",
  },
  openText: {
    color: "#E6A23C",
  },
  warnText: {
    color: "#F56C6C",
  },
  expandButton: {
    padding: 4,
    marginLeft: 8,
  },
  selectedItem: {
    backgroundColor: "rgba(64,158,255,0.1)",
  },
});