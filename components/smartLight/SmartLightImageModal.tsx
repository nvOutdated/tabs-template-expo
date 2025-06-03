import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { light_ebox_query_get } from '@/api/street/configuration';
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useAuthStore } from '@/store/autherStore';
import { useGlobalStore } from '@/store/globalStateStore';
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

type ImageSource = {
  uri?: string;
  default?: any;
};

type EboxImageModalProps = {
  visible: boolean;
  onClose: () => void;
  images: ImageSource[];
  initialIndex?: number;
  onImageUpload?: (imageUri: string) => void;
  containerId?: string;
  userInfo: string;
};

export default function EboxImageModal({
  visible,
  onClose,
  images,
  initialIndex = 0,
  onImageUpload,
  containerId,
  userInfo
}: EboxImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localImages, setLocalImages] = useState<ImageSource[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const {showError,showSuccess} = useCustomToast();
  const currentServer = useGlobalStore(state => state.currentServer);
  const { token } = useAuthStore();

  useEffect(() => {
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

  const fetchUpdatedEbox = async (id: string) => {
    try {
      const params = {
        id: parseInt(id)
      };
      const response = await light_ebox_query_get(params);
      if (response.code === 200 && response.data) {
        return response.data;
      }
      throw new Error(response.message || '获取更新数据失败');
    } catch (error) {
      console.error('获取更新数据失败:', error);
      throw error;
    }
  };

  const getUploadUrl = () => {
    if (!currentServer) return '';
    return `https://${currentServer.ip}:11111/smart/file/light/container/upload`;
  };

  const uploadImage = async (uri: string) => {
    if (!containerId || !userInfo) {
      showError({
        title: "错误",
        message: "缺少必要的上传参数"
      });
      return;
    }

    if (!token) {
      showError({
        title: "错误",
        message: "未登录或登录已过期"
      });
      return;
    }

    const uploadUrl = getUploadUrl();
    if (!uploadUrl) {
      showError({
        title: "错误",
        message: "服务器地址未配置"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('files', {
        uri,
        type: 'image/jpeg',
        name: 'image.jpg'
      } as any);
      formData.append('containerID', containerId);
      formData.append('principal', userInfo);

      console.log('开始上传，URL:', uploadUrl);
      console.log('请求参数:', {
        containerID: containerId,
        principal: userInfo,
        token: token.substring(0, 10) + '...' // 只打印token的前10位
      });

      // 使用 XMLHttpRequest 发送请求，因为它可以更好地处理证书问题
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);
      
      // 设置请求头
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', '*/*');
      xhr.setRequestHeader('Connection', 'keep-alive');
      
      // 创建一个 Promise 来处理 XHR 请求
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          console.log('请求完成，状态码:', xhr.status);
          console.log('响应头:', xhr.getAllResponseHeaders());
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('上传成功，响应:', response);
              resolve(response);
            } catch (e) {
              console.error('解析响应失败:', e);
              reject(new Error('解析响应失败'));
            }
          } else {
            console.error('上传失败，状态码:', xhr.status);
            console.error('错误响应:', xhr.responseText);
            reject(new Error(`上传失败: ${xhr.status} - ${xhr.responseText}`));
          }
        };

        xhr.onerror = (e) => {
          console.error('网络错误:', e);
          reject(new Error('网络请求失败，请检查网络连接和服务器地址'));
        };

        xhr.ontimeout = () => {
          console.error('请求超时');
          reject(new Error('请求超时，请检查网络连接'));
        };

        // 添加上传进度监听
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log('上传进度:', percentComplete.toFixed(2) + '%');
          }
        };
      });

      // 设置超时时间
      xhr.timeout = 30000; // 30秒

      // 发送请求
      xhr.send(formData);

      // 等待上传完成
      const result = await uploadPromise;
      
      // 上传成功后获取最新数据
      if (containerId) {
        await fetchUpdatedEbox(containerId);
      }

      showSuccess({
        title: "成功",
        message: "图片上传成功"
      });

      if (onImageUpload) {
        onImageUpload(uri);
      }
    } catch (error) {
      console.error('上传错误:', error);
      showError({
        title: "错误",
        message: error instanceof Error ? error.message : "图片上传失败"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError({
          title: "权限错误",
          message: "请允许访问相册"
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [4, 6],
        quality: 1,
      });
      // console.log(result,33333);
      if (!result.canceled) {
        const newImage = { uri: result.assets[0].uri };
        setLocalImages([newImage, ...localImages]);
        setCurrentIndex(0);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      showError({
        title: "错误信息",
        message: "选择图片错误"
      });
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
      // console.log(result,33333);
      
      if (!result.canceled) {
        // console.log(result.assets[0].uri,"图片地址");
        
        const newImage = { uri: result.assets[0].uri };
        setLocalImages([newImage, ...localImages]);
        setCurrentIndex(0);
        await uploadImage(result.assets[0].uri);
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
      if (!currentImage.uri) {
        showError({
          title:"错误信息",
          message:"无法保存默认图片"
        });
        return;
      }

      const fileUri = FileSystem.cacheDirectory + 'temp_image.jpg';
      await FileSystem.downloadAsync(currentImage.uri, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);

      showSuccess({
        title:"成功",
        message:"保存图片成功"
      });
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
                    source={item}
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