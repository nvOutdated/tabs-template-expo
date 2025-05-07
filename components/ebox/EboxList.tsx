import { Image } from "expo-image";
import React, { memo, useCallback, useMemo, useState } from "react";
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

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInLeft, FadeOutRight } from "react-native-reanimated";
import EboxImageModal from "./EboxImageModal";
type ElectricItem = {
  id: number;
  sn: string;
  name: string;
  addr: string;
  device_info: {
    device_code: string;
    online: boolean;
    loops: boolean[];
    images?: string[];
  };
};

type Props = {
  electricBoxes: ElectricItem[];
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<RefreshControl['props']>;
  loading: boolean;
};

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const CARD_HEIGHT = 120; // 压缩后的卡片高度
const centralControllerImage = require("@/assets/images/street/electricBox/centralController.png");
export default function EboxList({
  electricBoxes,
  onEndReached,
  refreshControl,
  loading,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImagePress = (images: string[], index: number = 0) => {
    // console.log('handleImagePress called with images:', images);
    setSelectedImages(images);
    setSelectedIndex(index);
    setModalVisible(true);
  };
  const getConfigurationDetails = (item: ElectricItem) => {
    router.push({
      pathname: '/(logging-in)/(modal)/configuration',
      params: {
        item: JSON.stringify(item)
      }
    });
  };
  // Memoized ebox item component for better performance
  const ElectricItem = memo(({ item }: { item: ElectricItem }) => {
    // 使用实际的电箱图片
    const images = item.device_info.images || [
      "https://img2.baidu.com/it/u=2278823923,4036155378&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=889",
      "https://inews.gtimg.com/news_bt/O7ZsQ9IrSfcWAWLPeaRcfeEt5FdyeTfnFYrSGmDSKlU0sAA/1000"
    ];
    // console.log('ElectricItem images:', images);

    return (
      <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
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
              <Text style={styles.configButtonText}>
                组态
              </Text>
            </Pressable>
          </View>
          <View style={styles.imageRowContainer}>
            <Pressable
              style={styles.thumbnailContainer}
              onPress={() => handleImagePress(images)}
            >
              {images.length > 0 ? (
                <Image
                  source={centralControllerImage}
                  style={styles.thumbnail}
                  contentFit="contain"
                />
              ) : (
                <Image
                  source={centralControllerImage}
                  style={styles.thumbnail}
                  contentFit="contain"
                />
              )}
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
                <Text style={styles.statusText}>状态: </Text>
                <View
                  style={[
                    styles.statusDot,
                    item.device_info.online ? styles.online : styles.offline,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    item.device_info.online
                      ? styles.onlineText
                      : styles.offlineText,
                  ]}
                >
                  {item.device_info.online ? "在线" : "离线"}
                </Text>
              </View>
              <View style={styles.loopsContainer}>
                <Text style={styles.loopsTitle}>回路:</Text>
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
      </Animated.View>
    );
  });

  ElectricItem.displayName = 'ElectricItem';

  // Memoized renderItem function
  const renderItem = useCallback(
    ({ item }: { item: ElectricItem }) => <ElectricItem item={item} />,
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
        {loading ? (
          <ActivityIndicator size="small" color="#409eff" />
        ) : (
          <Text style={styles.footerText}>no more messsage</Text>
        )}
      </View>
    ),
    [loading]
  );
  return (
    <>
      <FlatList
        data={electricBoxes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
      />
      <EboxImageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        images={selectedImages}
        initialIndex={selectedIndex}
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
    position:'absolute',
    right:10,
    top:5,
    // marginLeft: 10,
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64, 158, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(64, 158, 255, 0.2)',
  },
  configButtonText: {
    color: '#409eff',
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
  },
  online: {
    backgroundColor: "#52c41a",
  },
  offline: {
    backgroundColor: "#ff4d4f",
  },
  onlineText: {
    color: "#52c41a",
  },
  offlineText: {
    color: "#ff4d4f",
  },
  loopsContainer: {
    // marginTop: 4,
    width:'80%',
    flexDirection: "row",
  },
  loopsTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  loopsGrid: {
    width:'80%',
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
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});
