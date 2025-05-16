import { deviceQuantity_queryByArea } from "@/api/gis";
import { get_container_list, gis_lightContainer_list } from "@/api/street/streetCommon";
import AMapWebView from "@/components/gis/AMapWebView";
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
  View
} from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");
const MIN_HEIGHT = height * 0.4;
const MAX_HEIGHT = height * 0.4;
const MAP_HEIGHT = height * 0.6;
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
  const searchAnimation = useRef(new Animated.Value(0)).current;
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
  // 修改底部面板动画相关状态
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const bottomSheetHeight = useSharedValue(MIN_HEIGHT);

  const updateMapZoom = useCallback((zoom: number) => {
    setMapZoom(zoom);
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      console.log(bottomSheetHeight.value,"拖动开始高度");
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      
      const newTranslateY = event.translationY + context.value.y;
      // 限制拖动范围
      translateY.value = Math.max(Math.min(newTranslateY, 0), -MAX_HEIGHT + MIN_HEIGHT);
      
      // 根据拖动位置调整底部面板高度
      const progress = (translateY.value + MAX_HEIGHT - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT);
      bottomSheetHeight.value = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * (1 - progress);
     
      // 根据拖动位置调整地图缩放级别
      const newZoom = 19 - Math.floor(progress * 2); // 在19-17之间调整
      runOnJS(updateMapZoom)(newZoom);
    })
    .onEnd(() => {
      // 根据拖动位置决定是否展开或收起
      if (translateY.value > -MAX_HEIGHT / 2) {
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150
        });
        bottomSheetHeight.value = withSpring(MIN_HEIGHT, {
          damping: 15,
          stiffness: 150
        });
        console.log(bottomSheetHeight.value, "拖动完成高度");
        runOnJS(updateMapZoom)(19);
      } else {
        translateY.value = withSpring(-MAX_HEIGHT + MIN_HEIGHT, {
          damping: 15,
          stiffness: 150
        });
        bottomSheetHeight.value = withSpring(MAX_HEIGHT, {
          damping: 15,
          stiffness: 150
        });
        console.log(bottomSheetHeight.value, "拖动完成高度");
        runOnJS(updateMapZoom)(17);
      }
    });

  const bottomSheetStyle = useAnimatedStyle(() => ({
       
      transform: [{ translateY: translateY.value }],
      height: bottomSheetHeight.value,
   
  }));

  const mapContainerStyle = useAnimatedStyle(() => {
    return {
      height: height - bottomSheetHeight.value,
    };
  });

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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
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
          className="absolute h-12 top-2 left-2 right-12 z-10 bg-background-300 rounded-full px-4 flex-row items-center"
          style={{
            transform: [{ translateX: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [width, 0],
            }) }],
          }}
        >      
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

      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            // bottomSheetStyle, 
            { 
              height:MIN_HEIGHT,
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0,
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 1000, // 确保底部面板在最上层
            }
          ]}
        >
          <MapMessage deviceQuantity={deviceQuantity} containerList={containerList} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
