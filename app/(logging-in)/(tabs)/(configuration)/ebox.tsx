import { get_area_list } from "@/api/area/areaApi";
import { getEboxListApi } from "@/api/street/configuration";
import AreaDrawer, { Area } from "@/components/ebox/AreaDrawer";
import AreaHeader from "@/components/ebox/AreaHeader";
import EboxList from "@/components/ebox/EboxList";
import { listToTree } from "@/utils/treeUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const { width } = Dimensions.get('window');
const PAGE_SIZE = 20;
type AreaHeaderProps = {
  onSearch: (text: string) => void;
};
export default function EboxScreen() {
  const [electricBoxes, setElectricBoxes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 使用 useRef 存储防抖定时器和加载状态
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const endReachedRef = useRef(false);

  const fetchAreaList = async() => {
    try {
      const res = await get_area_list()
      if(res.code === 200){
        const treeList = listToTree(res.data,'pid','area_id')
        setAreaList(treeList)
      }
    } catch (error) {
      console.error('获取区域列表失败:', error);
    }
  }

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
      console.error('加载电箱列表失败:', error);
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
  }, [selectedArea.area_id]);

  // 监听搜索文本变化（带防抖）
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      endReachedRef.current = false;
      loadEleBoxList(1, true);
    }, 300);

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
    setShowDrawer(true);
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        <AreaHeader 
          onSearch={handleSearch} 
          handleSetShowDrawer={handleSetShowDrawer}
          selectedArea={selectedArea}
        />
        <EboxList
          electricBoxes={electricBoxes}
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
      </View>

      <AreaDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        areas={areaList}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
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
