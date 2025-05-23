import { getEboxListApi } from "@/api/street/configuration";
import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  selectedDevices: Set<number>;
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

  return (
    <View
      style={[
        styles.deviceItem,
        { paddingLeft: 10 + (level + 1) * 20 },
      ]}
    >
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => onSelect(device.id)}
      >
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"}
          size={20}
          color={isSelected ? "#409eff" : "#909399"}
        />
      </TouchableOpacity>
      <View style={styles.deviceContent}>
        <Text
          style={[
            styles.deviceName,
            { color: "#666666" },
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
    </View>
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
}) => (
  <View
    style={[
      styles.areaItem,
      { paddingLeft: 10 + level * 20 },
    ]}
  >
    <TouchableOpacity 
      style={styles.checkbox}
      onPress={() => onSelect(area.area_id)}
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
      onPress={() => onToggle(area.area_id)}
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
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={themeColor}
        />
      )}
    </TouchableOpacity>
  </View>
));

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
  const [areaDevices, setAreaDevices] = useState<Map<number, Device[]>>(new Map());
  const [searchText, setSearchText] = useState('');

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

  // 初始化时获取所有区域的设备
  useEffect(() => {
    const fetchAllAreaDevices = async (areas: AreaWithDevices[]) => {
      for (const area of areas) {
        await fetchAreaDevices(area.area_id);
        if (area.children) {
          await fetchAllAreaDevices(area.children);
        }
      }
    };
    if (visible) {
      fetchAllAreaDevices(areas);
    }
  }, [areas, visible]);

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

  const fetchAreaDevices = useCallback(async (areaId: number) => {
    try {
      const res = await getEboxListApi({ area_id: areaId });
      if (res.code === 200 && res.data) {
        setAreaDevices(prev => new Map(prev).set(areaId, res.data));
      }
    } catch (error) {
      console.log('获取区域设备失败:', error);
    }
  }, []);

  const toggleArea = useCallback((areaId: number)  => {
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

  const isAreaSelected = useCallback((area: AreaWithDevices) => {
    const devices = areaDevices.get(area.area_id) || [];
    if (devices.length === 0) return false;
    return devices.every(device => selectedDevices.has(device.id));
  }, [areaDevices, selectedDevices]);

  const isAreaPartiallySelected = useCallback((area: AreaWithDevices) => {
    const devices = areaDevices.get(area.area_id) || [];
    if (devices.length === 0) return false;
    const hasSelected = devices.some(device => selectedDevices.has(device.id));
    const allSelected = devices.every(device => selectedDevices.has(device.id));
    return hasSelected && !allSelected;
  }, [areaDevices, selectedDevices]);

  // 将区域和设备数据扁平化为列表项，并添加搜索过滤
  const listData = useMemo(() => {
    const flattenData = (area: AreaWithDevices, level: number = 0) => {
      const items = [];
      const isExpanded = expandedAreas.has(area.area_id);
      const devices = areaDevices.get(area.area_id) || [];
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
  }, [areas, expandedAreas, areaDevices, searchText]);

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
          onSelect={onAreaSelect}
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
  }, [isAreaSelected, isAreaPartiallySelected, selectedDevices, currentTheme.activeTint, toggleArea, onAreaSelect, onDeviceSelect]);
  
  const keyExtractor = useCallback((item: any) => {
    return item.type === 'area' ? `area-${item.data.area_id}` : `device-${item.data.id}`;
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
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
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          removeClippedSubviews={true}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
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
}); 