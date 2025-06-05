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

const getPowerState = (ctrl: Controller, loop: string) => {
  if (loop === 'A') return ctrl.powerOnA ? '开' : '关';
  if (loop === 'B') return ctrl.powerOnB ? '开' : '关';
  return '未知';
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
  onControllerSelect: (lampId: number, controllerId: number) => void;
}) => {
  const isControllerSelected = (controllerId: number) => {
    return selectedControllers.some(
      sc => sc.lampId === singleLamp.id && sc.controllerId === controllerId
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
          <View style={styles.controllerContent}>
            {/* Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => onControllerSelect(singleLamp.id, controller.id)}
            >
              <Ionicons 
                name={isControllerSelected(controller.id) ? "checkbox" : "square-outline"} 
                size={24} 
                color={isControllerSelected(controller.id) ? "#409eff" : "#909399"}
              />
            </TouchableOpacity>
            {/* 左侧控制器信息 - 垂直排列 */}
            <View style={styles.controllerInfo}>
              <View style={styles.controllerHeader}>
                <Text style={styles.controllerId}>ID: {controller.controllerId}</Text>
              </View>
              <View style={styles.controllerDetails}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>类型：</Text>
                  {getControllerType(controller.controllerType)}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>组：</Text>
                  {controller.groupIds4Save.join(',')}
                </Text>
                {controller.stateA && (
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>状态A：</Text>
                    {controller.stateA}
                  </Text>
                )}
                {controller.stateB && (
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>状态B：</Text>
                    {controller.stateB}
                  </Text>
                )}
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
                  <Text style={styles.lampCol}>{lamp.lightLoop}</Text>
                  <Text style={styles.lampCol}>{getPowerState(controller, lamp.lightLoop)}</Text>
                  <Text style={styles.lampCol}>{getLightingType(lamp.lightingType)}</Text>
                  <Text style={styles.lampCol}>{lamp.phase}</Text>
                </View>
              ))}
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const ControllerInfoCard: React.FC<ControllerInfoCardProps> = ({ 
  singleLamps,
  onSelectionChange,
  selectedControllers: externalSelectedControllers 
}) => {
  const [internalSelectedControllers, setInternalSelectedControllers] = useState<{ lampId: number; controllerId: number }[]>([]);

  // 同步外部选中状态
  useEffect(() => {
    if (externalSelectedControllers) {
      setInternalSelectedControllers(externalSelectedControllers);
    }
  }, [externalSelectedControllers]);

  const handleControllerSelect = (lampId: number, controllerId: number) => {
    setInternalSelectedControllers(prev => {
      const isSelected = prev.some(
        sc => sc.lampId === lampId && sc.controllerId === controllerId
      );
      
      let newSelection;
      if (isSelected) {
        newSelection = prev.filter(
          sc => !(sc.lampId === lampId && sc.controllerId === controllerId)
        );
      } else {
        newSelection = [...prev, { lampId, controllerId }];
      }
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  const renderItem = ({ item }: { item: SingleLamp }) => (
    <LampPoleItem 
      singleLamp={item} 
      selectedControllers={externalSelectedControllers || internalSelectedControllers}
      onControllerSelect={handleControllerSelect}
    />
  );

  return (
    <FlatList
      data={singleLamps}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
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
    padding: 8,
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
    marginBottom: 6,
    backgroundColor: '#f5f7fa',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  lampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lampCol: {
    width: '25%',
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    flexShrink: 0,
    flexGrow: 0,
  },
});

export default ControllerInfoCard; 