import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Slot } from "expo-router";
import { View } from "react-native";
export default function GisLayout() {
  const currentTheme = useCurrentTheme();
  return (
    <View className="flex-1">
     
        <View className="flex-1">
          <Slot />
      </View>
    </View>
  );
}