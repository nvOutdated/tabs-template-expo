import { View, Text, TouchableOpacity, Pressable, TextInput, Animated, Dimensions, Modal,StatusBar,ImageBackground } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type CustomHeaderProps = {
  title: string;
};

type MusicPlatform = {
  id: string;
  name: string;
  icon: "music" | "qq";
};

const platforms: MusicPlatform[] = [
  { id: 'netease', name: '网易云', icon: 'music' },
  { id: 'qq', name: 'QQ', icon: 'qq' },
  { id: 'kugou', name: '酷狗', icon: 'music' },
];
const greenBgc = require('@/assets/images/background/greenBgc.png')
export function CustomMusicHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform>(platforms[0]);
  const [isPlatformMenuVisible, setIsPlatformMenuVisible] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  // 处理搜索框的显示/隐藏动画
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchVisible]); 

  // 计算搜索框的位移
  const searchTranslateX = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  // 计算标题的位移和透明度
  const titleTranslateX = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width / 2],
  });

  const titleOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setSearchText('');
    }
  };

  const handleSearch = () => {
    // 根据选择的平台和搜索文本进行搜索
    console.log(`Searching ${searchText} on ${selectedPlatform.name}`);
    // 这里可以添加实际的搜索逻辑
  };

  const togglePlatformMenu = () => {
    setIsPlatformMenuVisible(!isPlatformMenuVisible);
  };

  const selectPlatform = (platform: MusicPlatform) => {
    setSelectedPlatform(platform);
    setIsPlatformMenuVisible(false);
  };

  return (
    <ImageBackground
      source={greenBgc}
      resizeMode="cover"
      style={{
        paddingTop: insets.top,
      }}
    >
    <StatusBar backgroundColor="transparent" translucent />
    <View className="flex-row items-center justify-between " style={{alignItems:'center',padding:12 }}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <View className="mx-2">
          <FontAwesome name="bars" size={24} color={currentTheme.textColor} className="text-typography-900" />
        </View>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center relative">
        <Animated.Text 
          className="text-xl font-bold text-center text-typography-900"
          style={{ 
            transform: [{ translateX: titleTranslateX }],
            opacity: titleOpacity
          }}
        >
          {title}
        </Animated.Text>

        <Animated.View 
          className="absolute left-0 right-0 h-10 rounded-full px-4 flex-row items-center bg-background-100"
          style={{ 
            transform: [{ translateX: searchTranslateX }]
          }}
        >
          <TouchableOpacity 
            className="flex-row items-center pr-2 border-r border-typography-300"
            onPress={togglePlatformMenu}
          >
            <Text className="text-sm mr-1 text-typography-900">
              {selectedPlatform.name}
            </Text>
            <AntDesign name="down" size={12}   className="text-typography-900" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 text-base ml-2 h-10 text-center text-typography-900"
            placeholder="搜索..."
            placeholderTextColor={currentTheme.inactiveTint}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={isSearchVisible}
            onSubmitEditing={handleSearch}
          />
        </Animated.View>
      </View>

      <Pressable onPress={toggleSearch}>
        <View className="mx-2">
          <AntDesign 
            name={isSearchVisible ? "close" : "search1"} 
            size={24} 
            className="text-typography-900"
            color={currentTheme.textColor}
          />
        </View>
      </Pressable>

      <Modal
        visible={isPlatformMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPlatformMenuVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsPlatformMenuVisible(false)}
        >
          <View className="rounded-xl p-2 w-[200] shadow-lg bg-background-100">
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                className={`flex-row items-center p-3 rounded-lg ${
                  selectedPlatform.id === platform.id ? 'bg-indicator-info' : ''
                }`}
                onPress={() => selectPlatform(platform)}
              >
                <FontAwesome 
                  name={platform.icon} 
                  size={16} 
                  color={currentTheme.textColor}
                  className="mr-2 text-typography-900"
                />
                <Text className="text-base flex-1 text-typography-900">
                  {platform.name}
                </Text>
                {selectedPlatform.id === platform.id && (
                  <AntDesign name="check" size={16} className="text-primary-500" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
    </ImageBackground>
  );
}