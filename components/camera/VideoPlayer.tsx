import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const webRTCManager = useRef<WebRTCManager | null>(null);
  
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const loadingScale = useSharedValue(1);

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(loadingScale.value, { damping: 2 }) }
    ]
  }));

  const fullscreenAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isFullscreen ? 1 : 1, { damping: 15 }) },
      ],
      ...(isFullscreen ? {
        width: '100%',
        height: '100%',
      } : {})
    };
  });

  const getVideoSize = () => {
    if (isFullscreen) {
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

  useEffect(() => {
    if (isFullscreen) {
      StatusBar.setHidden(true);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    }
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
          console.error('WebRTC error:', error);
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

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000) as unknown as NodeJS.Timeout;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isFullscreen && styles.fullscreenContainer]}
      activeOpacity={1}
      onPress={showControlsTemporarily}
    >
      {loading && (
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <ActivityIndicator size="large" color="#fff" />
        </Animated.View>
      )}

      {stream ? (
        <>
          <Animated.View style={[styles.videoWrapper, fullscreenAnimatedStyle]}>
            <RTCView
              streamURL={stream.toURL()}
              style={{
                width: getVideoSize().width,
                height: getVideoSize().height,
                alignSelf: 'center',
                transform: isFullscreen ? [{ rotate: '90deg' }] : [],
                transformOrigin: 'center',
              }}
              objectFit="contain"
              zOrder={1}
              mirror={false}
            />
          </Animated.View>
        </>
      ) : (
        <View style={styles.placeholder} />
      )}

      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => {
              if (isPlaying) {
                webRTCManager.current?.stopStream();
              } else {
                webRTCManager.current?.startStream();
              }
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
            onPress={() => {
              if (onFullscreenChange) {
                onFullscreenChange(!isFullscreen);
              }
              setShowControls(true);
              if (controlsTimer.current) {
                clearTimeout(controlsTimer.current);
              }
              controlsTimer.current = setTimeout(() => {
                setShowControls(false);
              }, 3000)as unknown as NodeJS.Timeout;;
            }}
            style={[styles.controlButton, { marginLeft: 20 }]}
          >
            <MaterialIcons
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
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
  video: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  fullscreenVideo: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
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