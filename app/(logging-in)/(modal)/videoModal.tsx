import VideoController from '@/components/camera/VideoController';
import VideoPlayer from '@/components/camera/VideoPlayer';
import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CameraItem = {
  id: number;
  name: string;
  area_name: string;
  create_time: string;
  is_online: boolean;
  thumbnail: string;
  channels: {
    channelId: string;
    is_online: boolean;
  }[];
  channelId: string;
  uploadDate: string;
  title: string;
};

export default function VideoModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraParam = params.video as string;
  const isMounted = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
  let camera: CameraItem;
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setIsLandscape(width > height);
  }, [width, height]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      console.log('VideoModal unmounted');
      isMounted.current = false;
    };
  }, []);

  try {
    camera = JSON.parse(cameraParam);
  } catch (error) {
    console.error('Failed to parse camera data:', error);
    router.back();
    return null;
  }

  const handleBack = () => {
    if (isMounted.current) {
      isMounted.current = false;
      router.back();
    }
  };

  return (
    <View style={[
      styles.container, 
      isFullscreen && styles.fullscreenContainer,
      { paddingTop: isFullscreen ? 0 : insets.top }
    ]}>
      <StatusBar 
        translucent 
        backgroundColor={currentTheme.headerBg}
        hidden={isFullscreen}
      />
      {!isFullscreen && (
        <View style={styles.headerContainer} className='bg-background-0'>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={currentTheme.textColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} className='text-primary-500'>{camera.title}</Text>
        </View>
      )}
      {!isFullscreen && (
        <View style={styles.infoContainer}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>区域: {camera.area_name}</Text>
            <Text style={[styles.status, camera.is_online ? styles.online : styles.offline]}>
              {camera.is_online ? '在线' : '离线'}
            </Text>
          </View>
          <Text style={styles.timeText}>创建时间: {camera.uploadDate}</Text>
        </View>
      )}
      <View style={[
        isFullscreen ? styles.fullscreenVideoContainer : styles.videoContainer
      ]}>
        <VideoPlayer
          channelId={camera.channelId}
          isFullscreen={isFullscreen}
          onFullscreenChange={(newFullscreen) => {
            setIsFullscreen(newFullscreen);
            if (!newFullscreen) {
              // 当退出全屏时，确保状态栏显示
              StatusBar.setHidden(false);
              // 解锁屏幕方向
              ScreenOrientation.unlockAsync();
            }
          }}
        />
      </View>
      {!isFullscreen && (
        <View style={styles.controlsContainer}>
          <VideoController channelId={camera.channelId} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  videoContainer: {
    flex: 3.5/7,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  landscapeVideoContainer: {
    flex: 5/7,
    width: '100%',
    height: '100%',
  },
  fullscreenVideoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    flex: 1/7,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#e6f7e6',
    color: '#52c41a',
  },
  offline: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  controlsContainer: {
    flex: 2.5/7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    // paddingBottom: insets.bottom,
  },
  landscapeControlsContainer: {
    position: 'absolute',
    // bottom: insets.bottom,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
});
