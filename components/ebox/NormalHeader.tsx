import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Area } from "./AreaDrawer";

type NormalHeaderProps = {
  onSearch: (text: string) => void;
  handleSetShowDrawer: () => void;
  selectedArea: Area;
  onToggleOperationMode: () => void;
};

export default function NormalHeader({
  onSearch,
  handleSetShowDrawer,
  selectedArea,
  onToggleOperationMode,
}: NormalHeaderProps) {
  const currentTheme = useCurrentTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchWidth = useSharedValue(0);
  const searchOpacity = useSharedValue(0);

  const handleSearchPress = () => {
    if (isSearchFocused) {
      setIsSearchFocused(false);
      searchWidth.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      searchOpacity.value = withSpring(0);
      // 清除搜索内容
      setSearchValue("");
      onSearch("");
    } else {
      setIsSearchFocused(true);
      searchWidth.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      searchOpacity.value = withSpring(1);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearch("");
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    onSearch(text);
  };

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${searchWidth.value * 100}%`,
      opacity: searchOpacity.value,
    };
  });

  return (
    <View className="h-11 flex-row items-center px-1 bg-secondary-400">
      <TouchableOpacity
        className="p-1 flex-row items-center min-w-[140px]"
        onPress={() => handleSetShowDrawer()}
      >
        <Ionicons name="menu" size={24} color={currentTheme.activeTint} />
        <View className="flex-row items-center ml-1 flex-1">
          <Text className="text-tertiary-500 font-medium flex-1" numberOfLines={1}>
            {selectedArea.name || '选择区域'}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center justify-end">
        <Animated.View 
          className="flex-row items-center bg-background-0 rounded-lg px-0.5 h-9 mr-2 border border-outline-300 max-w-[250px]"
          style={searchAnimatedStyle}
        >
          <TextInput
            className="flex-1 h-9 p-1 text-sm leading-9"
            style={{ color: currentTheme.activeTint }}
            placeholder="搜索"
            placeholderTextColor={currentTheme.activeTint}
            onChangeText={handleSearchChange}
            value={searchValue}
            autoFocus={isSearchFocused}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity
              className="p-1"
              onPress={handleClearSearch}
            >
              <Ionicons 
                name="close-circle" 
                size={16} 
                color={currentTheme.activeTint} 
              />
            </TouchableOpacity>
          )}
        </Animated.View>
        <TouchableOpacity
          className={`p-[4px] rounded-md mr-1.5 ${isSearchFocused ? 'bg-background-0' : 'bg-background-100'}`}
          onPress={handleSearchPress}
        >
          <Ionicons 
            name={isSearchFocused ? "close" : "search"} 
            size={20} 
            color={currentTheme.activeTint} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="p-1"
          onPress={onToggleOperationMode}
        >
          <Text className="text-sm font-medium" style={{ color: currentTheme.activeTint }}>
            操作
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 