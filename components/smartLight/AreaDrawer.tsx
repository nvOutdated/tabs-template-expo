import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { useSmartLightStore } from "@/store/smartLightStore";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const DRAWER_WIDTH = width * 0.8;

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

export type Area = {
  area_id: number;
  name: string;
  children?: Area[];
};

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

type AreaDrawerProps = {
  visible: boolean;
  onClose: () => void;
  areas: Area[];
  selectedArea: Area;
  onSelectArea: (area: Area) => void;
  onSelectDevice: (device: Device) => void;
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
  onSelect: (device: Device) => void;
}) => {
  const currentTheme = useCurrentTheme();
  // 获取设备状态
  const deviceStatus = Object.values(DEVICE_STATUS).find(
    status => status.condition(device.device_info)
  ) || DEVICE_STATUS.OFFLINE;
  
  const handlePress = useCallback(() => {
    onSelect(device);
  }, [device, onSelect]);

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
  hasChildren,
  onToggle,
  onSelect,
  themeColor
}: { 
  area: Area; 
  level: number; 
  isExpanded: boolean; 
  isSelected: boolean; 
  hasChildren: boolean;
  onToggle: (id: number) => void;
  onSelect: (area: Area) => void;
  themeColor: string;
}) => {
  const handleToggle = useCallback((e: any) => {
    e.stopPropagation();
    onToggle(area.area_id);
  }, [area.area_id, onToggle]);

  const handleSelect = useCallback(() => {
    onSelect(area);
  }, [area, onSelect]);

  return (
    <TouchableOpacity
      style={[
        styles.areaItem,
        { paddingLeft: 10 + level * 20 },
        isSelected && styles.selectedAreaItem,
      ]}
      onPress={handleSelect}
      activeOpacity={0.7}
    >
      <View style={styles.areaContent}>
        <Text
          style={[
            styles.areaName,
            { color: themeColor },
            isSelected && styles.selectedText,
          ]}
        >
          {area.name}
        </Text>
        {hasChildren && (
          <TouchableOpacity 
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={themeColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

AreaItem.displayName = 'AreaItem';

export default function AreaDrawer({
  visible,
  onClose,
  areas,
  selectedArea,
  onSelectArea,
  onSelectDevice,
}: AreaDrawerProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const { allSmartLights } = useSmartLightStore();
  const [expandedAreas, setExpandedAreas] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);
  
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const opacity = useSharedValue(0);

  // 初始化时展开所有区域
  useEffect(() => {
    const expandAllAreas = (areas: Area[]) => {
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

  const handleAreaSelect = useCallback((area: Area) => {
    // 选中区域时，清除设备选中状态
    setSelectedDeviceId(null);
    onSelectArea(area);
  }, [onSelectArea]);

  const handleDeviceSelect = useCallback((device: Device) => {
    // 选中设备时，清除区域选中状态
    setSelectedDeviceId(device.id);
    onSelectDevice(device);
  }, [onSelectDevice]);

  // 将区域和设备数据扁平化为列表项，并添加搜索过滤
  const listData = useMemo(() => {
    const flattenData = (area: Area, level: number = 0) => {
      const items = [];
      const isExpanded = expandedAreas.has(area.area_id);
      const devices = allSmartLights.filter(device => device.area_id === area.area_id);
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
  }, [areas, expandedAreas, allSmartLights, searchText]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'area') {
      const isSelected = selectedArea && selectedArea.area_id === item.data.area_id;
      return (
        <AreaItem
          area={item.data}
          level={item.level}
          isExpanded={item.isExpanded}
          isSelected={isSelected}
          hasChildren={item.hasChildren}
          onToggle={toggleArea}
          onSelect={handleAreaSelect}
          themeColor={currentTheme.activeTint}
        />
      );
    } else {
      const isDeviceSelected = selectedDeviceId === item.data.id;
      return (
        <DeviceItem
          device={item.data}
          level={item.level}
          isSelected={isDeviceSelected}
          onSelect={handleDeviceSelect}
        />
      );
    }
  }, [selectedArea, selectedDeviceId, currentTheme.activeTint, toggleArea, handleAreaSelect, handleDeviceSelect]);

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

  if (!visible) return null;

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
            height: height - insets.top - insets.bottom,
            width: DRAWER_WIDTH,
          },
          drawerStyle,
        ]}
        className="bg-secondary-300"
      >
        <View style={styles.header}>
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
    paddingBottom: 100,
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
  deviceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaName: {
    fontSize: 14,
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    flex: 1,
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
  selectedText: {
    fontWeight: "600",
  },
  selectedItem: {
    backgroundColor: "rgba(64,158,255,0.1)",
  },
  selectedAreaItem: {
    backgroundColor: "rgba(64,158,255,0.1)",
    borderRadius: 4,
  },
});
