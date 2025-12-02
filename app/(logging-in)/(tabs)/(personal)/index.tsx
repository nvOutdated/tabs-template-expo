import { useCurrentTheme, useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { getUserInfo, saveToken } from "@/utils/useStorageState";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type Theme = 'light' | 'dark' | 'blue' | 'yellow' | 'pink' | 'green';
const themes: { name: Theme; color: string }[] = [
  { name: 'light', color: '#ffffff' },
  { name: 'dark', color: '#000000' },
  // { name: 'blue', color: '#2196F3' },
  // { name: 'yellow', color: '#FFD700' },
  // { name: 'pink', color: '#FF69B4' },
  // { name: 'green', color: '#4CAF50' },
];

export default function PersonIndex() {
  const [userInfo, setUserInfo] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const currentTheme = useCurrentTheme();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        //console.log(info, "info");
        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  const logout = async () => {
    await saveToken("");
    router.replace("/is-login");
  };

  return (
    <View className="flex-1 bg-background-100" style={{ paddingBottom: 80 }}>
      {/* 页面标题 */}
      <View style={{ paddingTop: insets.top, backgroundColor: currentTheme.headerBg }} className="mb-4">
        <Text className="text-2xl font-bold text-primary-500 text-center border-outline-200">个人中心</Text>
        <StatusBar translucent backgroundColor="transparent" barStyle={currentTheme.headerBg === '#fff' ? 'dark-content' : 'light-content'} />
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingBottom: 80, // Add bottom padding to ensure content is scrollable above the button
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 用户信息区域 */}
        <View className="p-4">
          <View className="items-center mb-8 px-4">
            <View className="items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
              <AntDesign name="user" size={32} color="#666" />
            </View>
            <Text 
              className="text-xl font-bold text-typography-700 text-center"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {userInfo}
            </Text>
          </View>
          {/* 主题选择区域 */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4 text-typography-800">主题选择</Text>
            <View className="flex-row flex-wrap justify-between">
              {themes.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => setTheme(item.name)}
                  style={styles.themeItem}
                >
                  <View
                    style={[
                      styles.colorBox,
                      { backgroundColor: item.color },
                      theme === item.name && styles.selectedBox
                    ]}
                  />
                  <Text
                    style={[
                      styles.themeName,
                      theme === item.name && styles.selectedText
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 退出登录按钮 - 固定在底部 */}
      <View 
        className="w-full px-4 mb-8 bg-background-100" 
        style={{ 
          paddingBottom: (insets.bottom > 0 ? insets.bottom : 16) + 20, // Add extra bottom padding
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center justify-center bg-error-500 p-4 rounded-lg"
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text className="text-white ml-2 text-lg">退出登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  themeItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 100,
    height: 40,
    borderRadius: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedBox: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  themeName: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
