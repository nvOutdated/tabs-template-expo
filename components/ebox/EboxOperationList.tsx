import { light_central_detect_status, light_eleBox_ctrl_switch, smart_personal_matchOptCode } from '@/api/street/configuration';
import { useCustomToast } from '@/components/public/UIComponents/ToastComponent';
import PasswordModal from '@/components/ui/PasswordModal';
import { DEVICE_STATUS, useEboxStore } from '@/store/eboxStore';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeInLeft,
  FadeOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
const { width } = Dimensions.get('window');
const CIRCLE_SIZE = (width - 48) / 8;

type EboxOperation = {
  id: string;
  title: string;
  content: string;
  type: 'alarm' | 'warning' | 'info';
  module: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed';
  sn: string;
  deviceName: string;
  data: {
    phase3Voltage: number[];
    phase3Electric: number[];
    power: number;
    dateTime: string;
    powerOff: string;
    powerOn: string;
    loops: boolean[];
    ios: boolean[];
    enabledWeekly: boolean;
    enabledAlways: boolean;
    enabledLocation: boolean;
    enabledMultiple: boolean;
    enabledLight: boolean;
    enabledWater: boolean;
    enabledOneByOne: boolean;
    mode: string;
    optTime: string;
    eventType: string;
    reportTime: string;
    description: string;
    warn: boolean;
  };
};

type LoopButton = {
  id: number;
  isActive: boolean;
};

type EboxOperationListProps = {
  operations: EboxOperation[];
  onOperationSelect: (operation: EboxOperation) => void;
  onWebSocketUpdate?: (data: any) => void;
};
const EboxOperationList: React.FC<EboxOperationListProps> = ({
  operations,
}) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [loopButtons, setLoopButtons] = useState<LoopButton[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, isActive: false }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const [initialTouchIndex, setInitialTouchIndex] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'open' | 'close' | 'check' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedDevices, isEditMode, selectedOperations, toggleEditMode, toggleOperationSelect, clearSelectedOperations, deleteOperations } = useEboxStore();
  const toast = useCustomToast();

  // 统计信息
  const stats = useMemo(() => {
    const total = operations.length;
    const warning = operations.filter(op => op.type === 'warning').length;
    const info = operations.filter(op => op.type === 'info').length;
    return { total, warning, info };
  }, [operations]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedOperations.size === 0) {
      toast.showError({
        message: '请先选择要删除的记录',
      });
      return;
    }

    // 删除选中的操作记录
    deleteOperations(selectedOperations);

    toast.showSuccess({
      message: `已删除 ${selectedOperations.size} 条记录`,
    });
    clearSelectedOperations();
    toggleEditMode();
  }, [selectedOperations, toast, clearSelectedOperations, toggleEditMode, deleteOperations]);

  const updateLoopButton = useCallback((index: number, isActive: boolean) => {
    setLoopButtons(prev => {
      const newButtons = [...prev];
      newButtons[index] = { ...newButtons[index], isActive };
      return newButtons;
    });
  }, []);

  const handleLoopPress = useCallback((index: number) => {
    setLoopButtons(prev => {
      const newButtons = [...prev];
      newButtons[index] = { ...newButtons[index], isActive: !newButtons[index].isActive };
      return newButtons;
    });
    setLastActiveIndex(index);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      runOnJS(setIsDragging)(true);
      const x = e.absoluteX;
      const relativeX = x - 12;
      const index = Math.floor(relativeX / CIRCLE_SIZE);

      const buttonStartX = index * CIRCLE_SIZE;
      const buttonEndX = buttonStartX + CIRCLE_SIZE;
      const touchX = relativeX;

      if (index >= 0 && index < 8 && touchX >= buttonStartX && touchX <= buttonEndX) {
        const currentState = loopButtons[index].isActive;
        runOnJS(setInitialTouchIndex)(index);
        runOnJS(updateLoopButton)(index, !currentState);
        runOnJS(setLastActiveIndex)(index);
      }
    })
    .onUpdate((e) => {
      if (lastActiveIndex === null || initialTouchIndex === null) return;

      const x = e.absoluteX;
      const relativeX = x - 12;
      const index = Math.floor(relativeX / CIRCLE_SIZE);

      const buttonStartX = index * CIRCLE_SIZE;
      const buttonEndX = buttonStartX + CIRCLE_SIZE;
      const touchX = relativeX;

      if (index >= 0 && index < 8 && index !== lastActiveIndex &&
        touchX >= buttonStartX && touchX <= buttonEndX) {
        const isActive = loopButtons[initialTouchIndex].isActive;
        runOnJS(updateLoopButton)(index, isActive);
        runOnJS(setLastActiveIndex)(index);
      }
    })
    .onEnd(() => {
      runOnJS(setIsDragging)(false);
      runOnJS(setLastActiveIndex)(null);
      runOnJS(setInitialTouchIndex)(null);
    });

  const handleOperation = async (type: 'open' | 'close' | 'check') => {
    if (selectedDevices.size === 0) {
      toast.showError({
        message: '请先选择设备',
      });
      return;
    }

    if (type === 'check') {
      setIsLoading(true);
      try {
        const deviceIds = Array.from(selectedDevices.values()).map(device => device.device_info.id);
        const response = await light_central_detect_status({
          devices: deviceIds
        });

        if (response.code === 200) {
          //console.log(response);
          toast.showSuccess({
            message: '状态检测成功',
          });
        } else {
          toast.showError({
            message: response.message || '状态检测失败',
          });
        }
      } catch (error) {
        toast.showError({
          message: '网络错误，请稍后重试',
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setCurrentOperation(type);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!currentOperation) return;

    setIsLoading(true);
    try {
      // First verify the password
      const passwordResponse = await smart_personal_matchOptCode({
        isCreated: true,
        optCode: password
      });

      if (passwordResponse.code !== 200) {
        toast.showError({
          message: '密码验证失败',
        });
        return;
      }

      const deviceIds = Array.from(selectedDevices.values()).map(device => device.device_info.id);

      if (currentOperation === 'check') {
        const response = await light_central_detect_status({
          devices: deviceIds
        });

        if (response.code === 200) {
          //console.log(response);
          toast.showSuccess({
            message: '状态检测成功',
          });
        } else {
          toast.showError({
            message: response.message || '状态检测失败',
          });
        }
      } else {
        const loops = loopButtons.map(button => button.isActive);
        const response = await light_eleBox_ctrl_switch({
          deviceIds: deviceIds,
          isOpen: currentOperation === 'open',
          loops: loops
        });

        if (response.code === 200) {
          toast.showSuccess({
            message: currentOperation === 'open' ? '开灯成功' : '关灯成功',
          });
        } else {
          toast.showError({
            message: response.message || (currentOperation === 'open' ? '开灯失败' : '关灯失败'),
          });
        }
      }
    } catch (error) {
      toast.showError({
        message: '网络错误，请稍后重试',
      });
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
      setCurrentOperation(null);
    }
  };

  // 添加全选/取消全选的处理函数
  const handleSelectAll = useCallback(() => {
    if (selectedOperations.size === operations.length) {
      // 如果已经全选，则取消全选
      clearSelectedOperations();
    } else {
      // 否则全选所有操作
      operations.forEach(operation => {
        if (!selectedOperations.has(operation.id)) {
          toggleOperationSelect(operation.id);
        }
      });
    }
  }, [operations, selectedOperations, clearSelectedOperations, toggleOperationSelect]);

  const renderLoopButtons = () => (
    <View className="flex-row justify-between px-3 mb-4">
      {loopButtons.map((button, index) => (
        <TouchableOpacity
          key={button.id}
          className={`justify-center items-center border ${button.isActive
              ? 'bg-primary-500 border-primary-500'
              : 'bg-background-100 border-outline-200'
            }`}
          style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }}
          onPress={() => handleLoopPress(index)}
        >
          <Text className={`text-base font-semibold ${button.isActive ? 'text-white' : 'text-typography-600'
            }`}>
            {button.id}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOperationButtons = () => (
    <View className="flex-row justify-between gap-2">
      <TouchableOpacity
        className="flex-1 h-9 rounded-md flex-row justify-center items-center gap-1 bg-success-500"
        onPress={() => handleOperation('open')}
      >
        <Ionicons name="sunny" size={20} color="white" />
        <Text className="text-white text-sm font-medium">开灯</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-9 rounded-md flex-row justify-center items-center gap-1 bg-error-500"
        onPress={() => handleOperation('close')}
      >
        <Ionicons name="moon" size={20} color="white" />
        <Text className="text-white text-sm font-medium">关灯</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-9 rounded-md flex-row justify-center items-center gap-1 bg-info-500"
        onPress={() => handleOperation('check')}
      >
        <Ionicons name="analytics" size={20} color="white" />
        <Text className="text-white text-sm font-medium">检测状态</Text>
      </TouchableOpacity>
    </View>
  );

  const OperationItem: React.FC<{ item: EboxOperation }> = React.memo(({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedHeight = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);
    const MAX_HEIGHT = 400;
    const isMounted = useRef(true);
    const { isEditMode, selectedOperations, toggleOperationSelect } = useEboxStore();

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    const toggleExpand = useCallback(() => {
      if (!isMounted.current) return;

      if (!isExpanded) {
        animatedHeight.value = withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
        animatedOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
      } else {
        animatedHeight.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
        animatedOpacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
      }
      setIsExpanded((prev) => !prev);
    }, [isExpanded, animatedHeight, animatedOpacity]);

    const handleItemPress = useCallback(() => {
      if (isEditMode) {
        toggleOperationSelect(item.id);
      } else {
        toggleExpand();
      }
    }, [isEditMode, toggleOperationSelect, item.id, toggleExpand]);

    const handleCheckboxPress = useCallback((e: any) => {
      e.stopPropagation();
      toggleOperationSelect(item.id);
    }, [toggleOperationSelect, item.id]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        height: animatedHeight.value * MAX_HEIGHT,
        opacity: animatedOpacity.value,
        overflow: 'hidden',
      };
    }, []);

    const moduleStyle = useMemo(() => {
      const status = Object.values(DEVICE_STATUS).find(
        status => status.module === item.module
      );
      return {
        bgColor: status?.dotStyle === 'warn' ? 'bg-error-50' :
          status?.dotStyle === 'open' ? 'bg-warning-50' :
            status?.dotStyle === 'online' ? 'bg-success-50' : 'bg-gray-100',
        color: status?.dotStyle === 'warn' ? 'text-error-500' :
          status?.dotStyle === 'open' ? 'text-warning-500' :
            status?.dotStyle === 'online' ? 'text-success-500' : 'text-gray-500',
        label: item.module
      };
    }, [item.module]);

    const renderLoopButtons = useCallback(() => (
      <View className="flex-row flex-wrap gap-1">
        {item.data.loops.map((loop, index) => (
          <View
            key={index}
            className={`w-5 h-5 rounded-full justify-center items-center ${loop ? 'bg-blue-500' : 'bg-gray-400'
              }`}
          >
            <Text className="text-white text-xs">{index + 1}</Text>
          </View>
        ))}
      </View>
    ), [item.data.loops]);

    const renderIOButtons = useCallback(() => (
      <View className="flex-row flex-wrap gap-2">
        {item.data.ios.map((io, index) => (
          <View
            key={index}
            className={`w-6 h-6 rounded-full justify-center items-center ${io ? 'bg-blue-500' : 'bg-gray-400'
              }`}
          >
            <Text className="text-white text-xs">{index + 1}</Text>
          </View>
        ))}
      </View>
    ), [item.data.ios]);

    const renderPlanTags = useCallback(() => (
      <View className="flex-row flex-wrap gap-2">
        {item.data.enabledWeekly && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">周控</Text>
        )}
        {item.data.enabledAlways && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">常亮</Text>
        )}
        {item.data.enabledLocation && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">经纬度</Text>
        )}
        {item.data.enabledMultiple && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">多时段</Text>
        )}
        {item.data.enabledLight && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">本地光控</Text>
        )}
        {item.data.enabledWater && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">水浸烟雾</Text>
        )}
        {item.data.enabledOneByOne && (
          <Text className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">逐一送电</Text>
        )}
      </View>
    ), [item.data]);

    return (
      <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
        <TouchableOpacity
          onPress={handleItemPress}
          className={`bg-background-50 p-4 rounded-xl mb-2 shadow-sm ${isEditMode ? 'opacity-80' : ''}`}
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            marginHorizontal: 2,
          }}
        >
          <View className="flex-row items-center">
            {isEditMode && (
              <TouchableOpacity
                onPress={handleCheckboxPress}
                className="mr-3"
              >
                <Ionicons
                  name={selectedOperations.has(item.id) ? "checkbox" : "square-outline"}
                  size={24}
                  color={selectedOperations.has(item.id) ? "#409eff" : "#909399"}
                />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              {/* 顶部信息：SN和模块 */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1">
                  <Text className={`text-base font-bold mr-2 ${item.type === 'warning' ? 'text-red-500' : ''}`}>
                    {item.sn}
                  </Text>
                  <Text className="text-base flex-1" numberOfLines={1}>{item.deviceName}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${moduleStyle.bgColor}`}>
                  <Text className={moduleStyle.color}>
                    {moduleStyle.label}
                  </Text>
                </View>
              </View>

              {/* 输出控制状态 */}
              <View className="flex-row items-center mb-2">
                <Text className="text-sm text-gray-500 mr-2">输出控制:</Text>
                {renderLoopButtons()}
              </View>

              {/* 当前动作方式及时间 */}
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">当前动作: {item.data.mode}</Text>
                  <Text className="text-xs text-gray-500">{item.data.optTime}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>

              {/* 展开的详细信息 */}
              <Animated.View style={animatedStyle}>
                <View className="mt-3 pt-3 border-t border-gray-200">
                  {/* 电压电流信息 */}
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm text-gray-500 mb-1">三相电压(V)</Text>
                      <View className="space-y-1">
                        {item.data.phase3Voltage.map((voltage, index) => (
                          <View key={index} className="flex-row items-center">
                            <Text className="text-sm text-gray-500 w-8">L{index + 1}</Text>
                            <Text className="text-sm">{voltage}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View className="flex-1 mx-2">
                      <Text className="text-sm text-gray-500 mb-1">三相电流(A)</Text>
                      <View className="space-y-1">
                        {item.data.phase3Electric.map((current, index) => (
                          <View key={index} className="flex-row items-center">
                            <Text className="text-sm text-gray-500 w-8">L{index + 1}</Text>
                            <Text className="text-sm">{current}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View className="flex-1 ml-2">
                      <Text className="text-sm text-gray-500 mb-1">用电量(Kwh)</Text>
                      <Text className="text-sm">{item.data.power}</Text>
                    </View>
                  </View>

                  {/* 时间信息 */}
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm text-gray-500 mb-1">设备时钟</Text>
                      <Text className="text-sm">{item.data.dateTime}</Text>
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-sm text-gray-500 mb-1">日出日落</Text>
                      <View className="space-y-1">
                        <Text className="text-sm">日出: {item.data.powerOff}</Text>
                        <Text className="text-sm">日落: {item.data.powerOn}</Text>
                      </View>
                    </View>
                  </View>

                  {/* I/O状态 */}
                  <View className="mb-3">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-sm text-gray-500 w-20">输入开关</Text>
                      {renderIOButtons()}
                    </View>
                  </View>

                  {/* 预案启用情况 */}
                  <View className="mb-3">
                    <Text className="text-sm text-gray-500 mb-2">启用预案</Text>
                    {renderPlanTags()}
                  </View>

                  {/* 运行描述 */}
                  <View className="border-t border-gray-200 pt-3">
                    <Text className={`text-sm ${item.type === 'warning' ? 'text-red-500' : 'text-green-500'}`}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
  });

  OperationItem.displayName = 'OperationItem';

  const renderItem = useCallback(({ item }: { item: EboxOperation }) => (
    <OperationItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: EboxOperation) => item.id, []);

  const EmptyComponent = () => (
    <View className="p-4 pb-8 items-center justify-center">
      <Ionicons name="list-outline" size={48} className="text-tertiary-500" />
      <Text className="mt-3 text-base text-tertiary-500">暂无操作记录/点击设备列表勾选设备操作</Text>
    </View>
  );

  const ListFooterComponent = () => (
    <View className="py-4 items-center">
      {operations.length > 0 ? (
        <Text className="text-sm text-tertiary-500">
          暂无更多操作记录
        </Text>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-background-50">
      {/* 统计信息 */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          {/*   <Text className="text-base font-medium mr-4">总记录: {stats.total}</Text> */}
          <Text className="text-base text-warning-500 mr-4">警告: {stats.warning}</Text>
          <Text className="text-base text-success-500">信息: {stats.info}</Text>
        </View>
        <View className="flex-row items-center">
          {isEditMode ? (
            <>
              <TouchableOpacity
                onPress={handleSelectAll}
                className="bg-primary-500 px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-white">
                  {selectedOperations.size === operations.length ? '取消全选' : '全选'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteSelected}
                className="bg-error-500 px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-white">删除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleEditMode}
                className="bg-gray-500 px-3 py-1 rounded-full"
              >
                <Text className="text-white">完成</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={toggleEditMode}
              className="bg-primary-500 px-3 py-1 rounded-full"
            >
              <Text className="text-white">编辑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlashList
        data={operations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => (
          <View className="h-2" />
        )}
      />

      <GestureDetector gesture={panGesture}>
        <View style={{ paddingBottom: tabBarHeight + 16 }} className="p-4 pb-4 bg-background-50 border-t border-outline-200">
          {renderLoopButtons()}
          {renderOperationButtons()}
        </View>
      </GestureDetector>

      <PasswordModal
        visible={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setCurrentOperation(null);
        }}
        onConfirm={handlePasswordConfirm}
        loading={isLoading}
        title={currentOperation === 'check' ? '请输入检测密码' : '请输入操作密码'}
      />
    </View>
  );
};

export default EboxOperationList;