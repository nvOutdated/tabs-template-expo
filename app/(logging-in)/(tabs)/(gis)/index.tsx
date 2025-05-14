import { get_container_list } from "@/api/street/streetCommon";
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
  const [searchType, setSearchType] = useState<SearchType>('配电箱');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearch]);

  const fetchContainerList = async() => {
    try {
      const res = await get_container_list({});
      if(res.code == 200) {
        setContainerList(res.data);
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchContainerList();
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
    setSearchText(item.device_code);
    setShowSearchResults(false);
    setSelectedMarker(item);
  };
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View style={{ height: height * 0.6 }}>
        <MapExample 
          containerList={containerList}
          selectedMarker={selectedMarker}
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
                    <Text className="text-typography-900">{item.device_code}</Text>
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
