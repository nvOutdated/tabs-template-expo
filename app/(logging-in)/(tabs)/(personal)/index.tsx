import { useTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { themeColors } from "@/constants/themeColors";
import { useWebSocketStore } from "@/store/websocket";
import { getUserInfo, saveToken } from "@/utils/useStorageState";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function PersonIndex() {
  const [userInfo, setUserInfo] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const currentTheme = themeColors[theme as keyof typeof themeColors];
  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        console.log(info, "info");

        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  const logout = async () => {
    await saveToken("");
    useWebSocketStore.getState().disconnect();
    // await saveUserInfo(null);  // 清除用户信息
    router.replace("/is-login");
  };

  return (
    <ScrollView className={`flex-1 bg-background-50 p-4`}>
      {/* 用户信息区域 */}
      <View className="items-center mb-8" style={{ paddingTop: insets.top }}>
        {/* <StatusBar translucent backgroundColor="transparent" /> */}
        <Image
          source={require("@/assets/images/images/amzing.png")}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className={`text-xl font-bold text-typography-700`}>
          {userInfo}
        </Text>
      </View>

      {/* 主题切换按钮 */}
      <TouchableOpacity
        onPress={toggleTheme}
        className={`flex-row items-center justify-center p-4 bg-success-100 rounded-lg mb-4`}
      >
        <Ionicons
          name={theme === "light" ? "sunny" : "moon"}
          size={20}
          color={theme === "light" ? "#000" : "#fff"}
        />
        <Text className={`ml-2 text-lg text-typography-800`}>
          当前主题: {theme}
        </Text>
      </TouchableOpacity>

      {/* 退出登录按钮 */}
      <TouchableOpacity
        onPress={logout}
        className="flex-row items-center justify-center bg-error-500 p-4 rounded-lg"
      >
        <Ionicons name="log-out" size={20} color="white" />
        <Text className="text-white ml-2 text-lg">退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
