import { lightPole_query_list, query_eleBox_line } from "@/api/street/singleLampApi";
import DeviceSelector from "@/components/singleLamp/DeviceSelector";
import LineSelector from "@/components/singleLamp/LineSelector";
import SingleLampDrawer, { Area, Device } from "@/components/singleLamp/SingleLampDrawer";
import SingleLampList from "@/components/singleLamp/SingleLampList";
import { useAreaStore } from "@/store/areaStore";
import { ElectricItem, useEboxStore } from "@/store/eboxStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Line {
  id: number;
  name: string;
}

export default function SingleLampScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [selectedDevice, setSelectedDevice] = useState<ElectricItem | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [singleLamps, setSingleLamps] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const loadingRef = useRef(false);
  const insets = useSafeAreaInsets();

  const { areaList } = useAreaStore();
  const { allEboxes } = useEboxStore();

  // 初始化时选择第一个可用的集中器
  useEffect(() => {
    if (allEboxes.length > 0 && !selectedDevice) {
      const firstDevice = allEboxes[0];
      setSelectedDevice(firstDevice);
      setSearchText(firstDevice.name);
      loadLines(firstDevice.device_info.id);
    }
  }, [allEboxes]);

  const loadLines = useCallback(async (deviceId: number) => {
    try {
      setLoading(true);
      const res = await query_eleBox_line({ ebox_id: deviceId });
      if (res.code === 200) {
        const lineList = res.data || [];
        setLines(lineList);
        if (lineList.length > 0) {
          setSelectedLine(lineList[0]);
          loadSingleLamps(deviceId, lineList[0].id);
        } else {
          setSingleLamps([]);
          setSelectedLine(null);
        }
      }
    } catch (error) {
      console.log('加载线路列表失败:', error);
      setLines([]);
      setSelectedLine(null);
      setSingleLamps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSingleLamps = useCallback(async (deviceId: number, lineId: number) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        deviceId,
        lineId,
      };
      const res = await lightPole_query_list(params);
      if (res.code === 200) {
        const lampList = res.data || [];
        console.log(lampList,99999);
        
        setSingleLamps(lampList);
      }
    } catch (error) {
      console.log('加载单灯列表失败:', error);
      setSingleLamps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedDevice && selectedLine) {
      loadSingleLamps(selectedDevice.device_info.id, selectedLine.id);
    }
  }, [selectedDevice, selectedLine, loadSingleLamps]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // TODO: Implement search functionality for single lamps
  }, []);

  const handleEdit = useCallback(() => {
    // TODO: Implement edit functionality
    console.log('Edit button pressed');
  }, []);

  const handleSelectArea = useCallback((area: Area) => {
    setSelectedArea(area);
    setSearchText("");
    setShowDrawer(false);
  }, []);

  const handleSelectDevice = useCallback((device: Device) => {
    const eboxDevice = allEboxes.find(ebox => ebox.id === device.id);
    if (eboxDevice) {
      setSelectedDevice(eboxDevice);
      setSearchText(device.name);
      setShowDrawer(false);
      loadLines(eboxDevice.device_info.id);
    }
  }, [loadLines, allEboxes]);

  const handleSelectLine = useCallback((line: Line) => {
    setSelectedLine(line);
    if (selectedDevice) {
      loadSingleLamps(selectedDevice.device_info.id, line.id);
    }
  }, [selectedDevice, loadSingleLamps]);

  const renderEmptyState = () => {
    if (!selectedDevice) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500">请先选择一个集中器</Text>
        </View>
      );
    }
    if (lines.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500">该集中器下暂无线路数据</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-gray-500">暂无单灯数据</Text>
      </View>
    );
  };
 /*  const ListFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        {loading && singleLamps.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#409eff" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : electricBoxes.length === 0 ? (
          <Text style={styles.footerText}>暂无数据</Text>
        ) : !hasMore ? (
          <Text style={styles.footerText}>没有更多数据了</Text>
        ) : null}
      </View>
    ),
    [loading, electricBoxes.length, hasMore]
  ); */
  
  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        <DeviceSelector
          selectedDevice={selectedDevice}
          onSelectDevice={() => setShowDrawer(true)}
          onSearch={handleSearch}
          onEdit={handleEdit}
        />

        {selectedDevice && (
          <LineSelector
            lines={lines}
            selectedLine={selectedLine}
            onSelectLine={handleSelectLine}
          />
        )}

        <SingleLampList
          singleLamps={singleLamps}
          loading={loading}
          hasMore={false}
          onEndReached={() => {}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={renderEmptyState()}
        //   ListFooterComponent={ListFooterComponent}
        />
      </View>
     
      <SingleLampDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        areas={areaList}
        selectedDevice={selectedDevice}
        onSelectDevice={handleSelectDevice}
      />
    
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});