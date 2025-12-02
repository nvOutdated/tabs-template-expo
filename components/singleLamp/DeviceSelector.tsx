import { ElectricItem } from '@/store/eboxStore';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface DeviceSelectorProps {
  selectedDevice: ElectricItem | null;
  onSelectDevice: (device: ElectricItem) => void;
  onSearch: (text: string) => void;
  onEdit: () => void;
  onOperationChange: (operation: 'all' | 'controller' ) => void;
  currentOperation: 'all' | 'controller' ;
  hasLine?: boolean;
  onAddLamp?: () => void;
}

const DeviceSelector = ({ 
  selectedDevice, 
  onSelectDevice,
  onSearch,
  onEdit,
  onOperationChange,
  currentOperation,
  hasLine = false,
  onAddLamp,
}: DeviceSelectorProps) => {
  return (
    <View className="bg-background-100 border-b border-outline-200 ">
      {/* First Row - Device Info and Operations */}
      <View className="px-3 py-1 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => onSelectDevice(selectedDevice || {} as ElectricItem)}
          className="bg-blue-500 px-2 py-3 rounded"
        >
          <Text className="text-white text-xs">切换集中器</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-sm font-medium text-primary-900 leading-tight">{selectedDevice?.name || '未选择集中器'}</Text>
          <Text className="text-xs text-primary-500 leading-tight">编号: {selectedDevice?.device_info.device_code || '-'}</Text>
        </View>
        <View className="flex-row items-center space-x-2">
          {hasLine && onAddLamp && currentOperation === 'all' && (
            <TouchableOpacity
              onPress={onAddLamp}
              className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-1"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onOperationChange('all')}
            className={`px-3 py-2 rounded ${currentOperation === 'all' ? 'bg-blue-500' : 'bg-primary-200'}`}
          >
            <Text className={`text-xs ${currentOperation === 'all' ? 'text-white' : 'text-primary-700'}`}>信息</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onOperationChange('controller')}
            className={`px-3 py-2 rounded ${currentOperation === 'controller' ? 'bg-blue-500' : 'bg-primary-200'}`}
          >
            <Text className={`text-xs ${currentOperation === 'controller' ? 'text-white' : 'text-primary-700'}`}>操作</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeviceSelector;