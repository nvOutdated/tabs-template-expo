import { useGlobalStore } from '@/store/globalStateStore';
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import EboxImageModal from "./EboxImageModal";

type ImageSource = {
  uri?: string;
  default?: any;
};

type Attachment = {
  id: number;
  name: string;
  url: string;
  file_type: string;
};

type ElectricItem = {
  id: number;
  sn: string;
  name: string;
  addr: string;
  device_info: {
    device_code: string;
    online: boolean;
    open: boolean;
    warn: boolean;
    loops: boolean[];
  };
  container_id:number;
  ebox_attachments?: Attachment[];
};

type Props = {
  electricBoxes: ElectricItem[];
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<RefreshControl["props"]>;
  loading: boolean;
  hasMore?: boolean;
  onEboxUpdate?: (updatedEbox: ElectricItem) => void;
  userInfo:string;
};

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 120; // 压缩后的卡片高度
const centralControllerImage = require("@/assets/images/street/electricBox/centralController.png");

// 添加状态配置常量
const DEVICE_STATUS = {
  OFFLINE: {
    condition: (info: ElectricItem['device_info']) => !info.online && !info.open && !info.warn,
    label: '离线',
    dotStyle: 'offline',
    textStyle: 'offlineText'
  },
  ONLINE: {
    condition: (info: ElectricItem['device_info']) => info.online && !info.open && !info.warn,
    label: '在线',
    dotStyle: 'online',
    textStyle: 'onlineText'
  },
  OPEN: {
    condition: (info: ElectricItem['device_info']) => info.online && info.open && !info.warn,
    label: '打开',
    dotStyle: 'open',
    textStyle: 'openText'
  },
  WARN: {
    condition: (info: ElectricItem['device_info']) => info.online && info.warn,
    label: '报警',
    dotStyle: 'warn',
    textStyle: 'warnText'
  }
} as const;

export default function EboxList({
  electricBoxes,
  onEndReached,
  refreshControl,
  loading,
  hasMore = true,
  onEboxUpdate,
  userInfo
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageSource[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentServer = useGlobalStore(state => state.currentServer);
  // 使用 useRef 存储不需要触发重渲染的值
  const modalRef = useRef({
    setVisible: (visible: boolean) => setModalVisible(visible),
    setImages: (images: ImageSource[]) => setSelectedImages(images),
    setIndex: (index: number) => setSelectedIndex(index)
  });

  const handleImagePress = (images: ImageSource[], index: number = 0) => {
    setSelectedImages(images);
    setSelectedIndex(index);
    setModalVisible(true);
  };
  const getConfigurationDetails = (item: ElectricItem) => {
    router.push({
      pathname: "/(logging-in)/(modal)/configuration",
      params: {
        item: JSON.stringify(item),
      },
    });
  };
//   useEffect(()=>{
//     console.log(smartLight,"返回数据");
    
//  },[smartLight])
  // Memoized ebox item component for better performance
  const ElectricItem = memo(({ item }: { item: ElectricItem }) => {
    const getImages = useCallback(() => {
      const attachments = item.ebox_attachments || [];
      if (attachments.length === 0) {
        return [centralControllerImage];
      }
      return attachments.map(attachment => ({
        uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}` : ''
      }));
    }, [item.ebox_attachments, currentServer]);
    
    const images = getImages();
    const thumbnailSource = images[0];
    
    return (
      <View >
        <Pressable style={styles.card} className="bg-background-50">
          <View style={styles.containerTitle}>
            <Text
              style={styles.title}
              className="text-info-500"
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          <View style={styles.pointConfig}>
            <Pressable
              style={styles.configButton}
              onPress={() => getConfigurationDetails(item)}
            >
              <Ionicons name="settings-outline" size={20} color="#409eff" />
              <Text style={styles.configButtonText}>组态</Text>
            </Pressable>
          </View>
          <View style={styles.imageRowContainer}>
            <Pressable
              style={styles.thumbnailContainer}
              onPress={() => handleImagePress(images)}
            >
              <Image
                source={thumbnailSource}
                style={styles.thumbnail}
                contentFit="contain"
              />
            </Pressable>

            <View style={styles.infoContainer}>
              <Text
                style={styles.code}
                className="text-tertiary-900"
                numberOfLines={1}
              >
                编号: {item.device_info.device_code}
              </Text>
              <Text
                style={styles.address}
                className="text-tertiary-900"
                numberOfLines={1}
              >
                位置: {item.addr}
              </Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText} className="text-tertiary-900">状态: </Text>
                {Object.values(DEVICE_STATUS).map((status) => 
                  status.condition(item.device_info) && (
                    <View key={status.label} className=" flex-row items-center">
                      <View style={[styles.statusDot, styles[status.dotStyle]]} />
                      <Text style={[styles.statusText, styles[status.textStyle]]}>
                        {status.label}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <View style={styles.loopsContainer}>
                <Text style={styles.loopsTitle} className="text-tertiary-900">回路:</Text>
                <View style={styles.loopsGrid}>
                  {item.device_info.loops.map((loop, index) => (
                    <View key={index} style={styles.loopItem}>
                      <View
                        style={[
                          styles.loopDot,
                          loop ? styles.loopActive : styles.loopInactive,
                        ]}
                      >
                        <Text style={styles.loopNumber}>{index + 1}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  });

  ElectricItem.displayName = "ElectricItem";

  // Memoized renderItem function
  const renderItem = useCallback(
    ({ item }: { item: ElectricItem }) => 
    <ElectricItem item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ElectricItem) => item.id.toString(),
    []
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无电箱数据</Text>
      </View>
    ),
    []
  );

  const ListFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        {loading && electricBoxes.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#409eff" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : electricBoxes.length === 0 ? (
          <Text style={styles.footerText}>暂无数据</Text>
        ) : !hasMore ? (
          <Text style={styles.footerText}>没有更多数据了</Text>
        ) : null}
      </View>
    ),
    [loading, electricBoxes.length, hasMore]
  );

  const getItemLayout = (data: any, index: number) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  });

  return (
    <>
      <FlatList
        data={electricBoxes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          electricBoxes.length === 0 && styles.emptyContainer
        ]}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
      />
      <EboxImageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        images={selectedImages}
        initialIndex={selectedIndex}
        containerId={electricBoxes[selectedIndex]?.container_id.toString()}
        onEboxUpdate={onEboxUpdate}
        userInfo={userInfo}
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  container: {
    padding: CARD_MARGIN,
    paddingBottom: 50,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: CARD_MARGIN,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
  },
  imageRowContainer: {
    flexDirection: "row",
    flex: 1,
  },
  containerTitle: {
    // flex: 1,
    width: "100%",
    padding: 0,
    justifyContent: "space-between",
  },
  thumbnailContainer: {
    width: CARD_WIDTH * 0.3,
    height: CARD_HEIGHT - 40,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  pointConfig: {
    position: "absolute",
    right: 10,
    top: 5,
    // marginLeft: 10,
  },
  configButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(64, 158, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(64, 158, 255, 0.2)",
  },
  configButtonText: {
    color: "#409eff",
    marginLeft: 4,
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
    width: CARD_WIDTH * 0.7,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    lineHeight:8,
  },
  online: {
    backgroundColor: "#52c41a",
  },
  offline: {
    backgroundColor: "#909399",
  },
  open: {
    backgroundColor: "#E6A23C",
  },
  warn: {
    backgroundColor: "#F56C6C",
  },
  onlineText: {
    color: "#52c41a",
  },
  openText:{
    color:"#E6A23C"
  },
  offlineText: {
    color: "#909399",
  },
  warnText:{
     color:"#F56C6C"
  },
  loopsContainer: {
    // marginTop: 4,
    width: "80%",
    flexDirection: "row",
  },
  loopsTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  loopsGrid: {
    width: "80%",
    flexDirection: "row",
    // flexWrap: 'none',
    gap: 1,
  },
  loopItem: {
    alignItems: "center",
    width: 24,
    textAlign: "center",
  },
  loopDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 2,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loopActive: {
    backgroundColor: "#409eff",
    textAlign: "center",
  },
  loopInactive: {
    backgroundColor: "#d9d9d9",
    textAlign: "center",
  },
  loopNumber: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
