import { useGlobalStore } from '@/store/globalStateStore';
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageModal from '../public/ImageModal';
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
  productId?:number
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

export interface SingleLamp {
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
  line_id: number;
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
  onEdit?: (lamp: SingleLamp) => void;
  onDelete?: (lamp: SingleLamp) => void;
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
  SINGLE_HEAD_CAT1: 'Cat1单头',
  DOUBLE_HEAD_CAT1:'Cat1双头'
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
  onEndReached,
  refreshControl,
  ListEmptyComponent,
  onUpdateSuccess,
  onEdit,
  onDelete,
}: SingleLampListProps) => {
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  // const [previewIndex, setPreviewIndex] = useState(0);
  const [itemId,setItemId] = useState<number>();
  const [previewLampId, setPreviewLampId] = useState<string | undefined>(undefined);
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
      : [];
    setPreviewImages(images);
    setItemId(item.id);
    setPreviewLampId(item.container_id);
    setPreviewVisible(true);
  }, [currentServer]);

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
          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity 
                onPress={() => onEdit(item)} 
                style={[styles.editBtn, { marginRight: 4 }]} 
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>编辑</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                onPress={() => onDelete(item)} 
                style={[styles.deleteBtn, { marginRight: 4 }]} 
                activeOpacity={0.7}
              >
                <Text style={styles.deleteText}>删除</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.expandBtn} activeOpacity={0.7}>
              <Text style={styles.expandText}>{isExpanded ? '收起' : '展开'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.detail}>
            {item.controllers.map(controller => (
              <View key={controller.id} style={styles.controllerBlock}>
                <View style={styles.controllerRow}>
                  <Text style={styles.controllerId}>ID: {controller.controllerId}</Text>
                  <Text style={styles.controllerType}>类型:{getControllerType(controller.controllerType)}</Text>
                  <Text>所属组: {controller.groupIds4Save.join(',')}</Text>
                </View>
                <View style={styles.lampHeader}>
                  <Text style={styles.lampCol}>照明控制</Text>
                  <Text style={styles.lampCol}>上电状态</Text>
                  <Text style={styles.lampCol}>照明类型</Text>
                  <Text style={styles.lampCol}>相序</Text>
                  <Text style={styles.lampCol}>产品ID</Text>
                </View>
                {controller.lamps.map(lamp => (
                  <View key={lamp.id} style={styles.lampRow}>
                    <Text style={styles.lampCol}>{lamp.lightLoop}</Text>
                    <Text style={styles.lampCol}>{getPowerState(controller, lamp.lightLoop)}</Text>
                    <Text style={styles.lampCol}>{getLightingType(lamp.lightingType)}</Text>
                    <Text style={styles.lampCol}>{lamp.phase}</Text>
                    <Text style={styles.lampCol}>{lamp.productId}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [expanded, handleToggle, handleImagePress, currentServer, onEdit, onDelete]);
  
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
      <ImageModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        images={previewImages}
        containerId={previewLampId ? String(previewLampId) : undefined}
        itemId={itemId?itemId:0}
        type="singleLamp"
        onUpdateSuccess={handleImageUpdate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 4, borderRadius: 8, overflow: 'hidden', elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { padding: 6 },
  editText: { color: '#409eff', fontSize: 12 },
  deleteBtn: { padding: 6 },
  deleteText: { color: '#f56c6c', fontSize: 12 },
  expandBtn: { padding: 8 },
  expandText: { color: '#409eff' },
  detail: { backgroundColor: '#f7f7f7', padding: 8 },
  controllerBlock: { marginBottom: 4 },
  controllerRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  controllerId: { fontWeight: 'bold' },
  controllerType: { color: '#409eff' },
  lampHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  lampRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  lampCol: { width: '25%', textAlign: 'center', fontSize: 12 }
});

export default SingleLampList;

