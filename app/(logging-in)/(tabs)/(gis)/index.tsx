import { deviceQuantity_queryByArea } from "@/api/gis";
import { get_container_list, gis_lightContainer_list } from "@/api/street/streetCommon";
import AMapWebView from "@/components/gis/AMapWebView";
import MapMessage from "@/components/gis/MapMessage";
import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const MIN_HEIGHT = height * 0.1;
const MAX_HEIGHT = height * 0.4;
const MAP_HEIGHT = height * 0.9;
const MAX_OFFSET = height * 0.3; // 最大偏移量  

// 修改 clamp 函数为 worklet
function clamp(val: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(val, min), max);
}

interface DeviceQuantity {
  total: number;
  singleArmLampNum: number;
  doubleArmLampNum: number;
  yulanLampNum: number;
  gardenLampNum: number;
  otherLampNum: number;
  lampHolderNum: number;
}
export default function GisIndexScreen() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const [showSearch, setShowSearch] = useState(false);
  const searchAnimation = useSharedValue(0);
  const useInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState("");
  const [containerList, setContainerList] = useState<any[]>([]);
  const [lightList, setLightList] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [loadingLight, setLoadingLight] = useState(true);
  const [mapZoom, setMapZoom] = useState(19);
  const [deviceQuantity, setDeviceQuantity] = useState<DeviceQuantity>({
    total: 0,
    singleArmLampNum: 0,
    doubleArmLampNum: 0,
    yulanLampNum: 0,
    gardenLampNum: 0,
    otherLampNum: 0,
    lampHolderNum: 0
  });

  // 修改动画相关状态
  const translateY = useSharedValue(0);
  const prevTranslateY = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: translateY.value }],
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: MAX_HEIGHT,
      backgroundColor: 'transparent',
      zIndex: 1000,
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: searchAnimation.value }],
  }));

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      'worklet';
      prevTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateY.value = clamp(
        prevTranslateY.value + event.translationY,
        0,
        MAX_OFFSET
      );
    })
    .onEnd(() => {
      'worklet';
      if (translateY.value > MAX_OFFSET / 2) {
        translateY.value = withSpring(MAX_OFFSET, {
          damping: 20,
          stiffness: 200,
          mass: 0.5,
          velocity: 0,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
          mass: 0.5,
          velocity: 0,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      }
    });

  // 修改搜索动画
  useEffect(() => {
    searchAnimation.value = withTiming(showSearch ? 0 : width, {
      duration: 300,
    });
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
      if(res.code === 200) {
        const convertedData = res.data.map((item: any) => ({
          ...item,
          searchName:'集中器: '+`${item.device_code}`+`,(${item.name})`,
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
            searchName:'单灯: '+`${item.name}`+`,(${item.container_id})`,
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
  const fetchDeviceQuantityByArea = async () => {
    try {
      const res = await deviceQuantity_queryByArea({
        areaId: 1
      });
      if(res.code === 200) {
        setDeviceQuantity(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {
    fetchContainerList();
    fetchAllLightData()
    fetchDeviceQuantityByArea()
  }, []);

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
    console.log(containerList[0],lightList[0]);
    
    if(text.length>0){
      const filtered = [...containerList,...lightList].filter(item =>
        item.searchName && item.searchName.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 10);
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <View style={{ height: MAP_HEIGHT }}>
          {/* 蒙层 */}
          {loadingLight && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
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
          <AMapWebView 
            markers={[
              ...containerList.map((item, index) => ({
                id: `container_${item.id}_${index}`,
                position: { latitude: item.lat, longitude: item.lng },
                title: item.name,
                info: item.device_code,
                container_type: item.container_type,
                online: item.online,
                open: item.open,
                warn: item.warn,
                icon: {
                  size: [40, 40] as [number, number],
                  image: ''
                },
                container_id: item.container_id
              })),
              ...lightList.map((item, index) => ({
                id: `light_${item.id}_${index}`,
                position: { latitude: item.lat, longitude: item.lng },
                title: item.name || '单灯',
                info: item.sn,
                container_type: item.container_type,
                single_lamp_status: item.single_lamp_status || [],
                direction: item.direction,
                icon: {
                  size: [40, 80] as [number, number],
                  image: 'singleLightNormal'
                },
                container_id: item.container_id
              }))
            ]}
            moveTo={selectedMarker ? {
              position: { latitude: selectedMarker.lat, longitude: selectedMarker.lng },
              zoom: mapZoom,
              title: selectedMarker.name,
              info: selectedMarker.device_code || selectedMarker.sn,
              container_type: selectedMarker.container_type,
              online: selectedMarker.online,
              open: selectedMarker.open,
              warn: selectedMarker.warn,
              direction: selectedMarker.direction,
              single_lamp_status: selectedMarker.single_lamp_status,
              container_id: selectedMarker.container_id
            } : null}
            onMapPress={(position) => {
              console.log('Map pressed:', position);
            }}
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
            className="absolute h-11 top-2 left-2 right-12 z-10 bg-background-300 rounded-full px-3 flex-row items-center"
            style={searchAnimatedStyle}
          >      
            <View className="flex-1 flex-row items-center">
              <TextInput
                ref={useInputRef}
                style={{ flex: 1 }}
                className="h-10 text-left py-1  align-middle text-typography-900"
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
                  keyExtractor={(item) => item.container_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-2 border-b border-gray-100"
                      onPress={() => handleSelectResult(item)}
                    >
                      <Text className="text-typography-900">{item.searchName.split(',')[0]}</Text>
                      <Text className="text-typography-900">{item.searchName.split(',')[1]}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </Animated.View>
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View 
            style={animatedStyles}
          >
            {/* 添加顶部拖动句柄 */}
            <View 
              style={{
                height: 20,
                width: '100%',
                backgroundColor: 'transparent',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View 
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: currentTheme.activeTint,
                  borderRadius: 2,
                }}
              />
            </View>
            <MapMessage deviceQuantity={deviceQuantity} containerList={containerList} />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
