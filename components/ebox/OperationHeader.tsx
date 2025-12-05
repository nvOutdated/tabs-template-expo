import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type OperationHeaderProps = {
  handleSetShowDrawer: () => void;
  onToggleOperationMode: () => void;
  selectedDevicesCount: number;
};

export default function OperationHeader({
  handleSetShowDrawer,
  onToggleOperationMode,
  selectedDevicesCount = 0
}: OperationHeaderProps) {
  const currentTheme = useCurrentTheme();

  return (
    <View style={[styles.header]} className="bg-secondary-400">
      <TouchableOpacity
        style={styles.drawerButton}
        onPress={() => handleSetShowDrawer()}
      >
        <Ionicons name="menu" size={24} color={currentTheme.activeTint} />
        <Text className="text-tertiary-500 ml-1 align-middle font-medium">
          设备列表
        </Text>
      </TouchableOpacity>

      <View style={styles.centerContainer}>
        <Text style={[styles.deviceCount, { color: currentTheme.activeTint }]}>
          已选择设备: {selectedDevicesCount}
        </Text>
      </View>

      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={styles.operationButton}
          onPress={onToggleOperationMode}
        >
          <Text style={[styles.operationText, { color: currentTheme.activeTint }]}>
            退出操作
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  drawerButton: {
    padding: 4,
    flexDirection: 'row',
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  deviceCount: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationButton: {
    padding: 4,
    marginRight: 4,
  },
  operationText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 