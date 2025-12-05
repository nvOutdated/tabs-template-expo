import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface Lamp {
  id: number;
  lightLoop: string;
  lightingType: number;
  cfgId: number;
  cfgName: string | null;
  cfgMatched: boolean;
  phase: string;
  phaseMatched: boolean;
}

interface Controller {
  id: number;
  controllerId: string;
  controllerType: string;
  groupIds4Save: number[];
  groupIds4Detect: number[];
  lamps: Lamp[];
  domain: string | null;
  stateA: string | null;
  stateB: string | null;
  powerOnA: boolean | null;
  powerOnB: boolean | null;
}

interface SingleLamp {
  id: number;
  poleName: string;
  poleCode: string;
  poleType: string;
  controllers: Controller[];
}

const getControllerType = (type: string) => ({
  SINGLE_HEAD_PLC: 'PLC单头',
  DOUBLE_HEAD_PLC: 'PLC双头',
  SINGLE_HEAD_4G: '4G单头',
  SINGLE_HEAD_ZIGBEE: 'ZIGBEE单灯',
  SINGLE_HEAD_CAT1: 'Cat1单头'
}[type] || type);

const getPowerStateWithColor = (ctrl: Controller, loop: string) => {
  const state = loop === 'A' ? ctrl.powerOnA : ctrl.powerOnB;
  return {
    text: state ? '开' : '关',
    color: state ? '#67C23A' : '#000000'
  };
};

const getPowerState = (ctrl: Controller, loop: string) => {
  return getPowerStateWithColor(ctrl, loop).text;
};

const getLightingType = (type: number) => ({
  0: '未知', 1: '机动车', 2: '非机动车', 3: '顶部灯', 4: '节日灯', 5: '其他'
}[type] || '未知');

const getPoleType = (type: string) => ({
  '1': '单挑臂',
  '2': '双挑臂',
  '3': '玉兰灯',
  '4': '庭院灯',
  '5': '其他'
}[type] || '未知');
const getStateMessage = (state?: string) => {
  const stateMap: Record<string, { text: string; color: string }> = {
    'SINGLE_STATE_ERR': { text: '故障', color: '#ff0000' },  // Red for error
    'SINGLE_STATE_ON': { text: '开启', color: '#67C23A' },   // Yellow for on
    'SINGLE_STATE_OFF': { text: '关闭', color: '#000000' },  // Black for off
    'SINGLE_STATE_WAIT': { text: '检测中', color: '#0000ff' } // Blue for waiting
  };
  return state ? stateMap[state] || { text: '', color: '#000000' } : { text: '', color: '#000000' };
};
interface ControllerInfoCardProps {
  singleLamps: SingleLamp[];
  onSelectionChange?: (selectedControllers: { lampId: number; controllerId: number }[]) => void;
  selectedControllers?: { lampId: number; controllerId: number }[];
}

const LampPoleItem = ({
  singleLamp,
  selectedControllers,
  onControllerSelect
}: {
  singleLamp: SingleLamp;
  selectedControllers: { lampId: number; controllerId: number }[];
  onControllerSelect: (lampId: number, controllerId: string) => void;
}) => {
  const isControllerSelected = (controllerId: string) => {
    return selectedControllers.some(
      sc => sc.lampId === singleLamp.id && sc.controllerId === Number(controllerId)
    );
  };

  return (
    <View className="mb-2 bg-background-0 rounded-lg p-1 shadow-sm">
      {/* 灯杆信息头部 */}
      <View className="mb-2 pb-1.5 border-b border-outline-100">
        <Text className="text-[15px] font-bold text-typography-900">{singleLamp.poleName} ({singleLamp.poleCode})</Text>
      </View>

      {/* 控制器列表 */}
      {singleLamp.controllers.map((controller, index) => (
        <React.Fragment key={controller.id}>
          {index > 0 && <View className="h-[1px] bg-outline-100 my-2" />}
          <TouchableOpacity
            className={`flex-row justify-between items-center px-0.5 py-2 rounded-md ${isControllerSelected(controller.controllerId) ? 'bg-info-50' : ''
              }`}
            onPress={() => onControllerSelect(singleLamp.id, controller.controllerId)}
            activeOpacity={0.7}
          >
            {/* Checkbox */}
            <View className="w-8 items-center justify-center">
              <Ionicons
                name={isControllerSelected(controller.controllerId) ? "checkbox" : "square-outline"}
                size={24}
                color={isControllerSelected(controller.controllerId) ? "#409eff" : "#909399"}
              />
            </View>
            {/* 左侧控制器信息 - 垂直排列 */}
            <View className="w-[28%] mr-2 pr-2 border-r border-outline-100">
              <View className="mb-1.5">
                {controller.domain ?
                  (<Text className="font-bold text-[13px] text-success-500">ID: {controller.controllerId}</Text>) :
                  <Text className="font-bold text-[13px] text-typography-900">ID: {controller.controllerId}</Text>
                }


              </View>
              <View className="mt-0.5">
                <Text className="text-xs text-typography-600 mb-1 leading-4">
                  <Text className="text-typography-400">类型：</Text>
                  {getControllerType(controller.controllerType)}
                </Text>

                {(
                  <Text className="text-xs text-typography-600 mb-1 leading-4">
                    <Text className="text-typography-400">A灯状态:</Text>
                    <Text style={{ color: getStateMessage(controller.stateA || '').color }}>{getStateMessage(controller.stateA || '').text}</Text>
                  </Text>
                )}
                {(
                  <Text className="text-xs text-typography-600 mb-1 leading-4">
                    <Text className="text-typography-400">B灯状态:</Text>
                    <Text style={{ color: getStateMessage(controller.stateB || '').color }}>{getStateMessage(controller.stateB || '').text}</Text>
                  </Text>
                )}
                <Text className="text-xs text-typography-600 mb-1 leading-4">
                  <Text className="text-typography-400">所属组：</Text>
                  {controller.groupIds4Save.join(',')}
                </Text>
              </View>
            </View>
            {/* 右侧灯头信息 */}
            <View className="w-[70%] flex-1 min-w-0">
              <View className="flex-row justify-between mb-0.5">
                <Text className="w-1/4 text-center text-xs text-typography-600 font-medium shrink-0 py-1">照明控制</Text>
                <Text className="w-1/4 text-center text-xs text-typography-600 font-medium shrink-0 py-1">上电状态</Text>
                <Text className="w-1/4 text-center text-xs text-typography-600 font-medium shrink-0 py-1">照明类型</Text>
                <Text className="w-1/4 text-center text-xs text-typography-600 font-medium shrink-0 py-1">相序</Text>
              </View>
              {controller.lamps.map(lamp => (
                <View key={lamp.id} className="flex-row border-b border-outline-200 py-1">
                  <Text className="w-1/4 text-center text-xs text-typography-900 shrink-0 py-1">{lamp.lightLoop}</Text>
                  <Text className="w-1/4 text-center text-xs shrink-0 py-1" style={{ color: getPowerStateWithColor(controller, lamp.lightLoop).color }}>
                    {getPowerState(controller, lamp.lightLoop)}
                  </Text>
                  <Text className="w-1/4 text-center text-xs text-typography-900 shrink-0 py-1">{getLightingType(lamp.lightingType)}</Text>
                  <Text className="w-1/4 text-center text-xs text-typography-900 shrink-0 py-1">{lamp.phase}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
};

const ControllerInfoCard: React.FC<ControllerInfoCardProps> = ({
  singleLamps,
  onSelectionChange,
  selectedControllers: externalSelectedControllers,
}) => {
  const [internalSelectedControllers, setInternalSelectedControllers] = useState<{ lampId: number; controllerId: number }[]>([]);

  // 同步外部选中状态
  useEffect(() => {
    if (externalSelectedControllers) {
      setInternalSelectedControllers(externalSelectedControllers);
    }
  }, [externalSelectedControllers]);

  const handleControllerSelect = (lampId: number, controllerId: string) => {
    const currentSelection = externalSelectedControllers || internalSelectedControllers;
    const isSelected = currentSelection.some(
      sc => sc.lampId === lampId && sc.controllerId === Number(controllerId)
    );

    const newSelection: { lampId: number; controllerId: number }[] = isSelected
      ? [] // 如果已经选中，则取消选中
      : [{ lampId, controllerId: Number(controllerId) }]; // 如果未选中，则只选中当前控制器

    setInternalSelectedControllers(newSelection);
    onSelectionChange?.(newSelection);
  };

  const renderItem = ({ item }: { item: SingleLamp }) => (
    <LampPoleItem
      singleLamp={item}
      selectedControllers={externalSelectedControllers || internalSelectedControllers}
      onControllerSelect={handleControllerSelect}
    />
  );

  const ListFooterComponent = () => (
    <View className="py-1 items-center">
      <Text className="text-typography-400 text-sm">暂无更多数据</Text>
    </View>
  );

  return (
    <FlatList
      data={singleLamps}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 6, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={ListFooterComponent}
    />
  );
};



export default ControllerInfoCard;