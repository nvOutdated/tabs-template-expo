import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated';
const { width, height } = Dimensions.get('window');

const DEFAULT_COLORS = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

type EboxImageModalProps = {
  visible: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  onImageUpload?: (imageUri: string) => void;
};

export default function EboxImageModal({
  visible,
  onClose,
  images,
  initialIndex = 0,
  onImageUpload
}: EboxImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localImages, setLocalImages] = useState<string[]>(images);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const {showError,showSuccess} = useCustomToast()
  useEffect(() => {
    // console.log('Images prop changed:', images);
    if (images && images.length > 0) {
      setLocalImages(images);
      setCurrentIndex(initialIndex);
    } else {
      setLocalImages([]);
      setCurrentIndex(0);
    }
  }, [images, initialIndex]);

  const getPaginationColors = () => {
    return localImages.map((_, index) => ({
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
  };

  const handlePaginationPress = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Alert.alert('需要相册权限', '请允许访问相册以选择图片');
        showError({
          title:"权限错误",
          message:"请允许访问相册"
        })
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [4, 6],
        quality: 1,
      });

      if (!result.canceled) {
        // const manipulatedImage = await manipulateAsync(
        //   result.assets[0].uri,
        //   [
        //     { resize: { width: 800 } },
        //   ],
        //   { compress: 0.8, format: SaveFormat.JPEG }
        // );

        setLocalImages([result.assets[0].uri, ...localImages]);
        setCurrentIndex(0);

        if (onImageUpload) {
          onImageUpload(result.assets[0].uri);
        }
      }
    } catch (error) {
      showError({
        title:"错误信息",
        message:"选择图片错误"
      })
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要相机权限', '请允许访问相机以拍照');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [4, 6],
        quality: 1,
      });

      if (!result.canceled) {
        // const manipulatedImage = await manipulateAsync(
        //   result.assets[0].uri,
        //   [
        //     { resize: { width: 800 } },
        //   ],
        //   { compress: 0.8, format: SaveFormat.JPEG }
        // );

        setLocalImages([result.assets[0].uri, ...localImages]);
        setCurrentIndex(0);

        if (onImageUpload) {
          onImageUpload(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('拍照失败', '拍照时发生错误');
    }
  };

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要相册权限', '请允许访问相册以保存图片');
        return;
      }

      const currentImage = localImages[currentIndex];
      const fileUri = FileSystem.cacheDirectory + 'temp_image.jpg';

      // 下载图片到缓存
      await FileSystem.downloadAsync(currentImage, fileUri);

      // 保存到相册
      await MediaLibrary.saveToLibraryAsync(fileUri);

      showSuccess({
        title:"成功",
        message:"保存图片成功"
      })
    } catch (error) {
      Alert.alert('保存失败', '保存图片时发生错误');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>图片详情</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Carousel
            ref={carouselRef}
            loop={true}
            width={width}
            height={height * 0.65}
            data={localImages}
            scrollAnimationDuration={500}
            onProgressChange={progress}
            renderItem={({ item }) => {
              // console.log('Rendering image:', item);
              return (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item }}
                    style={styles.image}
                    contentFit="contain"
                    onError={(error) => console.log('Image loading error:', error)}
                  />
                </View>
              );
            }}
          />

          <Pagination.Custom<{ color: string }>
            progress={progress}
            data={getPaginationColors()}
            size={20}
            dotStyle={styles.paginationDot}
            activeDotStyle={styles.paginationActiveDot}
            containerStyle={styles.paginationContainer}
            horizontal
            onPress={handlePaginationPress}
            customReanimatedStyle={(progress, index, length) => {
              const val = Math.abs(progress - index);
              const adjustedVal = index === 0 && progress > length - 1 ? Math.abs(progress - length) : val;

              return {
                transform: [
                  {
                    translateY: interpolate(
                      adjustedVal,
                      [0, 1],
                      [0, 0],
                      Extrapolation.CLAMP,
                    ),
                  },
                ],
              };
            }}
            renderItem={({ color }) => (
              <View style={[styles.paginationItem, { backgroundColor: color }]} />
            )}
          />

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
                <Ionicons name="images" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>相册上传</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>拍照上传</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerRight}>
              <TouchableOpacity onPress={saveImage} style={styles.actionButton}>
                <Ionicons name="download" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>保存手机</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 48,
  },
  paginationContainer: {
    marginTop:20,
    gap: 5,
    alignItems: 'center',
    height: 10,
  },
  paginationDot: {
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  paginationActiveDot: {
    borderRadius: 8,
    width: 30,
    height: 20,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
  },
  paginationItem: {
    flex: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  footerRight: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
}); 