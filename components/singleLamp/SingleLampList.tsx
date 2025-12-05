import { useGlobalStore } from '@/store/globalStateStore';
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
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
  productId?: number
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
  DOUBLE_HEAD_CAT1: 'Cat1双头'
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
  const [itemId, setItemId] = useState<number>();
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
      <View className='m-1 rounded-lg overflow-hidden shadow-sm bg-background-0'>
        <View className='flex-row items-center p-2'>
          <TouchableOpacity onPress={() => handleImagePress(item)} className="w-[60px] h-[60px] rounded-lg bg-background-100 overflow-hidden mr-3">
            <Image source={lampImage} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          </TouchableOpacity>
          <View className='flex-1'>
            <Text className='text-base font-bold text-typography-900'>{item.poleName}</Text>
            <Text className='text-xs text-typography-500 mt-0.5'>编号: {item.poleCode}</Text>
            <Text className='text-xs text-typography-500 mt-0.5'>类型: {getPoleType(item.poleType)} 方向: {getDirection(item.direction)}</Text>
          </View>
          <View className='flex-row items-center'>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(item)}
                className='p-1.5 mr-1'
                activeOpacity={0.7}
              >
                <Text className='text-info-500 text-xs'>编辑</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(item)}
                className='p-1.5 mr-1'
                activeOpacity={0.7}
              >
                <Text className='text-error-500 text-xs'>删除</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleToggle(item.id)} className='p-2' activeOpacity={0.7}>
              <Text className='text-info-500'>{isExpanded ? '收起' : '展开'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <View className='p-2 bg-background-50'>
            {item.controllers.map(controller => (
              <View key={controller.id} className='mb-1'>
                <View className='flex-row justify-around mb-1'>
                  <Text className='font-bold text-typography-900'>ID: {controller.controllerId}</Text>
                  <Text className='text-info-500'>类型:{getControllerType(controller.controllerType)}</Text>
                  <Text className='text-typography-700'>所属组: {controller.groupIds4Save.join(',')}</Text>
                </View>
                <View className='flex-row justify-between mt-1'>
                  <Text className='w-1/5 text-center text-xs text-typography-700'>照明控制</Text>
                  <Text className='w-1/5 text-center text-xs text-typography-700'>上电状态</Text>
                  <Text className='w-1/5 text-center text-xs text-typography-700'>照明类型</Text>
                  <Text className='w-1/5 text-center text-xs text-typography-700'>相序</Text>
                  <Text className='w-1/5 text-center text-xs text-typography-700'>产品ID</Text>
                </View>
                {controller.lamps.map(lamp => (
                  <View key={lamp.id} className='flex-row justify-between mt-0.5'>
                    <Text className='w-1/5 text-center text-xs text-typography-700'>{lamp.lightLoop}</Text>
                    <Text className='w-1/5 text-center text-xs text-typography-700'>{getPowerState(controller, lamp.lightLoop)}</Text>
                    <Text className='w-1/5 text-center text-xs text-typography-700'>{getLightingType(lamp.lightingType)}</Text>
                    <Text className='w-1/5 text-center text-xs text-typography-700'>{lamp.phase}</Text>
                    <Text className='w-1/5 text-center text-xs text-typography-700'>{lamp.productId}</Text>
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
      <View className="py-5 justify-center items-center">
        <Text className="font-normal text-center text-typography-500">没有更多数据了</Text>
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
        itemId={itemId ? itemId : 0}
        type="singleLamp"
        onUpdateSuccess={handleImageUpdate}
      />
    </>
  );
};



export default SingleLampList;

