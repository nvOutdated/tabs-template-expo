import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AreaDrawer, { Area } from "./AreaDrawer";

const { width } = Dimensions.get('window');

// 虚拟数据
const mockAreas: Area[] = [
  {
    id: 1,
    name: '区域一',
    children: [
      { id: 11, name: '子区域1-1' },
      { id: 12, name: '子区域1-2' },
    ]
  },
  {
    id: 2,
    name: '区域二',
    children: [
      { id: 21, name: '子区域2-1' },
      { id: 22, name: '子区域2-2' },
    ]
  },
  {
    id: 3,
    name: '区域三',
    children: [
      { id: 31, name: '子区域3-1' },
      { id: 32, name: '子区域3-2' },
    ]
  },
];

type AreaHeaderProps = {
  onSearch: (text: string) => void;
};

export default function AreaHeader({ onSearch }: AreaHeaderProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>(mockAreas[0]);
  const [searchText, setSearchText] = useState('');
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearch]);

  const searchTranslateX = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const titleTranslateX = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width / 2],
  });

  const titleOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchText('');
    }
  }, [showSearch]);

  const handleSearch = useCallback(() => {
    onSearch(searchText);
  }, [searchText, onSearch]);

  const handleSelectArea = useCallback((area: typeof selectedArea) => {
    setSelectedArea(area);
    setShowDrawer(false);
  }, []);

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, { backgroundColor: currentTheme.headerBg }]}>
        <TouchableOpacity
          style={styles.drawerButton}
          onPress={() => setShowDrawer(true)}
        >
          <Ionicons name="menu" size={24} color={currentTheme.activeTint} />
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <Animated.Text
            style={[
              styles.areaName,
              { color: currentTheme.activeTint },
              {
                transform: [{ translateX: titleTranslateX }],
                opacity: titleOpacity,
              },
            ]}
          >
            {selectedArea.name}
          </Animated.Text>

          <Animated.View
            style={[
              styles.searchContainer,
              {
                transform: [{ translateX: searchTranslateX }],
              },
            ]}
          >
            <TextInput
              style={[styles.searchInput, { color: currentTheme.activeTint }]}
              placeholder="搜索..."
              placeholderTextColor={currentTheme.inactiveTint}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={showSearch}
              onSubmitEditing={handleSearch}
            />
          </Animated.View>
        </View>

        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleSearch}
          >
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons
              name="scan-outline"
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
        </View>
      </View>

      <AreaDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        areas={mockAreas}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    margin: 0,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  drawerButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    position: 'relative',
  },
  areaName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 4,
    marginRight: 4,
  },
  scanButton: {
    padding: 4,
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
}); 