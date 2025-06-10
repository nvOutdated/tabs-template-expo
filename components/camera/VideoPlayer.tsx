import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { RTCView } from 'react-native-webrtc';

import { WebRTCManager, WebRTCStream } from '@/utils/WebRTCManager';
import * as ScreenOrientation from 'expo-screen-orientation';

interface VideoPlayerProps {
  channelId?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channelId, isFullscreen = false, onFullscreenChange }) => {
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const webRTCManager = useRef<WebRTCManager | null>(null);
  
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const loadingScale = useSharedValue(1);
  const fullscreenScale = useSharedValue(isFullscreen ? 1 : 0.95);
  const controlsOpacity = useSharedValue(0);
  
  // 判断是否为横屏模式
  const isLandscape = windowWidth > windowHeight;

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(loadingScale.value, { damping: 2 }) }
    ]
  }));

  const videoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(fullscreenScale.value, { 
          damping: 20, 
          stiffness: 300,
          mass: 0.8
        }) }
      ],
      opacity: withTiming(isTransitioning ? 0.9 : 1, {
        duration: 200,
        easing: Easing.out(Easing.quad)
      })
    };
  });

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsOpacity.value, {
      duration: 300,
      easing: Easing.inOut(Easing.quad)
    })
  }));

  const getVideoSize = () => {
    if (isFullscreen || isLandscape) {
      return {
        width: windowWidth,
        height: windowHeight
      };
    } else {
      return {
        width: windowWidth,
        height: windowWidth * 9/16
      };
    }
  };

  // 平滑的全屏切换处理
  const handleFullscreenToggle = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    try {
      // 开始切换动画
      fullscreenScale.value = withSpring(0.95, { 
        damping: 20, 
        stiffness: 300 
      });
      
      // 延迟执行状态切换
      setTimeout(() => {
        if (onFullscreenChange) {
          onFullscreenChange(!isFullscreen);
        }
        
        // 完成切换动画
        setTimeout(() => {
          fullscreenScale.value = withSpring(1, { 
            damping: 20, 
            stiffness: 300,
            mass: 0.8
          });
          setIsTransitioning(false);
        }, 100);
      }, 150);
      
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
      setIsTransitioning(false);
    }
  }, [isFullscreen, onFullscreenChange, isTransitioning, fullscreenScale]);

  useEffect(() => {
    // 同步全屏状态的动画
    fullscreenScale.value = withSpring(1, { 
      damping: 20, 
      stiffness: 300,
      mass: 0.8
    });
  }, [isFullscreen, fullscreenScale]);

  useEffect(() => {
    const handleOrientationChange = async () => {
      try {
        if (isFullscreen) {
          StatusBar.setHidden(true);
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          StatusBar.setHidden(false);
          await ScreenOrientation.unlockAsync();
        }
      } catch (error) {
        console.error('Orientation change error:', error);
      }
    };

    handleOrientationChange();
  }, [isFullscreen]);

  useEffect(() => {
    if (channelId) {
      setLoading(true);
      webRTCManager.current = new WebRTCManager(
        channelId,
        ({ stream, isPlaying }: WebRTCStream) => {
          setStream(stream);
          setIsPlaying(isPlaying);
          setLoading(false);
        },
        (error) => {
          console.log('WebRTC error:', error);
          setLoading(false);
        }
      );
      webRTCManager.current.startStream();
    }

    return () => {
      if (webRTCManager.current) {
        webRTCManager.current.cleanup();
      }
    };
  }, [channelId]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    controlsOpacity.value = withTiming(1, { duration: 200 });
    
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    
    controlsTimer.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => setShowControls(false), 200);
    }, 3000) as unknown as NodeJS.Timeout;
  }, [controlsOpacity]);

  const hideControls = useCallback(() => {
    controlsOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setShowControls(false), 200);
  }, [controlsOpacity]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        (isFullscreen || isLandscape) && styles.fullscreenContainer
      ]}
      activeOpacity={1}
      onPress={showControlsTemporarily}
    >
      {loading && (
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <ActivityIndicator size="large" color="#fff" />
        </Animated.View>
      )}

      {stream ? (
        <Animated.View style={[
          styles.videoWrapper, 
          (isFullscreen || isLandscape) && styles.fullscreenVideoWrapper,
          videoAnimatedStyle
        ]}>
          <RTCView
            streamURL={stream.toURL()}
            style={{
              width: getVideoSize().width,
              height: getVideoSize().height,
              alignSelf: 'center',
            }}
            objectFit="cover"
            zOrder={1}
            mirror={false}
          />
        </Animated.View>
      ) : (
        <View style={styles.placeholder} />
      )}

      {showControls && (
        <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
          <TouchableOpacity
            onPress={() => {
              if (isPlaying) {
                webRTCManager.current?.stopStream();
              } else {
                webRTCManager.current?.startStream();
              }
              showControlsTemporarily();
            }}
            style={styles.controlButton}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleFullscreenToggle}
            style={[styles.controlButton, { marginLeft: 20 }]}
            disabled={isTransitioning}
          >
            <MaterialIcons
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={32}
              color={isTransitioning ? '#999' : '#fff'}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  },
  fullscreenVideoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
});

export default VideoPlayer;