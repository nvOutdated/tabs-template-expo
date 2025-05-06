import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

type CameraItem = {
  id: number;
  name: string;
  area_name: string;
  create_time: string;
  is_online: boolean;
  thumbnail: string;
  canPlay: boolean;
  channelId: string;
};

type Props = {
  cameras: CameraItem[];
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<RefreshControl['props']>;
  setShowSearch?: (show: boolean) => void;
};

interface VideoParams {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  channelId: string;
  is_online: boolean;
  area_name: string;
}

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2; // 改为2列
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - (COLUMN_NUM + 1) * CARD_MARGIN) / COLUMN_NUM;
const CARD_HEIGHT = CARD_WIDTH; // 增加卡片高度

export default function CameraList({ cameras, onEndReached, refreshControl, setShowSearch }: Props) {
  const router = useRouter();

  // Memoized camera item component for better performance
  const CameraItem = memo(({ item, router }: { item: CameraItem; router: any }) => {
    const videoParams: VideoParams = useMemo(() => ({
      id: item.id.toString(),
      title: item.name,
      thumbnail: item.thumbnail,
      duration: '00:00',
      uploadDate: item.create_time,
      channelId: item.channelId,
      is_online: item.is_online,
      area_name: item.area_name
    }), [item]);

    const handlePress = useCallback(() => {
      router.push({
        pathname: '/(logging-in)/(modal)/videoModal',
        params: {
          video: JSON.stringify(videoParams)
        }
      });
    }, [router, videoParams]);

    return (
      <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
        <Pressable style={styles.card} className='bg-background-50'>
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              contentFit="cover"
            />
            {item.is_online && (
              <Pressable
                style={styles.playIcon}
                onPress={() => router.push({
                  pathname: '/(logging-in)/(modal)/videoModal',
                  params: {
                    video: JSON.stringify({
                      id: item.id.toString(),
                      title: item.name,
                      thumbnail: item.thumbnail,
                      duration: '00:00', // 默认时长
                      uploadDate: item.create_time,
                      channelId: item.channelId,
                      is_online: item.is_online,
                      area_name: item.area_name
                    })
                  }
                })}
              >
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
              </Pressable>
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title} className='text-info-500'>{item.name}</Text>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText} className='text-tertiary-900'>{item.area_name}</Text>
              <Text style={[styles.status,
              item.is_online ? styles.online : styles.offline]}>
                {item.is_online ? '在线' : '离线'}
              </Text>
            </View>
            <Text style={styles.timeText} className='text-typography-500'>{item.create_time}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  });

  CameraItem.displayName = 'CameraItem';

  // Memoized renderItem function
  const renderItem = React.useCallback(({ item }: { item: CameraItem }) => (
    <CameraItem item={item} router={router} />
  ), [router]);

  const [startY, setStartY] = useState<number>(0);
  const handleScrollBeginDrag = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const { y } = event.nativeEvent.contentOffset;
    setStartY(y);
  }, []);

  const handleScrollEndDrag = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const { y } = event.nativeEvent.contentOffset;
    const direction = y > startY ? '向下' : '向上';
    if (setShowSearch) {
      setShowSearch(direction === '向上');
    }
  }, [startY, setShowSearch]);

  const keyExtractor = useCallback((item: CameraItem) => item.id.toString(), []);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无摄像头数据</Text>
    </View>
  ), []);
  return (
    <FlatList
      data={cameras}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={COLUMN_NUM}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.columnWrapper}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    padding: CARD_MARGIN,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    // backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: CARD_MARGIN,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 0.5,
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    // color: '#666',
  },
  timeText: {
    fontSize: 12,
    // color: '#999',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#e6f7e6',
    color: '#52c41a',
  },
  offline: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }], // 调整为16以匹配新的大小
    backgroundColor: 'rgba(0,0,0,0.3)', // 降低背景透明度
    borderRadius: 16, // 调整为16以匹配新的大小
    padding: 4, // 增加内边距
  },
});