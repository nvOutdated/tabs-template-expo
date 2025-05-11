import { getCameraInfoQueryList } from '@/api/camera/cameraApi';
import CameraList from '@/components/camera/cameraList';
import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FlipInEasyX, FlipOutEasyX } from 'react-native-reanimated';
export type CameraItem = {
  id: number;
  name: string;
  area_name: string;
  create_time: string;
  is_online: boolean;
  thumbnail: string;
  canPlay: boolean; // 新增可播放标志
  channelId: string;
};
type MusicPlatform = {
  id: string;
  name: string;
  icon: "camera-iris" | "camera-off" | "camera";
};
const platforms: MusicPlatform[] = [
  { id: 'all', name: '全部', icon: 'camera-iris' },
  { id: 'online', name: '在线', icon: 'camera' },
  { id: 'offline', name: '离线', icon: 'camera-off' },
];
export default function CameraIndexScreen() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [showSearch, setShowSearch] = useState(true);

  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform>(platforms[0]);
  const [isPlatformMenuVisible, setIsPlatformMenuVisible] = useState(false);
  const filteredCameras = useMemo(() => {
    return cameras.filter(camera => {
      const matchesSearch = camera.name.toLowerCase().includes(searchText.toLowerCase()) ||
        camera.area_name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'online' && camera.is_online) ||
        (selectedStatus === 'offline' && !camera.is_online);
      return matchesSearch && matchesStatus;
    });
  }, [cameras, searchText, selectedStatus]);
  const loadCameras = useCallback(async (page: number, isRefresh = false) => {
    try {
      setError(null);
      const res = await getCameraInfoQueryList({ current: page, page_size: 10 });
      if (res.data) {
        const formattedCameras = res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          area_name: item.area_name,
          create_time: item.create_time.split(' ')[0],
          is_online: item.channels?.[0]?.is_online || false,
          thumbnail: 'https://picsum.photos/300/200?random=' + item.id,
          canPlay: item.channels?.[0]?.is_online || false,
          channelId: item.channels[0]?.channelId || ''
        }));
        setCameras(prev => {
          if (isRefresh) return formattedCameras;
          // 添加数据去重逻辑
          const existingIds = new Set(prev.map(camera => camera.id));
          const uniqueNewCameras = formattedCameras.filter((camera: any) => !existingIds.has(camera.id));
          return [...prev, ...uniqueNewCameras];
        });
        setHasMore(res.data.length >= 10);
      }
    } catch (error) {
      setError('加载摄像头列表失败，请稍后重试');
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadCameras(1, true);
  }, [loadCameras]);

  const onEndReached = useCallback(() => {
    if (!refreshing && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCameras(nextPage);
    }
  }, [currentPage, hasMore, refreshing, loadCameras]);

  useEffect(() => {
    loadCameras(1, true);
    return () => {
      console.log('CameraIndexScreen unmounted');
    }
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    // selectPlatform(platform)
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);
  const togglePlatformMenu = () => {
    setIsPlatformMenuVisible(!isPlatformMenuVisible);
  };
  const selectPlatform = (platform: MusicPlatform) => {
    setSelectedPlatform(platform);
    handleStatusChange(platform.id);
    setIsPlatformMenuVisible(false);
  };
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadCameras(1, true)}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background-0'>
      {showSearch && (
        <Animated.View entering={FlipInEasyX}
          exiting={FlipOutEasyX}
          className="absolute   left-0 right-0 h-12 rounded-lg px-4 flex-row items-center bg-background-100"
          style={[styles.headerContainer]}>
          <TouchableOpacity
            className="flex-row items-center w-35 pr-2 border-r border-typography-300"
            onPress={togglePlatformMenu}
          >
            <Text className="text-sm mr-1 text-typography-900">
              {selectedPlatform.name}
            </Text>
            <AntDesign name="down" size={12} className="text-typography-900" />
          </TouchableOpacity>

          <TextInput
            className="flex-1  ml-2 h-10 text-left  align-middle text-typography-900"
            style={styles.searchInput}
            placeholder="搜索..."
            placeholderTextColor={currentTheme.textColor}
            value={searchText}
            onChangeText={handleSearch}
          />
        </Animated.View>

      )}
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
                className={`flex-row items-center p-3 rounded-lg ${selectedPlatform.id === platform.id ? 'bg-indicator-info' : ''}`}
                onPress={() => selectPlatform(platform)}
              >
                {platform.id === 'all' ? (
                  <MaterialIcons
                    name="camera"
                    size={16}
                    color={currentTheme.textColor}
                    className="mr-2 text-typography-900"
                  />
                ) : platform.id === 'offline' ? (
                  <Feather
                    name="camera-off"
                    size={16}
                    color={currentTheme.textColor}
                    className="mr-2 text-typography-900"
                  />
                ) : platform.id === 'online' ? (
                  <FontAwesome
                    name="camera"
                    size={16}
                    color={currentTheme.textColor}
                    className="mr-2 text-typography-900"
                  />
                ) : null}
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
      <CameraList
        cameras={filteredCameras}
        onEndReached={onEndReached}
        setShowSearch={setShowSearch}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.activeTint]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',

  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1890ff',
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    lineHeight:2,
  },
});


