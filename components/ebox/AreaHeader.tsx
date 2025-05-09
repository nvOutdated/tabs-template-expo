import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
const { width } = Dimensions.get('window');

type AreaHeaderProps = {
  onSearch: (text: string) => void;
  handleSetShowDrawer:()=>void;
  selectedArea:{
    area_id:number,
    name:string,
  };
};

export default function AreaHeader({ onSearch,handleSetShowDrawer,selectedArea }: AreaHeaderProps) {
  const currentTheme = useCurrentTheme();
  const [showSearch, setShowSearch] = useState(false);
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

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, ]} className="bg-secondary-400">
        <TouchableOpacity
          style={styles.drawerButton}
          onPress={() => handleSetShowDrawer()}
        >
          <Ionicons name="menu" size={24} color={currentTheme.activeTint} />
          <Text className="text-tertiary-500 ml-1 align-middle font-medium">区域</Text>
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
          <TouchableOpacity style={styles.scanButton} onPress={(()=>{
            router.push("/(logging-in)/(modal)/addDeviceModal")
          })}>
            <Ionicons
              name="add"
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
        </View>
      </View>
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
    // justifyContent:"flex-start",
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  drawerButton: {
    padding: 4,
    flexDirection: 'row',
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
    height: 38,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    lineHeight:2,
  },
}); 