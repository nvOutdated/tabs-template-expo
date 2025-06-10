import { light_ebox_query_get } from "@/api/street/configuration";
import { get_smart_light_list } from "@/api/street/smartLightApi";
import { light_container_attach_remove } from "@/api/street/streetCommon";
import { showMessageModal } from "@/components/ui/MessageGlobalModal";
import { useAuthStore } from "@/store/autherStore";
import { useGlobalStore } from "@/store/globalStateStore";
import { getUserInfo } from "@/utils/useStorageState";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Extrapolation,
    interpolate,
    useSharedValue,
} from "react-native-reanimated";
import Carousel, {
    ICarouselInstance,
    Pagination,
} from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get("window");

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
  id?: number;
};

export type ImageModalType = 'ebox' | 'smartLight' | 'singleLamp';

type ImageModalProps = {
  visible: boolean;
  onClose: () => void;
  images: ImageSource[];
  containerId?: string;
  itemId: number;
  type: ImageModalType;
  onUpdateSuccess?: (updatedItem: any) => void;
};

export default function ImageModal({
  visible,
  onClose,
  images,
  containerId,
  itemId,
  type,
  onUpdateSuccess,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localImages, setLocalImages] = useState<ImageSource[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userInfo, setUserInfo] = useState<string>("");
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const currentServer = useGlobalStore((state) => state.currentServer);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (images && images.length > 0) {
      setLocalImages(images);
      setCurrentIndex(0);
    } else {
      setLocalImages([]);
      setCurrentIndex(0);
    }
  }, [images, visible]);

  const fetchUpdatedItem = async (id: number) => {
    try {
      let response;
      switch (type) {
        case 'ebox':
          response = await light_ebox_query_get({ id });
          break;
        case 'smartLight':
          response = await get_smart_light_list({id})
          // TODO: 添加智能灯查询接口
          break;
        case 'singleLamp':
          // TODO: 添加单灯查询接口
          break;
        default:
          throw new Error('未知的类型');
      }

      if (response?.code === 200 && response.data) {
        return response.data;
      }
      throw new Error(response?.message || "获取更新数据失败");
    } catch (error) {
      console.error("获取更新数据失败:", error);
      throw error;
    }
  };

  const getUploadUrl = () => {
    if (!currentServer) return "";
    return `http://${currentServer.ip}:45000/smart/file/light/container/upload`;
  };

  const uploadImage = async (uri: string) => {
    if (!containerId || !userInfo) {
      showMessageModal({
        type: "error",
        title: "错误",
        message: "缺少必要的上传参数",
      });
      return;
    }

    if (!token) {
      showMessageModal({
        type: "error",
        title: "错误",
        message: "未登录或登录已过期",
      });
      return;
    }

    const uploadUrl = getUploadUrl();
    if (!uploadUrl) {
      showMessageModal({
        type: "error",
        title: "错误",
        message: "服务器地址未配置",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log("图片开始上传", new Date().getSeconds());
      const formData = new FormData();
      formData.append("files", {
        uri,
        type: "image/jpeg",
        name: "image.jpg",
      } as any);
      formData.append("containerID", containerId);
      formData.append("principal", userInfo);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
          Connection: "keep-alive",
        },
        body: formData,
      });
      console.log("图片上传成功", new Date().getSeconds());
      if (!response.ok) {
        throw new Error(`上传失败: ${response.status} - ${await response.text()}`);
      }

      // 上传成功后获取最新数据
      if (itemId) {
        const updatedItem = await fetchUpdatedItem(itemId);
        if (onUpdateSuccess && updatedItem) {
          onUpdateSuccess(updatedItem);
        }
      }

      showMessageModal({
        type: "success",
        title: "成功",
        message: "图片上传成功",
      });

    } catch (error) {
      console.error("上传错误:", error);
      showMessageModal({
        type: "error",
        title: "错误",
        message: error instanceof Error ? error.message : "图片上传失败",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      const currentImage = localImages[currentIndex];
      
      if (!currentImage.id) {
        showMessageModal({
          type: "error",
          title: "错误",
          message: "默认图片不能删除",
        });
        return;
      }

      Alert.alert(
        "确认删除",
        "确定要删除这张图片吗？",
        [
          {
            text: "取消",
            style: "cancel"
          },
          {
            text: "确定",
            onPress: async () => {
              try {
                setIsDeleting(true);
                const response = await light_container_attach_remove({ attach_id: currentImage.id });
                if (response.code === 200) {
                  // 删除成功后获取最新数据
                  if (itemId) {
                    const updatedItem = await fetchUpdatedItem(itemId);
                    if (onUpdateSuccess && updatedItem) {
                      onUpdateSuccess(updatedItem);
                    }
                  }

                  // 更新本地图片列表
                  const newImages = localImages.filter((_, index) => index !== currentIndex);
                  setLocalImages(newImages);
                  
                  // 调整当前索引
                  if (newImages.length > 0) {
                    setCurrentIndex(Math.min(currentIndex, newImages.length - 1));
                  } else {
                    setCurrentIndex(0);
                  }
                  showMessageModal({
                    type: "success",
                    title: "成功",
                    message: "图片删除成功",
                  });
                } else {
                  throw new Error(response.message || "删除失败");
                }
              } catch (error) {
                console.error("删除错误:", error);
                showMessageModal({
                  type: "error",
                  title: "错误",
                  message: error instanceof Error ? error.message : "图片删除失败",
                });
              } finally {
                setIsDeleting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("删除错误:", error);
      showMessageModal({
        type: "error",
        title: "错误",
        message: "删除图片时发生错误",
      });
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showMessageModal({
          type: "error",
          title: "权限错误",
          message: "请允许访问相册",
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

      if (!result.canceled) {
        const newImage = { uri: result.assets[0].uri };
        setLocalImages([newImage, ...localImages]);
        setCurrentIndex(0);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      showMessageModal({
        type: "error",
        title: "错误信息",
        message: "选择图片错误",
      });
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("需要相机权限", "请允许访问相机以拍照");
        return;
      }
   
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [4, 6],
        quality: 1,
      });

      if (!result.canceled) {
        const newImage = { uri: result.assets[0].uri };
        setLocalImages([newImage, ...localImages]);
        setCurrentIndex(0);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("拍照失败", "拍照时发生错误");
    }
  };

  const canDeleteImage = () => {
    const currentImage = localImages[currentIndex];
    return currentImage && currentImage.id;
  };

  const getPaginationColors = () => {
    return DEFAULT_COLORS.slice(0, localImages.length).map(color => ({ color }));
  };

  const handlePaginationPress = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index, animated: true });
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

          {localImages.length > 0 ? (
            <>
              <Carousel
                ref={carouselRef}
                loop={true}
                width={width}
                height={height * 0.65}
                data={localImages}
                scrollAnimationDuration={500}
                onSnapToItem={(index) => {
                  setCurrentIndex(index);
                }}
                onProgressChange={progress}
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={item}
                      style={styles.image}
                      contentFit="contain"
                      onError={(error) =>
                        console.log("Image loading error:", error)
                      }
                    />
                  </View>
                )}
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
                  const adjustedVal =
                    index === 0 && progress > length - 1
                      ? Math.abs(progress - length)
                      : val;

                  return {
                    transform: [
                      {
                        translateY: interpolate(
                          adjustedVal,
                          [0, 1],
                          [0, 0],
                          Extrapolation.CLAMP
                        ),
                      },
                    ],
                  };
                }}
                renderItem={({ color }) => (
                  <View
                    style={[styles.paginationItem, { backgroundColor: color }]}
                  />
                )}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>暂无图片</Text>
              <Text style={styles.emptySubText}>请点击下方按钮上传图片</Text>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <TouchableOpacity
                onPress={pickImage}
                style={[styles.actionButton, (isUploading || isDeleting) && styles.actionButtonDisabled]}
                disabled={isUploading || isDeleting}
              >
                <Ionicons name="images" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>相册上传</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takePhoto}
                style={[styles.actionButton, (isUploading || isDeleting) && styles.actionButtonDisabled]}
                disabled={isUploading || isDeleting}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>拍照上传</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerRight}>
              <TouchableOpacity
                onPress={removeImage}
                style={[
                  styles.actionButton,
                  (!canDeleteImage() || isUploading || isDeleting) && styles.actionButtonDisabled
                ]}
                disabled={!canDeleteImage() || isUploading || isDeleting}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>删除图片</Text>
              </TouchableOpacity>
            </View>
          </View>

          {(isUploading || isDeleting) && (
            <View style={styles.uploadOverlay}>
              <View style={styles.uploadContent}>
                <ActivityIndicator size="large" color="#409eff" />
                <Text style={styles.uploadText}>
                  {isUploading ? "正在上传图片..." : "正在删除图片..."}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 48,
  },
  paginationContainer: {
    marginTop: 20,
    gap: 5,
    alignItems: "center",
    height: 10,
  },
  paginationDot: {
    borderRadius: 12,
    backgroundColor: "#262626",
  },
  paginationActiveDot: {
    borderRadius: 8,
    width: 30,
    height: 20,
    overflow: "hidden",
    backgroundColor: "#f1f1f1",
  },
  paginationItem: {
    flex: 1,
  },
  footerLeft: {
    flexDirection: "row",
    gap: 16,
  },
  footerRight: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
}); 