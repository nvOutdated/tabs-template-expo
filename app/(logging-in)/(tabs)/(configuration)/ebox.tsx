import { get_area_list } from "@/api/area/areaApi";
import { getEboxListApi } from "@/api/street/configuration";
import AreaDrawer, { Area } from "@/components/ebox/AreaDrawer";
import AreaHeader from "@/components/ebox/AreaHeader";
import EboxList from "@/components/ebox/EboxList";
import { listToTree } from "@/utils/treeUtils";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const { width } = Dimensions.get('window');
// 虚拟数据
// const mockAreas: Area[] = [
//   {
//     id: 1,
//     name: '区域一',
//     children: [
//       { id: 11, name: '子区域1-1' },
//       { id: 12, name: '子区域1-2' },
//     ]
//   },
//   {
//     id: 2,
//     name: '区域二',
//     children: [
//       { id: 21, name: '子区域2-1' },
//       { id: 22, name: '子区域2-2' },
//     ]
//   },
//   {
//     id: 3,
//     name: '区域三',
//     children: [
//       { id: 31, name: '子区域3-1' },
//       { id: 32, name: '子区域3-2' },
//     ]
//   },
// ];
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
  const fetchEleBoxes = async () => {
    try {
      setLoading(true);
      const res = await getEboxListApi({});
    //   console.log(res, "res");
      if (res.code === 200) {
        setElectricBoxes(res.data || []);
      }
    } catch (error) {
      console.error('获取电箱列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 const fetchAreaList = async()=>{
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
  useEffect(() => {
    fetchEleBoxes();
  }, []);
  useEffect(()=>{
    fetchAreaList()
  },[])
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchEleBoxes();
  };

  const handleSearch = (text: string) => {
    // TODO: 实现搜索功能
    const selectData = [...electricBoxes].filter(i=>i.device_info.device_code.includes(text))
    setElectricBoxes(selectData)
  };
  const handleSelectArea = useCallback((area: typeof selectedArea) => {
    setSelectedArea(area);
    setShowDrawer(false);
  }, []);
  const handleSetShowDrawer = useCallback(()=>{
    setShowDrawer(true);
  },[])
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
        onClose={() => setShowDrawer(false) }
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
