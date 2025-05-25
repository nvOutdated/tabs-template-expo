import { get_area_list } from "@/api/area/areaApi";
import { getEboxListApi } from "@/api/street/configuration";
import AreaDrawer, { Area, Device } from "@/components/ebox/AreaDrawer";
import DeviceDrawer, { AreaWithDevices } from "@/components/ebox/DeviceDrawer";
import EboxList from "@/components/ebox/EboxList";
import EboxOperationList from "@/components/ebox/EboxOperationList";
import NormalHeader from "@/components/ebox/NormalHeader";
import OperationHeader from "@/components/ebox/OperationHeader";
import { ElectricItem, useEboxStore } from "@/store/eboxStore";
import { listToTree } from "@/utils/treeUtils";
import { getUserInfo } from "@/utils/useStorageState";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = Dimensions.get('window');

export default function EboxScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [areaWithDevicesList, setAreaWithDevicesList] = useState<AreaWithDevices[]>([]);
  const [userInfo, setUserInfo] = useState<string>("");
  const [isOperationMode, setIsOperationMode] = useState(false);
  const [operations, setOperations] = useState<any[]>([]);
  const [electricBoxes, setElectricBoxes] = useState<ElectricItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const loadingRef = useRef(false);
  const endReachedRef = useRef(false);

  const {
    initializeEboxTree,
    selectedDevices,
    setSelectedDevices,
    toggleDeviceSelection,
  } = useEboxStore();

  const fetchAreaList = async() => {
    try {
      const res = await get_area_list()
      if(res.code === 200){
        const treeList = listToTree(res.data,'pid','area_id')
        setAreaList(treeList)
        setAreaWithDevicesList(treeList)
      }
    } catch (error) {
      console.log('获取区域列表失败:', error);
    }
  }

  const loadEleBoxList = useCallback(async(page: number, isRefresh: boolean = false) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        page_size: pageSize,
        current: page,
        area_id: selectedArea.area_id || null,
        name: searchText || null
      };
      const res = await getEboxListApi(params);
      if(res.code === 200) {
        const formattedEleBoxList = res.data || [];
        setElectricBoxes(prev => {
          if(isRefresh) return formattedEleBoxList;
          const existingIds = new Set(prev.map(eleBox => eleBox.id));
          const uniqueNewEleBoxes = formattedEleBoxList.filter(
            (eleBox: any) => !existingIds.has(eleBox.id)
          );
          return [...prev, ...uniqueNewEleBoxes];
        });
        
        const hasMoreData = formattedEleBoxList.length >= pageSize;
        setHasMore(hasMoreData);
        endReachedRef.current = !hasMoreData;
        setCurrentPage(page);
      }
    } catch (error) {
      console.log('加载电箱列表失败:', error);
      if (isRefresh) {
        setElectricBoxes([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [selectedArea.area_id, searchText, pageSize]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // 重置所有相关状态
    setSelectedArea({} as Area);
    setSearchText("");
    setCurrentPage(1);
    setHasMore(true);
    endReachedRef.current = false;
    loadEleBoxList(1, true);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  // 初始加载
  useEffect(() => {
    fetchAreaList();
    initializeEboxTree();
    setCurrentPage(1);
    loadEleBoxList(1, true);
  }, []);

  // 监听搜索和区域变化
  useEffect(() => {
    if (currentPage === 0) return;
    setCurrentPage(1);
    loadEleBoxList(1, true);
  }, [searchText, selectedArea.area_id]);

  const onEndReached = useCallback(() => {
    if (!refreshing && hasMore && !loading && !endReachedRef.current) {
      loadEleBoxList(currentPage + 1);
    }
  }, [hasMore, refreshing, loading, currentPage, loadEleBoxList]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // 当搜索栏有内容时，清空已选择的区域
    if (text) {
      setSelectedArea({} as Area);
    }
  }, []);

  const handleSelectArea = useCallback((area: Area) => {
    setSelectedArea(area);
    setSearchText("");
    setShowDrawer(false);
  }, []);

  const handleSelectDevice = useCallback((device: Device) => {
    // 根据设备信息重新查询
    setSearchText(device.name);
    setSelectedArea({} as Area);
    setShowDrawer(false);
  }, []);

  const handleSetShowDrawer = useCallback(() => {
    if (isOperationMode) {
      setShowDeviceDrawer(true);
    } else {
      setShowDrawer(true);
    }
  }, [isOperationMode]);

  const handleToggleOperationMode = useCallback(() => {
    setIsOperationMode(prev => !prev);
    setSelectedDevices(new Set());
  }, [setSelectedDevices]);

  const handleOperationSelect = useCallback((operation: any) => {
    console.log('Selected operation:', operation);
  }, []);

  const handleDeviceSelect = useCallback((deviceId: number) => {
    toggleDeviceSelection(deviceId);
  }, [toggleDeviceSelection]);

  const handleAreaSelect = useCallback((areaId: number) => {
    const areaDevices = electricBoxes.filter(device => device.area_id === areaId);
    const allSelected = areaDevices.every(device => selectedDevices.has(device.id));
    
    const newSelectedDevices = new Set(selectedDevices);
    areaDevices.forEach(device => {
      if (allSelected) {
        newSelectedDevices.delete(device.id);
      } else {
        newSelectedDevices.add(device.id);
      }
    });
    
    setSelectedDevices(newSelectedDevices);
  }, [electricBoxes, selectedDevices, setSelectedDevices]);

  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        {isOperationMode ? (
          <OperationHeader
            handleSetShowDrawer={handleSetShowDrawer}
            onToggleOperationMode={handleToggleOperationMode}
            selectedDevicesCount={selectedDevices.size}
          />
        ) : (
          <NormalHeader
            onSearch={handleSearch}
            handleSetShowDrawer={handleSetShowDrawer}
            selectedArea={selectedArea}
            onToggleOperationMode={handleToggleOperationMode}
          />
        )}

        {isOperationMode ? (
          <EboxOperationList
            operations={operations}
            onOperationSelect={handleOperationSelect}
          />
        ) : (
          <EboxList
            electricBoxes={electricBoxes}
            userInfo={userInfo}
            loading={loading}
            hasMore={hasMore}
            onEndReached={onEndReached}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        )}
      </View>

      <AreaDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        areas={areaList}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
        onSelectDevice={handleSelectDevice}
      />

      <DeviceDrawer
        visible={showDeviceDrawer}
        onClose={() => setShowDeviceDrawer(false)}
        areas={areaWithDevicesList}
        selectedDevices={selectedDevices}
        onDeviceSelect={handleDeviceSelect}
        onAreaSelect={handleAreaSelect}
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
