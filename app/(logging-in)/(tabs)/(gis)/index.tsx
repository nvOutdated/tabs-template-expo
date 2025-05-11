import MapComponent from '@/components/gis/MapComponent';
import MapMessage from '@/components/gis/MapMessage';
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function GisIndexScreen() {
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();
  const [showSearch, setShowSearch] = useState(false);
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

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
  }, [showSearch]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View style={{ height: height * 0.6 }}>
        <MapComponent />
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
          className="absolute top-2 left-2 right-12 z-10 bg-white/80 rounded-full px-4 py-2"
          style={{
            transform: [{ translateX: searchTranslateX }],
          }}
        >
          <Text className="text-gray-500">搜索地点...</Text>
        </Animated.View>
      </View>
      <View style={{ height: height * 0.4 }}>
        <MapMessage />
      </View>
    </View>
  );
}