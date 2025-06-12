import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.lampPoleBlock}>
      {/* 灯杆信息头部 */}
      <View style={styles.lampPoleHeader}>
        <Text style={styles.lampPoleName}>{singleLamp.poleName} ({singleLamp.poleCode})</Text>
      </View>

      {/* 控制器列表 */}
      {singleLamp.controllers.map((controller, index) => (
        <React.Fragment key={controller.id}>
          {index > 0 && <View style={styles.controllerDivider} />}
          <TouchableOpacity 
            style={[
              styles.controllerContent,
              isControllerSelected(controller.controllerId) && styles.selectedController
            ]}
            onPress={() => onControllerSelect(singleLamp.id, controller.controllerId)}
            activeOpacity={0.7}
          >
            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <Ionicons 
                name={isControllerSelected(controller.controllerId) ? "checkbox" : "square-outline"} 
                size={24} 
                color={isControllerSelected(controller.controllerId) ? "#409eff" : "#909399"}
              />
            </View>
            {/* 左侧控制器信息 - 垂直排列 */}
            <View style={styles.controllerInfo}>
              <View style={styles.controllerHeader}>
               {controller.domain?
               (<Text style={styles.domainControlId}>ID: {controller.controllerId}</Text>):
               <Text style={styles.controllerId}>ID: {controller.controllerId}</Text>
              }
                
               
              </View>
              <View style={styles.controllerDetails}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>类型：</Text>
                  {getControllerType(controller.controllerType)}
                </Text>
               
                {(
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>A灯状态:</Text>
                    <Text style={{ color: getStateMessage(controller.stateA||'').color }}>{getStateMessage(controller.stateA||'').text}</Text>
                  </Text>
                )}
                {(
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>B灯状态:</Text>
                    <Text style={{ color: getStateMessage(controller.stateB||'').color }}>{getStateMessage(controller.stateB||'').text}</Text>
                  </Text>
                )}
                 <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>所属组：</Text>
                  {controller.groupIds4Save.join(',')}
                </Text>
              </View>
            </View>
            {/* 右侧灯头信息 */}
            <View style={styles.lampInfo}>
              <View style={styles.lampHeader}>
                <Text style={styles.lampCol}>照明控制</Text>
                <Text style={styles.lampCol}>上电状态</Text>
                <Text style={styles.lampCol}>照明类型</Text>
                <Text style={styles.lampCol}>相序</Text>
              </View>
              {controller.lamps.map(lamp => (
                <View key={lamp.id} style={styles.lampRow}>
                  <Text style={styles.lampColValue}>{lamp.lightLoop}</Text>
                  <Text style={{ ...styles.lampColValue, color: getPowerStateWithColor(controller, lamp.lightLoop).color }}>
                    {getPowerState(controller, lamp.lightLoop)}
                  </Text>
                  <Text style={styles.lampColValue}>{getLightingType(lamp.lightingType)}</Text>
                  <Text style={styles.lampColValue}>{lamp.phase}</Text>
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
      <Text className="text-gray-400 text-sm">暂无更多数据</Text>
    </View>
  );

  return (
    <FlatList
      data={singleLamps}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 6,
  },
  lampPoleBlock: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    elevation: 2,
  },
  lampPoleHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lampPoleName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  controllerDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  controllerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectedController: {
    backgroundColor: '#f0f7ff',
  },
  checkboxContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllerInfo: {
    width:'28%',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  controllerHeader: {
    marginBottom: 6,
  },
  controllerId: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
  },
  domainControlId:{
    color:"#67C23A"
  },
  controllerDetails: {
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  detailLabel: {
    color: '#999',
  },
  lampInfo: {
    width:'70%',
    flex: 1,
    minWidth: 'auto',
  },
  lampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  lampRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
  },
  lampCol: {
    width: '25%',
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 4,
  },
  lampColValue: {
    width: '25%',
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 4,
  },
});

export default ControllerInfoCard;