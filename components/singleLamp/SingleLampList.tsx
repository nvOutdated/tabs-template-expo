import { useGlobalStore } from '@/store/globalStateStore';
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageUploadPreviewModal from '../public/ImageUploadPreviewModal';
const singleLampOffline = require('../../assets/images/street/singleLamp/singleLampOfflin.png');

interface Attachment {
  id: number;
  url: string;
  name: string;
  file_type: string;
}

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
  installTime: string | null;
  lng: number;
  lat: number;
  addr: string | null;
  direction: number;
  controllers: Controller[];
  lamp_attachments?: Attachment[];
  container_id: string;
  computed?: {
    thumbnailSource: any;
    attachments: {
      uri: string;
      id: number;
    }[];
  };
}

interface SingleLampListProps {
  singleLamps: SingleLamp[];
  loading: boolean;
  hasMore: boolean;
  onEndReached: () => void;
  refreshControl?: React.ReactElement<any>;
  ListEmptyComponent?: React.ReactElement;
  onUpdateSuccess?: (updatedData: any) => void;
}

const getPoleType = (type: string) => {
  switch (type) {
    case '1': return '单挑臂';
    case '2': return '双挑臂';
    case '3': return '玉兰灯';
    case '4': return '庭院灯';
    case '5': return '其他';
    default: return '未知';
  }
};
const getDirection = (dir: number) => ({ 1: '东', 2: '南', 3: '西', 4: '北' }[dir] || '未知');
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

const SingleLampList = ({
  singleLamps,
  loading,
  hasMore,
  onEndReached,
  refreshControl,
  ListEmptyComponent,
  onUpdateSuccess,
}: SingleLampListProps) => {
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewLampId, setPreviewLampId] = useState<number | undefined>(undefined);
  const currentServer = useGlobalStore(state => state.currentServer);

  const handleToggle = useCallback((id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleImagePress = useCallback((item: SingleLamp) => {
    const attachments = item.lamp_attachments || [];
    const images = attachments.length > 0 
      ? attachments.map(attachment => ({
          uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}` : '',
          id: attachment.id
        }))
      : [singleLampOffline];
    setPreviewImages(images);
    setPreviewIndex(0);
    setPreviewLampId(item.id);
    setPreviewVisible(true);
  }, [currentServer]);

  const handleUploadSuccess = useCallback((newUri: string) => {
    setPreviewVisible(false);
  }, []);

  const handleImageUpdate = useCallback((updatedLamp: SingleLamp) => {
    if (onUpdateSuccess) {
      onUpdateSuccess(updatedLamp);
    }
  }, [onUpdateSuccess]);
  
  const renderItem = useCallback(({ item }: { item: SingleLamp }) => {
    const isExpanded = !!expanded[item.id];
    const attachments = item.lamp_attachments || [];
    const lampImage = attachments.length > 0 
      ? { 
          uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachments[0].url}` : '',
          id: attachments[0].id
        }
      : singleLampOffline;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleImagePress(item)}>
            <Image source={lampImage} style={styles.image} contentFit="contain" />
          </TouchableOpacity>
          <View style={styles.info}>
            <Text style={styles.title}>{item.poleName}</Text>
            <Text style={styles.sub}>编号: {item.poleCode}</Text>
            <Text style={styles.sub}>类型: {getPoleType(item.poleType)} 方向: {getDirection(item.direction)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.expandBtn} activeOpacity={0.7}>
            <Text style={styles.expandText}>{isExpanded ? '收起' : '展开'}</Text>
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.detail}>
            {item.controllers.map(controller => (
              <View key={controller.id} style={styles.controllerBlock}>
                <View style={styles.controllerRow}>
                  <Text style={styles.controllerId}>ID: {controller.controllerId}</Text>
                  <Text style={styles.controllerType}>{getControllerType(controller.controllerType)}</Text>
                  <Text>组: {controller.groupIds4Save.join(',')}</Text>
                </View>
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
            ))}
          </View>
        )}
      </View>
    );
  }, [expanded, handleToggle, handleImagePress, currentServer]);
  
  const ListFooterComponent = useMemo(() => {
    return (
      <View style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="font-normal text-center">没有更多数据了</Text>
      </View>
    );
  }, []);
  return (
    <>
      <FlatList
        data={singleLamps}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={singleLamps.length === 0 ? { flex: 1 } : { paddingBottom: 40 }}
        ListFooterComponent={ListFooterComponent}
      />
      <ImageUploadPreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        images={previewImages}
        initialIndex={previewIndex}
        uploadType="singleLight"
        containerId={previewLampId ? String(previewLampId) : undefined}
        userInfo={undefined}
        onUploadSuccess={handleUploadSuccess}
        onUpdateSuccess={handleImageUpdate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 4, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  expandBtn: { padding: 8 },
  expandText: { color: '#409eff' },
  detail: { backgroundColor: '#f7f7f7', padding: 12 },
  controllerBlock: { marginBottom: 4 },
  controllerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  controllerId: { fontWeight: 'bold' },
  controllerType: { color: '#409eff' },
  lampHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  lampRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  lampCol: { width: '25%', textAlign: 'center', fontSize: 12 }
});

export default SingleLampList;

