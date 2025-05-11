import { Slot } from "expo-router";
import { View } from "react-native";
export default function GisLayout() {
  return (
    <View className="flex-1">
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}