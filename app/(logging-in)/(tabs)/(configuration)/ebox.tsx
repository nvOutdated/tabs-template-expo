import { get_area_list } from "@/api/area/areaApi";
import { getEboxListApi } from "@/api/street/configuration";
import AreaDrawer, { Area } from "@/components/ebox/AreaDrawer";
import AreaHeader from "@/components/ebox/AreaHeader";
import DeviceDrawer, { AreaWithDevices, Device } from "@/components/ebox/DeviceDrawer";
import EboxList from "@/components/ebox/EboxList";
import EboxOperationList from "@/components/ebox/EboxOperationList";
import { listToTree } from "@/utils/treeUtils";
import { getUserInfo } from "@/utils/useStorageState";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = Dimensions.get('window');
const PAGE_SIZE = 20;

export default function EboxScreen() {
  const [electricBoxes, setElectricBoxes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [areaWithDevicesList, setAreaWithDevicesList] = useState<AreaWithDevices[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userInfo, setUserInfo] = useState<string>("");
  const [isOperationMode, setIsOperationMode] = useState(false);
  const [operations, setOperations] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<number>>(new Set());

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const endReachedRef = useRef(false);
  
  const fetchAreaList = async() => {
    try {
      const res = await get_area_list()
      if(res.code === 200){
        const treeList = listToTree(res.data,'pid','area_id')
        setAreaList(treeList)
        // 同时设置带设备的区域列表
        setAreaWithDevicesList(treeList)
      }
    } catch (error) {
      console.log('获取区域列表失败:', error);
    }
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  const loadEleBoxList = useCallback(async(page: number, isRefresh: boolean = false) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        page_size: PAGE_SIZE,
        current: page,
        area_id: selectedArea.area_id || null,
        name: searchText || null
      };
      
      const res = await getEboxListApi(params);
      if(res.code === 200 && res.data) {
        const formattedEleBoxList = res.data;
        
        setElectricBoxes(prev => {
          if(isRefresh) return formattedEleBoxList;
          const existingIds = new Set(prev.map(eleBox => eleBox.id));
          const uniqueNewEleBoxes = formattedEleBoxList.filter(
            (eleBox: any) => !existingIds.has(eleBox.id)
          );
          return [...prev, ...uniqueNewEleBoxes];
        });

        const hasMoreData = formattedEleBoxList.length >= PAGE_SIZE;
        setHasMore(hasMoreData);
        endReachedRef.current = !hasMoreData;
      }
    } catch (error) {
      console.log('加载电箱列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [selectedArea.area_id, searchText]);

  // 监听区域变化
  useEffect(() => {
    setCurrentPage(1);
    endReachedRef.current = false;
    loadEleBoxList(1, true);
  }, [loadEleBoxList, selectedArea]);

  // 监听搜索文本变化（带防抖）
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      endReachedRef.current = false;
      loadEleBoxList(1, true);
    }, 100);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchText]);

  // 初始加载
  useEffect(() => {
    fetchAreaList();
    loadEleBoxList(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setSelectedArea({} as Area);
    setSearchText("");
    endReachedRef.current = false;
    loadEleBoxList(1, true);
  }, [loadEleBoxList]);

  const onEndReached = useCallback(() => {
    if (!refreshing && hasMore && !loadingRef.current && !endReachedRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadEleBoxList(nextPage);
    }
  }, [currentPage, hasMore, refreshing, loadEleBoxList]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSelectArea = useCallback((area: Area) => {
    setSelectedArea(area);
    setShowDrawer(false);
  }, []);

  const handleSetShowDrawer = useCallback(() => {
    if (isOperationMode) {
      setShowDeviceDrawer(true);
    } else {
      setShowDrawer(true);
    }
  }, [isOperationMode]);

  const handleEboxUpdate = useCallback((updatedEbox: any) => {
    setElectricBoxes(prev => 
      prev.map(ebox => 
        ebox.id === updatedEbox.id ? updatedEbox : ebox
      )
    );
  }, []);

  const handleToggleOperationMode = useCallback(() => {
    setIsOperationMode(prev => !prev);
    // 切换模式时清空选中的设备
    setSelectedDevices(new Set());
  }, []);

  const handleOperationSelect = useCallback((operation: any) => {
    // 处理操作选择
    console.log('Selected operation:', operation);
  }, []);

  const handleDeviceSelect = useCallback((deviceId: number) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  }, []);

  const handleAreaSelect = useCallback((areaId: number) => {
    // 获取该区域下的所有设备
    const getAreaDevices = async () => {
      try {
        const res = await getEboxListApi({ area_id: areaId });
        if (res.code === 200 && res.data) {
          const devices = res.data;
          setSelectedDevices(prev => {
            const newSet = new Set(prev);
            const allSelected = devices.every((device: Device) => prev.has(device.id));
            
            devices.forEach((device: Device) => {
              if (allSelected) {
                newSet.delete(device.id);
              } else {
                newSet.add(device.id);
              }
            });
            
            return newSet;
          });
        }
      } catch (error) {
        console.log('获取区域设备失败:', error);
      }
    };
    
    getAreaDevices();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        <AreaHeader 
          onSearch={handleSearch} 
          handleSetShowDrawer={handleSetShowDrawer}
          selectedArea={selectedArea}
          isOperationMode={isOperationMode}
          onToggleOperationMode={handleToggleOperationMode}
        />
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
            onEboxUpdate={handleEboxUpdate}
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
