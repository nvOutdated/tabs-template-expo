import { useTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { themeColors } from '@/constants/themeColors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomHeaderProps = {
  title: string;
};

const seaImage = require('@/assets/images/background/birdBgc.png');

export function CustomHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  const insets = useSafeAreaInsets();
  console.log(insets,'insets');
  
  const titleOffset = useSharedValue(0);

  useEffect(() => { 
    // 设置标题轮播动画
    titleOffset.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000, easing: Easing.linear }),
        withTiming(-20, { duration: 1000, easing: Easing.linear }),
        withTiming(-20, { duration: 1000, easing: Easing.linear }), // 增加停留时间
        withTiming(10, { duration: 2000, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: titleOffset.value }],
    };
  });

  const pathToMessage = () => {
    router.push('/(logging-in)/(modal)/messageModal')
  }

  return (
   /*  <ImageBackground 
      source={seaImage}
      resizeMode="cover"
      style={{
        paddingTop: insets.top,
        backgroundColor:currentTheme.headerBg,
      }}
    > */
     
      <View style={{ 
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // backgroundColor:"transparent",
        paddingTop: insets.top,
        backgroundColor:currentTheme.headerBg,
      }}>
         <StatusBar backgroundColor="transparent" translucent />
        <View style={{ flex: 3/5, height: 30, overflow: 'hidden' }}>
          <Animated.View style={[
            { 
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }, 
            animatedTitleStyle
          ]}>
            <View style={{ height: 30, justifyContent: 'center' }}>
              <Text style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.textColor,
                textAlign: 'center'
              }}>
                {title}
              </Text>
            </View>
            <View style={{ height: 30, justifyContent: 'center' }}>
              <Text style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.textColor,
                textAlign: 'center'
              }}>
                {'CREAT BY XDD'}
              </Text>
            </View>
          </Animated.View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         {/*  <Text style={{ 
            fontSize: 12,
            color: '#666',
            marginRight: 10
          }}>
            CREAT BY XDD
          </Text> */}
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
  /*   </ImageBackground> */
  );
}