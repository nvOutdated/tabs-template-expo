import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

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

interface ControllerInfoCardProps {
  controllers: Controller[];
}

const ControllerItem = ({ controller }: { controller: Controller }) => (
  <View style={styles.controllerBlock}>
    <View style={styles.controllerContent}>
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
         {/*  {controller.domain && (
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>域：</Text>
              {controller.domain}
            </Text>
          )} */}
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
  </View>
);

const ControllerInfoCard: React.FC<ControllerInfoCardProps> = ({ controllers }) => {
  const renderItem = ({ item }: { item: Controller }) => (
    <ControllerItem controller={item} />
  );

  return (
    <FlatList
      data={controllers}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
  },
  controllerBlock: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  controllerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controllerInfo: {
    width: '30%',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  controllerHeader: {
    marginBottom: 8,
  },
  controllerId: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  controllerDetails: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  detailLabel: {
    color: '#999',
  },
  lampInfo: {
    flex: 1,
    minWidth: '65%',
  },
  lampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#f5f7fa',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  lampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lampCol: {
    width: '25%',
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
  },
});

export default ControllerInfoCard; 