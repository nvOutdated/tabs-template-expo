import { ElectricItem } from '@/store/eboxStore';
import { Text, TouchableOpacity, View } from 'react-native';

interface DeviceSelectorProps {
  selectedDevice: ElectricItem | null;
  onSelectDevice: (device: ElectricItem) => void;
  onSearch: (text: string) => void;
  onEdit: () => void;
  onOperationChange: (operation: 'all' | 'controller' ) => void;
  currentOperation: 'all' | 'controller' ;
}

const DeviceSelector = ({ 
  selectedDevice, 
  onSelectDevice,
  onSearch,
  onEdit,
  onOperationChange,
  currentOperation
}: DeviceSelectorProps) => {
  return (
    <View className="bg-white border-b border-gray-200 mt-1">
      {/* First Row - Device Info and Operations */}
      <View className="px-3 py-1 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => onSelectDevice(selectedDevice || {} as ElectricItem)}
          className="bg-blue-500 px-2 py-3 rounded"
        >
          <Text className="text-white text-xs">切换集中器</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-sm font-medium text-gray-900 leading-tight">{selectedDevice?.name || '未选择集中器'}</Text>
          <Text className="text-xs text-gray-500 leading-tight">编号: {selectedDevice?.device_info.device_code || '-'}</Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => onOperationChange('all')}
            className={`px-2 py-2 rounded ${currentOperation === 'all' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={`text-xs ${currentOperation === 'all' ? 'text-white' : 'text-gray-700'}`}>灯杆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onOperationChange('controller')}
            className={`px-2 py-2 rounded ${currentOperation === 'controller' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={`text-xs ${currentOperation === 'controller' ? 'text-white' : 'text-gray-700'}`}>操作</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Second Row - Search and Edit */}
     {/*  <View className="px-3 pb-1 flex-row items-center space-x-2">
        <TouchableOpacity 
          onPress={() => onSearch('')}
          className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-2 py-2"
        >
          <Ionicons name="search" size={16} color="#666" />
          <Text className="ml-2 text-gray-500 text-xs">搜索当前线路下的单灯</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEdit}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-xs">编辑</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default DeviceSelector;