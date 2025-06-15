import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface Line {
  id: number;
  name: string;
}

interface LineSelectorProps {
  lines: Line[];
  selectedLine: Line | null;
  onSelectLine: (line: Line) => void;
  onSearch: (text: string) => void;
  onEdit: () => void;
  selectedCount: number;
  totalCount: number;
  currentOperation: 'all' | 'controller';
}

const LineSelector = ({ 
  lines, 
  selectedLine, 
  onSelectLine,
  onSearch,
  onEdit,
  selectedCount,
  totalCount,
  currentOperation,
}: LineSelectorProps) => {
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWidth = useSharedValue(0);
  const searchOpacity = useSharedValue(0);

  const handleSelectLine = useCallback((line: Line) => {
    onSelectLine(line);
  }, [onSelectLine]);

  const handleSearchPress = useCallback(() => {
    if (isSearchFocused) {
      setIsSearchFocused(false);
      searchWidth.value = withSpring(0, {
        damping: 15,
        stiffness: 50,
      });
      searchOpacity.value = withSpring(0);
      setSearchText('');
      onSearch('');
    } else {
      setIsSearchFocused(true);
      searchWidth.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      searchOpacity.value = withSpring(1);
    }
  }, [isSearchFocused, onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    onSearch(text);
  }, [onSearch]);

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${searchWidth.value * 200}%`,
      opacity: searchOpacity.value,
    };
  });

  if (lines.length === 0) {
    return (
      <View className="h-12 bg-white border-b border-gray-200 justify-center">
        <Text className="text-gray-500 text-center text-sm">暂无线路数据</Text>
      </View>
    );
  }

  return (
    <View className="h-12 bg-white border-b border-gray-200 flex-row">
      <View className="w-[75%] h-full">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="h-full"
          contentContainerStyle={{
            height: 48,
            alignItems: 'center',
          }}
        >
          <View className="flex-row h-full items-center px-2">
            {lines.map((line) => (
              <TouchableOpacity
                key={line.id}
                onPress={() => handleSelectLine(line)}
                className={`px-3 h-8 mx-1 rounded-full justify-center ${
                  selectedLine?.id === line.id
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedLine?.id === line.id
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {line.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="w-[25%] h-full flex-row items-center justify-end pr-2">
        {currentOperation === 'controller' && (
          <>
            <Animated.View 
              className="flex-row items-center bg-gray-100 rounded-md h-10 mr-2 overflow-hidden border border-gray-200"
              style={searchAnimatedStyle}
            >
              <TextInput
                className="flex-1 h-10 px-2 text-sm text-gray-700"
                placeholder="搜索控制器编号..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={handleSearchChange}
                autoFocus={isSearchFocused}
              />
              {searchText.length > 0 && (
                <TouchableOpacity 
                  className="p-1"
                  onPress={handleClearSearch}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </Animated.View>

            <TouchableOpacity
              className={`p-1 rounded-md mr-2 ${isSearchFocused ? 'bg-gray-100' : 'bg-gray-50'}`}
              onPress={handleSearchPress}
            >
              <Ionicons 
                name={isSearchFocused ? "close" : "search"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          className={`h-10 px-3 rounded-md justify-center items-center ${
            currentOperation === 'all' 
              ? 'bg-blue-500' 
              : 'bg-blue-500'
          }`}
          onPress={onEdit}
        >
          <Text className={`text-sm text-white`}>
            {currentOperation === 'all' ? '线路管理' : '操作'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LineSelector;