import { cameraControl } from '@/api/camera/cameraApi';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
type VideoControllerProps = {
  channelId: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPanChange?: (x: number, y: number) => void;
};

const JOYSTICK_SIZE = 60;
const CONTAINER_SIZE = 140;
const MAX_DISTANCE = (CONTAINER_SIZE - JOYSTICK_SIZE) / 2;

export default function VideoController({ channelId, onPanChange }: VideoControllerProps) {
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
    ],
  }));
  const lastValidPosition = useRef({ x: 0, y: 0 });
  const [direction, setDirection] = useState('stop')
  const [step, setStep] = useState(3)
  const speedOptions = [
    { label: '慢速', value: 1 },
    { label: '中速', value: 3 },
    { label: '快速', value: 5 }
  ]
  useEffect(() => {
    //console.log(direction, '方向');
    cameraControl({ channel_id: channelId, type: direction, step: step }).then(res => {
      //console.log(res, '移动');

    })
  }, [direction])
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panX.value = 0;
        panY.value = 0;
      },
      onPanResponderMove: (_, gesture) => {
        const distance = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
        let newX = gesture.dx;
        let newY = gesture.dy;
        if (distance > MAX_DISTANCE) {
          const scale = MAX_DISTANCE / distance;
          newX = gesture.dx * scale;
          newY = gesture.dy * scale;

          // 仅在滑动到边缘时计算方向
          const angle = Math.atan2(newY, newX) * (180 / Math.PI);

          // 根据角度判断八个方向
          if (angle >= -22.5 && angle < 22.5) {
            setDirection('right');
          } else if (angle >= 22.5 && angle < 67.5) {
            setDirection('rightdown');
          } else if (angle >= 67.5 && angle < 112.5) {
            setDirection('down');
          } else if (angle >= 112.5 && angle < 157.5) {
            setDirection('leftdown');
          } else if ((angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            setDirection('left');
          } else if (angle >= -157.5 && angle < -112.5) {
            setDirection('leftup');
          } else if (angle >= -112.5 && angle < -67.5) {
            setDirection('up');
          } else if (angle >= -67.5 && angle < -22.5) {
            setDirection('rightup');
          }
          // console.log(direction,'方向');
        }


        panX.value = newX;
        panY.value = newY;
        lastValidPosition.current = { x: newX, y: newY };
        onPanChange?.(newX / MAX_DISTANCE, newY / MAX_DISTANCE);
      },
      onPanResponderRelease: () => {
        setDirection('stop');
        console.log("松手");

        panX.value = withSpring(0, {
          damping: 7,
          stiffness: 60,
          restSpeedThreshold: 0.1,
          restDisplacementThreshold: 0.1,
        });
        panY.value = withSpring(0, {
          damping: 7,
          stiffness: 60,
          restSpeedThreshold: 0.1,
          restDisplacementThreshold: 0.1,
        });
        onPanChange?.(0, 0);
      },
    })
  ).current;
  function onZoomIn() {
    // 按下时开始缩放
    // cameraControl({ channel_id: channelId, type: 'zoomfar', step: step }).then(res => {
    //   console.log(res, '缩放');

    // })
    console.log("开始缩放");
    
  }
  
  function handleZoomInPressIn() {
    cameraControl({ channel_id: channelId, type: 'zoomfar', step: step }).then(res => {
      console.log(res, '开始放大');
    })
  }
  
  function handleZoomInPressOut() {
    cameraControl({ channel_id: channelId, type: 'stop', step: step }).then(res => {
      console.log(res, '停止放大');
    })
  }
  function onZoomOut() {
    // 按下时开始缩小
  }
  
  function handleZoomOutPressIn() {
    // 按下时开始缩小
     cameraControl({ channel_id: channelId, type: 'zoomnear', step: step }).then(res => {
      console.log(res, '缩放');
    })
  }
  
  function handleZoomOutPressOut() {
    // 松手时停止缩小
    cameraControl({ channel_id: channelId, type: 'stop', step: step }).then(res => {
      console.log(res, '停止缩放');
    })
  }
  return (
    <View style={styles.container}>


      <TouchableOpacity 
        style={styles.zoomButton} 
        // onPress={onZoomOut}
        onPressIn={handleZoomOutPressIn}
        onPressOut={handleZoomOutPressOut}
      >
        <MaterialIcons name="zoom-out" size={24} color="white" />
      </TouchableOpacity>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 20}}>
        <View style={styles.joystickContainer}>
          <View style={styles.joystickBackground}>
            <MaterialIcons name="keyboard-arrow-up" size={24} color="rgba(255, 255, 255, 0.5)" style={[styles.directionIcon, styles.topIcon]} />
            <MaterialIcons name="keyboard-arrow-down" size={24} color="rgba(255, 255, 255, 0.5)" style={[styles.directionIcon, styles.bottomIcon]} />
            <MaterialIcons name="keyboard-arrow-left" size={24} color="rgba(255, 255, 255, 0.5)" style={[styles.directionIcon, styles.leftIcon]} />
            <MaterialIcons name="keyboard-arrow-right" size={24} color="rgba(255, 255, 255, 0.5)" style={[styles.directionIcon, styles.rightIcon]} />
          </View>
          <Animated.View
            style={[styles.joystick, animatedStyle]}
            {...panResponder.panHandlers}
          />
        </View>
        <View style={styles.speedControlContainer}>
          {speedOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.speedButton,
                step === option.value && styles.speedButtonActive
              ]}
              onPress={() => setStep(option.value)}
            >
              <Text style={styles.speedButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.zoomButton} 
        // onPress={onZoomIn}
        onPressIn={handleZoomInPressIn}
        onPressOut={handleZoomInPressOut}
      >
        <MaterialIcons name="zoom-in" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  speedControlContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 5,
    marginVertical: 5,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 2,
  },
  speedButtonActive: {
    backgroundColor: '#409eff',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  joystickBackground: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    zIndex: 1,
  },
  joystick: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionIcon: {
    position: 'absolute',
    transform: [{ translateX: -12 }],
  },
  topIcon: {
    position: 'absolute',
    top: 10,
    left: '50%',
  },
  bottomIcon: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -12 }],
  },
  leftIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});