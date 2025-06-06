import { SimpleWebRTCManager } from '@/utils/SimpleWebRTCManager';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

const SimpleVideoPlayer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const webRTCManager = useRef<SimpleWebRTCManager | null>(null);

  useEffect(() => {
    webRTCManager.current = new SimpleWebRTCManager(
      ({ stream, isPlaying }) => {
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

    return () => {
      if (webRTCManager.current) {
        webRTCManager.current.cleanup();
      }
    };
  }, []);

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000) as unknown as NodeJS.Timeout;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      webRTCManager.current?.pauseStream();
    } else {
      webRTCManager.current?.resumeStream();
    }
  };

  return (
    <TouchableOpacity
      className="flex-1 bg-black"
      activeOpacity={1}
      onPress={showControlsTemporarily}
    >
      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {stream ? (
        <RTCView
          streamURL={stream.toURL()}
          className="flex-1"
          objectFit="contain"
          zOrder={1}
          mirror={false}
        />
      ) : (
        <View className="flex-1 bg-black" />
      )}

      {showControls && (
        <View className="absolute bottom-5 left-0 right-0 flex-row justify-center items-center">
          <TouchableOpacity
            onPress={handlePlayPause}
            className="w-12 h-12 rounded-full bg-black/50 justify-center items-center mx-2"
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SimpleVideoPlayer; 