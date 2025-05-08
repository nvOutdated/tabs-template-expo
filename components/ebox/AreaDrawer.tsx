import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

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
  const renderAreaItem = useCallback((area: Area, level: number = 0) => {
    const isSelected = selectedArea.area_id === area.area_id;
    const hasChildren = area.children && area.children.length > 0;
    return (
      <View key={area.area_id}>
        <TouchableOpacity
          style={[
            styles.areaItem,
            { paddingLeft: 16 + level * 20 },
            isSelected && { backgroundColor: 'rgba(0,0,0,0.05)' }
          ]}
          onPress={() => onSelectArea(area)}
        >
          <Text
            style={[
              styles.areaName,
              { color: currentTheme.activeTint },
              isSelected && styles.selectedAreaName
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
        {hasChildren && area.children?.map(child => renderAreaItem(child, level + 1))}
      </View>
    );
  }, [selectedArea, currentTheme.activeTint]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.drawer,
          {
            // backgroundColor: currentTheme.headerBg,
            // top: insets.top + 60,
            height: height - insets.top - insets.bottom,
          },
        ]}
        className="bg-secondary-300"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.activeTint }]}>
            区域选择
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={currentTheme.activeTint} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {areas.map(area => renderAreaItem(area))}
        </View>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    width: width * 0.7,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    padding: 2,
  },
  content: {
    flex: 1,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 12,
  },
  areaName: {
    fontSize: 14,
  },
  selectedAreaName: {
    fontWeight: '600',
  },
}); 