import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.7;

export type Area = {
  area_id: number;
  name: string;
  children?: Area[];
};

type AreaDrawerProps = {
  visible: boolean;
  onClose: () => void;
  areas: Area[];
  selectedArea: Area;
  onSelectArea: (area: Area) => void;
};

export default function AreaDrawer({
  visible,
  onClose,
  areas,
  selectedArea,
  onSelectArea,
}: AreaDrawerProps) {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  
  // 添加动画值
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const opacity = useSharedValue(0);

  // 监听visible变化
  useEffect(() => {
    if (visible) {
      // 显示抽屉
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      // 隐藏抽屉
      opacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.ease),
      });
      translateX.value = withTiming(-DRAWER_WIDTH, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible]);

  // 创建动画样式
  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      backgroundColor: `rgba(0, 0, 0, ${opacity.value * 0.5})`,
    };
  });

  const renderAreaItem = useCallback(
    (area: Area, level: number = 0) => {
      const isSelected = selectedArea.area_id === area.area_id;
      const hasChildren = area.children && area.children.length > 0;
      return (
        <View key={area.area_id}>
          <TouchableOpacity
            style={[
              styles.areaItem,
              { paddingLeft: 16 + level * 20 },
              isSelected && { backgroundColor: "rgba(0,0,0,0.05)" },
            ]}
            onPress={() => onSelectArea(area)}
          >
            <Text
              style={[
                styles.areaName,
                { color: currentTheme.activeTint },
                isSelected && styles.selectedAreaName,
              ]}
            >
              {area.name}
            </Text>
            {/*  {hasChildren && (
            <Ionicons
              name="chevron-down"
              size={20}
              color={currentTheme.activeTint}
            />
          )} */}
          </TouchableOpacity>
          {hasChildren &&
            area.children?.map((child) => renderAreaItem(child, level + 1))}
        </View>
      );
    },
    [selectedArea, currentTheme.activeTint]
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            height: height - insets.top - insets.bottom,
            width: DRAWER_WIDTH,
          },
          drawerStyle,
        ]}
        className="bg-secondary-300"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.activeTint }]}>
            区域选择
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close"
              size={24}
              color={currentTheme.activeTint}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {areas.map((area) => renderAreaItem(area))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: "absolute",
    left: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  closeButton: {
    padding: 2,
  },
  content: {
    flex: 1,
  },
  areaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 12,
  },
  areaName: {
    fontSize: 14,
  },
  selectedAreaName: {
    fontWeight: "600",
  },
});
