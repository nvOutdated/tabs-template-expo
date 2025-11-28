import { Ebox } from '@/components/collection/CollectionEboxDrawer';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface CollectionDeviceSelectorProps {
  selectedEbox: Ebox | null;
  onSelectDevice: () => void;
  onAddLamp?: () => void;
  hasLine?: boolean;
}

const CollectionDeviceSelector = ({ 
  selectedEbox, 
  onSelectDevice,
  onAddLamp,
  hasLine = false,
}: CollectionDeviceSelectorProps) => {
  return (
    <View className="bg-white border-b border-gray-200 mt-1">
      {/* First Row - Device Info and Operations */}
      <View className="px-3 py-1 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onSelectDevice}
          className="bg-blue-500 px-2 py-3 rounded"
        >
          <Text className="text-white text-xs">切换集中器</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-sm font-medium text-gray-900 leading-tight">
            {selectedEbox ? `${selectedEbox.name} (${selectedEbox.sn})` : '未选择集中器'}
          </Text>
          <Text className="text-xs text-gray-500 leading-tight">
            {selectedEbox ? `编号: ${selectedEbox.sn}` : '-'}
          </Text>
        </View>
        {hasLine && onAddLamp && (
          <TouchableOpacity
            onPress={onAddLamp}
            className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-1"
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CollectionDeviceSelector;

