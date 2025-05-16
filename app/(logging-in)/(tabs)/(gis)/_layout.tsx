import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";
export default function GisLayout() {
  const currentTheme = useCurrentTheme();
  return (
    <View className="flex-1">
       <StatusBar translucent backgroundColor={currentTheme.headerBg} barStyle={currentTheme.headerBg === '#fff' ? 'dark-content' : 'light-content'}/>
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}