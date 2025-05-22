import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type AreaHeaderProps = {
  onSearch: (text: string) => void;
  handleSetShowDrawer: () => void;
  selectedArea: {
    area_id: number,
    name: string,
  };
  isOperationMode: boolean;
  onToggleOperationMode: () => void;
};

export default function AreaHeader({ 
  onSearch, 
  handleSetShowDrawer, 
  selectedArea,
  isOperationMode,
  onToggleOperationMode 
}: AreaHeaderProps) {
  const currentTheme = useCurrentTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const useInputRef = useRef<TextInput>(null);

  const searchAnimation = useSharedValue(0);

  useEffect(() => {
    searchAnimation.value = withTiming(showSearch ? 1 : 0, {
      duration: 300,
    });
  }, [showSearch]);

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(searchAnimation.value, [0, 1], [width, 0]) }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(searchAnimation.value, [0, 1], [0, -width / 2]) }],
    opacity: interpolate(searchAnimation.value, [0, 1], [1, 0]),
  }));

  const toggleSearch = useCallback(() => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);
    if (newShowSearch) {
      setSearchText('');
      setTimeout(() => {
        useInputRef.current?.focus();
      }, 100);
    } else {
      setSearchText('');
      onSearch('');
    }
  }, [showSearch, onSearch]);

  useEffect(() => {
    if (showSearch && useInputRef.current) {
      useInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    onSearch(searchText);
  }, [searchText, onSearch]);

  return (
    <View style={[styles.container]}>
      <View style={[styles.header]} className="bg-secondary-400">
        <TouchableOpacity
          style={styles.drawerButton}
          onPress={() => handleSetShowDrawer()}
        >
          <Ionicons name="menu" size={24} color={currentTheme.activeTint} />
          <Text className="text-tertiary-500 ml-1 align-middle font-medium">
          {isOperationMode ? '选择设备' : '区域'}
          </Text>
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <Animated.Text
            style={[
              styles.areaName,
              { color: currentTheme.activeTint },
              titleAnimatedStyle,
            ]}
          >
            {selectedArea.name}
          </Animated.Text>

          <Animated.View
            style={[
              styles.searchContainer,
              searchAnimatedStyle,
            ]}
          >
            <TextInput
              ref={useInputRef}
              style={[styles.searchInput, { color: currentTheme.activeTint }]}
              placeholder="搜索..."
              placeholderTextColor={currentTheme.inactiveTint}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
              }}
              autoFocus={showSearch}
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
          <TouchableOpacity
            style={styles.operationButton}
            onPress={onToggleOperationMode}
          >
            <Text style={[styles.operationText, { color: currentTheme.activeTint }]}>
              {isOperationMode ? '退出操作' : '操作'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 0,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
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
  operationButton: {
    padding: 4,
    marginRight: 4,
  },
  operationText: {
    fontSize: 14,
    fontWeight: '500',
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
    lineHeight: 2,
  },
});