import { get_container_list, gis_lightContainer_list } from "@/api/street/streetCommon";
import MapExample from "@/components/gis/MapExample";
import MapMessage from "@/components/gis/MapMessage";
import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

type SearchType = '配电箱' | '单灯';

type ElectricItem = {
  id: number;
  sn: string;
  name: string;
  addr: string;
  device_info: {
    device_code: string;
    online: boolean;
    open: boolean;
    warn: boolean;
    loops: boolean[];
    images?: string[];
  };
};

export default function GisIndexScreen() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const [showSearch, setShowSearch] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const useInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState("");
  const [containerList, setContainerList] = useState<any[]>([]);
  const [lightList, setLightList] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('配电箱');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [loadingLight, setLoadingLight] = useState(true);
  
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearch]);
  const bdToGaoDe = (bd_lat: number, bd_lng: number)=>{
    const x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    const x = bd_lng - 0.0065;
    const y = bd_lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    const gg_lng = z * Math.cos(theta);
    const gg_lat = z * Math.sin(theta);
    return { lat: gg_lat, lng: gg_lng };
  }
  const fetchContainerList = async() => {
    try {
      const res = await get_container_list({});
      if(res.code == 200) {
        const convertedData = res.data.map((item: any) => ({
          ...item,
          ...bdToGaoDe(item.lat, item.lng)
        }));
        setContainerList(convertedData);
      }
    } catch(error) {
      console.log(error);
    }
  }
  const fetchAllLightData = async () => {
    try {
      setLoadingLight(true);
      let allLights: any[] = [];
      let current = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await gis_lightContainer_list({
          lat1: 0,
          lng1: 0,
          lat2: 90,
          lng2: 180,
          page_size: 200,
          current: current
        });
        if (res.code === 200 && res.data && res.data.length > 0) {
          const convertedData = res.data.map((item: any) => ({
            ...item,
            ...bdToGaoDe(item.lat, item.lng)
          }));
          allLights = [...allLights, ...convertedData];
          setLightList([...allLights]); // 实时显示数量
          current++;
        } else {
          hasMore = false;
        }
      }
      setLoadingLight(false);
    } catch (error) {
      setLoadingLight(false);
      console.log(error);
    }
  };
  useEffect(() => {
    fetchContainerList();
    fetchAllLightData()
  }, []);

  const searchTranslateX = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      useInputRef.current?.focus();
    } else {
      setSelectedMarker(null);
    }
  }, [showSearch]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (searchType === '配电箱' && text) {
      const filtered = containerList.filter(item => 
        item.device_code.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else if (searchType === '单灯' && text) {
      const filtered = lightList.filter(item =>
        item.name && item.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
    setSelectedMarker(null);
  };

  const handleSelectResult = (item: any) => {
    if(item.container_type==='lamp'){
      setSearchText(item.name);
    }else{
      setSearchText(item.device_code);
    }
    setShowSearchResults(false);
    setSelectedMarker(item);
  };
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View style={{ height: height * 0.6 }}>
        {/* 蒙层 */}
        {loadingLight && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: height * 0.6,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 100,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>
              单灯数据加载中...
            </Text>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              已加载：{lightList.length}
            </Text>
          </View>
        )}
        <MapExample 
          containerList={containerList}
          selectedMarker={selectedMarker}
          lightList={lightList}
        />
        <View className="absolute top-2 right-2 z-10">
          <TouchableOpacity
            className="p-2 rounded-full bg-white/80"
            onPress={toggleSearch}
          >
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
        </View>
        <Animated.View
          className="absolute h-12 top-2 left-2 right-12 z-10 bg-background-300 rounded-full px-4 flex-row items-center"
          style={{
            transform: [{ translateX: searchTranslateX }],
          }}
        >
          <TouchableOpacity 
            className="flex-row items-center mr-2"
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Text className="text-[#1890ff] font-medium mr-1">{searchType}</Text>
            <Ionicons name="chevron-down" size={16} color="#1890ff" />
          </TouchableOpacity>
          {showTypeDropdown && (
            <View className="absolute top-12 left-0 bg-white rounded-lg shadow-lg z-20">
              {['配电箱', '单灯'].map((type) => (
                <TouchableOpacity
                  key={type}
                  className="px-4 py-2 border-b border-blue-500"
                  onPress={() => {
                    setSearchType(type as SearchType);
                    setShowTypeDropdown(false);
                    setSearchText('');
                    setShowSearchResults(false);
                  }}
                >
                  <Text className="text-typography-900">{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View className="flex-1 flex-row items-center">
            <TextInput
              ref={useInputRef}
              style={{ flex: 1, lineHeight: 2 }}
              className="h-10 text-left align-middle text-typography-900"
              placeholder="搜索..."
              placeholderTextColor={currentTheme.inactiveTint}
              value={searchText}
              onChangeText={handleSearch}
              autoFocus={showSearch}
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
            <View className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-lg z-20">
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-2 border-b border-gray-100"
                    onPress={() => handleSelectResult(item)}
                  >
                    <Text className="text-typography-900">{item.device_code||item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </Animated.View>
      </View>
      <View style={{ height: height * 0.3 }}>
        <MapMessage />
      </View>
    </View>
  );
}
