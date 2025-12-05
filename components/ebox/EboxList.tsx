import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import ImageModal from "../public/ImageModal";
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

type DeviceStatusStyle = {
  dotStyle: 'online' | 'offline' | 'open' | 'warn';
  textStyle: 'onlineText' | 'offlineText' | 'openText' | 'warnText';
};

type DeviceStatus = {
  condition: (info: any) => boolean;
  label: string;
  dotStyle: DeviceStatusStyle['dotStyle'];
  textStyle: DeviceStatusStyle['textStyle'];
  module: string;
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
  container_id: number;
  ebox_attachments?: Attachment[];
  computed: {
    thumbnailSource: ImageSource;
    deviceStatus: DeviceStatus;
    attachments: {
      uri: string;
      id: number;
    }[];
  };
};

type Props = {
  electricBoxes: ElectricItem[];
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<RefreshControl["props"]>;
  loading: boolean;
  hasMore?: boolean;
  onUpdateEbox?: (updatedEbox: any) => void;
  onEditEbox?: (ebox: any) => void;
  onDeleteEbox?: (ebox: ElectricItem) => void;
  setIsAnyItemEditing: (params: boolean) => void;
  isAnyItemEditing: boolean
};

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 120;

export default function EboxList({
  electricBoxes,
  onEndReached,
  refreshControl,
  loading,
  hasMore = true,
  onUpdateEbox,
  onEditEbox,
  onDeleteEbox,
  setIsAnyItemEditing,
  isAnyItemEditing,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageSource[]>([]);
  const [selectedEbox, setSelectedEbox] = useState<ElectricItem | null>(null);
  // const [isAnyItemEditing, setIsAnyItemEditing] = useState(false);
  const handleImagePress = useCallback((images: ImageSource[], ebox: ElectricItem) => {
    setSelectedImages(images);
    setSelectedEbox(ebox);
    setModalVisible(true);
  }, []);

  const getConfigurationDetails = useCallback((item: ElectricItem) => {
    router.push({
      pathname: "/(logging-in)/(modal)/configuration",
      params: {
        item: JSON.stringify(item),
      },
    });
  }, []);

  const handleImageUpdate = useCallback((updatedEbox: any) => {
    if (onUpdateEbox) {
      onUpdateEbox(updatedEbox);
    }
  }, [onUpdateEbox]);

  // 优化后的 ElectricItem 组件
  const ElectricItem = memo(({ item }: { item: ElectricItem }) => {
    const [showActions, setShowActions] = useState(false);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    const handleConfigPress = useCallback(() => {
      getConfigurationDetails(item);
    }, [item]);

    const handleImagePressLocal = useCallback(() => {
      const images = item.computed.attachments || [];
      handleImagePress(images, item);
    }, [item.computed.attachments, handleImagePress]);

    const handleEdit = useCallback(() => {
      if (onEditEbox) {
        onEditEbox(item);
      }
      // setShowActions(false);
    }, [item, onEditEbox]);

    const handleDelete = useCallback(() => {
      if (onDeleteEbox) {
        onDeleteEbox(item);
      }
      // setShowActions(false);
    }, [item, onDeleteEbox]);

    const toggleActions = useCallback(() => {
      const newShowActions = !showActions;
      setShowActions(newShowActions);
      setIsAnyItemEditing(newShowActions);

      if (newShowActions) {
        translateX.value = withSpring(40, {
          damping: 15,
          stiffness: 100,
          mass: 0.5
        });
        scale.value = withSpring(0.98, {
          damping: 15,
          stiffness: 100,
          mass: 0.5
        });
        opacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
      } else {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
          mass: 0.5
        });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 100,
          mass: 0.5
        });
        opacity.value = withTiming(40, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
      }
    }, [showActions]);

    const longPressGesture = Gesture.LongPress()
      .minDuration(500)
      .onStart(() => {
        runOnJS(toggleActions)();
      });

    const tapGesture = Gesture.Tap()
      .onStart(() => {
        if (showActions) {
          runOnJS(toggleActions)();
        }
      });

    const composed = Gesture.Simultaneous(longPressGesture, tapGesture);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { scale: scale.value }
        ],
      };
    });

    // const actionButtonsStyle = useAnimatedStyle(() => {
    //   return {
    //     opacity: opacity.value,
    //     transform: [
    //       { translateX: withSpring(showActions ? 0 : 40, {
    //         damping: 15,
    //         stiffness: 100,
    //         mass: 0.5
    //       }) }
    //     ]
    //   };
    // });

    // 在组件内部计算回路状态
    const loopElements = useMemo(() => {
      return item.device_info.loops.map((loop: boolean, index: number) => (
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
      ));
    }, [item.device_info.loops]);

    return (
      <View>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <Pressable style={styles.card} className="bg-background-50">
              <View style={styles.containerTitle}>
                <Text
                  style={styles.title}
                  className="text-info-500 ml-2"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              <View style={styles.pointConfig}>
                <Pressable
                  style={styles.configButton}
                  onPress={handleConfigPress}
                >
                  <Ionicons name="settings-outline" size={20} color="#409eff" />
                  <Text style={styles.configButtonText}>组态</Text>
                </Pressable>
              </View>

              <View style={styles.imageRowContainer}>
                <Pressable
                  style={styles.thumbnailContainer}
                  onPress={handleImagePressLocal}
                >
                  <Image
                    source={item.computed.thumbnailSource}
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
                    {item.computed.deviceStatus && (
                      <View className="flex-row items-center">
                        <View style={[styles.statusDot, styles[item.computed.deviceStatus.dotStyle]]} />
                        <Text style={[styles.statusText, styles[item.computed.deviceStatus.textStyle]]}>
                          {item.computed.deviceStatus.label}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.loopsContainer}>
                    <Text style={styles.loopsTitle} className="text-tertiary-900">回路:</Text>
                    <View style={styles.loopsGrid}>
                      {loopElements}
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
            <Animated.View style={[styles.actionButtons]}>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </Pressable>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  });

  ElectricItem.displayName = "ElectricItem";

  const renderItem = useCallback(
    ({ item }: { item: ElectricItem }) => <ElectricItem item={item} />,
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

  return (
    <>
      <View className="flex-1">
        <FlashList
          data={electricBoxes}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={refreshControl}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          estimatedItemSize={CARD_HEIGHT + CARD_MARGIN}
          removeClippedSubviews={true}
          ItemSeparatorComponent={() => <View style={{ height: CARD_MARGIN }} />}
          scrollEnabled={!isAnyItemEditing}
        />
      </View>
      <ImageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        images={selectedImages}
        containerId={selectedEbox?.container_id.toString()}
        itemId={selectedEbox?.id || 0}
        type="ebox"
        onUpdateSuccess={handleImageUpdate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flashListContainer: {
    flex: 1,
    height: '100%',
  },
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
  cardContainer: {
    position: 'relative',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
    lineHeight: 8,
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
  openText: {
    color: "#E6A23C"
  },
  offlineText: {
    color: "#909399",
  },
  warnText: {
    color: "#F56C6C"
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
  loopsContainer: {
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
  actionButtons: {
    position: 'absolute',
    left: -50,
    top: 0,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginLeft: 5,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#409eff',
  },
  deleteButton: {
    backgroundColor: '#f56c6c',
  },
});

