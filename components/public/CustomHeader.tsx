import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StatusBar, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomHeaderProps = {
  title: string;
};

export function CustomHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const insets = useSafeAreaInsets();
  
  // 广告牌内容数组
  const billboardTexts = [title, 'CREATED BY XDD'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // 简化的动画值
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // 确定StatusBar样式
  const getStatusBarStyle = () => {
    if (theme === 'dark') {
      return 'light-content';
    }
    return 'dark-content';
  };

  // 方案1: 使用useFocusEffect确保每次聚焦时重新设置StatusBar
  useFocusEffect(
    useCallback(() => {
      // 页面聚焦时设置StatusBar
      StatusBar.setBarStyle(getStatusBarStyle(), true);
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent', true);
      }
      
      return () => {
        // 页面失焦时的清理工作（可选）
      };
    }, [theme])
  );

  const startAnimation = () => {
    // 简单的上下滑动效果
    translateY.value = withSequence(
      withTiming(-40, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      withTiming(40, { duration: 0 }), // 立即移到下方
      withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) })
    );

    opacity.value = withSequence(
      withTiming(0, { duration: 300 }),
      withDelay(100, withTiming(1, { duration: 100 }))
    );
  };

  useEffect(() => {
    // 延迟启动动画
    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        startAnimation();
        
        // 在动画中途更新文本内容
        setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % billboardTexts.length);
        }, 300);
      }, 5000);
    }, 5000);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const pathToMessage = () => {
    router.push('/(logging-in)/(modal)/messageModal');
  };

  return (
    <View className='relative w-full'>
      <LinearGradient
        colors={
          theme === 'dark'
            ? ['#232526', '#414345'] // 深色模式下的渐变色
            : ['#fffbe6', '#e0c3fc'] // 浅色模式下的渐变色
        }
        style={{
          width: '100%',
          minHeight: 35 + insets.top,
          padding: 0,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* 方案2: 使用多个StatusBar组件确保样式正确应用 */}
        <StatusBar 
          backgroundColor="transparent" 
          translucent 
          barStyle={getStatusBarStyle()}
          animated={true}
        />
        
        <View style={{ 
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top,
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        }}>
          
          <View style={{ 
            flex: 3/5, 
            height: 30, 
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Animated.View style={[
              {
                width: '100%',
                justifyContent: 'center',
                alignItems: 'flex-start',
                height: 30,
              },
              animatedStyle,
            ]}>
              <Text style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.textColor,
                textAlign: 'left',
                marginLeft: 10,
              }}>
                {billboardTexts[currentIndex]}
              </Text>
            </Animated.View>
          </View>
          
          <View className='flex-row align-middle mr-2' >
            <Pressable onPress={pathToMessage}>
              <View>
                <AntDesign 
                  name="message1" 
                  size={24} 
                  color={currentTheme.textColor}
                />
              </View>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}