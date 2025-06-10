import VideoController from '@/components/camera/VideoController';
import VideoPlayer from '@/components/camera/VideoPlayer';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
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
  const {showError} = useCustomToast()
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraParam = params.video as string;
  const isMounted = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
  let camera: CameraItem;
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const insets = useSafeAreaInsets();

  // 动画值
  const headerOpacity = useSharedValue(1);
  const infoOpacity = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);

  // 动画样式
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(headerOpacity.value, {
      duration: 300,
      easing: Easing.inOut(Easing.quad)
    }),
    transform: [{
      translateY: withSpring(headerOpacity.value === 0 ? -50 : 0, {
        damping: 20,
        stiffness: 300
      })
    }]
  }));

  const infoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(infoOpacity.value, {
      duration: 300,
      easing: Easing.inOut(Easing.quad)
    }),
    transform: [{
      translateY: withSpring(infoOpacity.value === 0 ? -20 : 0, {
        damping: 20,
        stiffness: 300
      })
    }]
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsOpacity.value, {
      duration: 300,
      easing: Easing.inOut(Easing.quad)
    }),
    transform: [{
      translateY: withSpring(controlsOpacity.value === 0 ? 50 : 0, {
        damping: 20,
        stiffness: 300
      })
    }]
  }));

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

  // 处理全屏状态变化的动画
  const handleFullscreenChange = useCallback((newFullscreen: boolean) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // 开始隐藏UI元素
    if (newFullscreen || isLandscape) {
      headerOpacity.value = withTiming(0, { duration: 200 });
      infoOpacity.value = withTiming(0, { duration: 200 });
      controlsOpacity.value = withTiming(0, { duration: 200 });
    }

    // 延迟更新状态以确保动画流畅
    setTimeout(() => {
      setIsFullscreen(newFullscreen);
      
      if (!newFullscreen && !isLandscape) {
        // 恢复UI元素
        setTimeout(() => {
          headerOpacity.value = withTiming(1, { duration: 300 });
          infoOpacity.value = withTiming(1, { duration: 300 });
          controlsOpacity.value = withTiming(1, { duration: 300 });
        }, 100);
      }
      
      // 处理状态栏和屏幕方向
      if (newFullscreen) {
        StatusBar.setHidden(true);
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        StatusBar.setHidden(false);
        ScreenOrientation.unlockAsync();
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  }, [isTransitioning, isLandscape, headerOpacity, infoOpacity, controlsOpacity]);

  // 监听横屏变化
  useEffect(() => {
    if (isLandscape && !isFullscreen) {
      headerOpacity.value = withTiming(0, { duration: 200 });
      infoOpacity.value = withTiming(0, { duration: 200 });
      controlsOpacity.value = withTiming(0, { duration: 200 });
    } else if (!isLandscape && !isFullscreen) {
      headerOpacity.value = withTiming(1, { duration: 300 });
      infoOpacity.value = withTiming(1, { duration: 300 });
      controlsOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isLandscape, isFullscreen, headerOpacity, infoOpacity, controlsOpacity]);

  try {
    camera = JSON.parse(cameraParam);
  } catch (error) {
    showError({
      title:"错误信息",
      message:'获取摄像头信息失败'
    })
    router.back();
    return null;
  }

  const handleBack = () => {
    if (isMounted.current && !isTransitioning) {
      isMounted.current = false;
      router.back();
    }
  };

  return (
    <View style={[
      styles.container, 
      (isFullscreen || isLandscape) && styles.fullscreenContainer,
      { paddingTop: (isFullscreen || isLandscape) ? 0 : insets.top }
    ]}>
      <StatusBar 
        translucent 
        backgroundColor={currentTheme.headerBg}
        hidden={isFullscreen || isLandscape}
      />
      
      {/* Header */}
      {!isFullscreen && !isLandscape && (
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]} className='bg-background-0'>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={currentTheme.textColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} className='text-primary-500'>{camera.title}</Text>
        </Animated.View>
      )}

      {/* Info Section */}
      {!isFullscreen && !isLandscape && (
        <Animated.View style={[styles.infoContainer, infoAnimatedStyle]}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>区域: {camera.area_name}</Text>
            <Text style={[styles.status, camera.is_online ? styles.online : styles.offline]}>
              {camera.is_online ? '在线' : '离线'}
            </Text>
          </View>
          <Text style={styles.timeText}>创建时间: {camera.uploadDate}</Text>
        </Animated.View>
      )}

      {/* Video Player */}
      <View style={[
        (isFullscreen || isLandscape) ? styles.fullscreenVideoContainer : styles.videoContainer
      ]}>
        <VideoPlayer
          channelId={camera.channelId}
          isFullscreen={isFullscreen}
          onFullscreenChange={handleFullscreenChange}
        />
      </View>

      {/* Controls */}
      {!isFullscreen && !isLandscape && (
        <Animated.View style={[styles.controlsContainer, controlsAnimatedStyle]}>
          <VideoController channelId={camera.channelId} />
        </Animated.View>
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
    zIndex: 10,
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
  fullscreenVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    flex: 1/7,
    zIndex: 10,
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
    zIndex: 10,
  },
});