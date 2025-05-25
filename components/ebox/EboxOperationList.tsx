import { useCustomToast } from '@/components/public/UIComponents/ToastComponent';
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import PasswordModal from '@/components/ui/PasswordModal';
import { useEboxStore } from '@/store/eboxStore';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInLeft, FadeOutRight, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

type LoopButton = {
  id: number;
  isActive: boolean;
};

type EboxOperationListProps = {
  operations: EboxOperation[];
  onOperationSelect: (operation: EboxOperation) => void;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const EboxOperationList: React.FC<EboxOperationListProps> = ({
  operations,
  onOperationSelect,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const currentTheme = useCurrentTheme();
  const [selectedOperations, setSelectedOperations] = useState<Set<string>>(new Set());
  const [loopButtons, setLoopButtons] = useState<LoopButton[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, isActive: false }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const [initialTouchIndex, setInitialTouchIndex] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'open' | 'close' | 'check' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedDevices, allEboxes } = useEboxStore();
  const toast = useCustomToast();

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

  const toggleSelect = (id: string) => {
    setSelectedOperations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOperations.size === operations.length) {
      setSelectedOperations(new Set());
    } else {
      setSelectedOperations(new Set(operations.map(op => op.id)));
    }
  };

  const handleOperation = async (type: 'open' | 'close' | 'check') => {
    if (selectedDevices.size === 0) {
      toast.showError({
        message: '请先选择设备',
      });
      return;
    }

    setCurrentOperation(type);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!currentOperation) return;

    setIsLoading(true);
    try {
      // const deviceIds = Array.from(selectedDevices);
      // const selectedDevicesInfo = allEboxes.filter(device => deviceIds.includes(device.id));
      
      // let response;
      // if (currentOperation === 'check') {
      //   response = await fetch('/api/ebox/check-status', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       device_ids: deviceIds,
      //       password,
      //     }),
      //   });
      // } else {
      //   const loops = loopButtons.map(button => button.isActive);
      //   response = await fetch(`/api/ebox/${currentOperation === 'open' ? 'open' : 'close'}`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       device_ids: deviceIds,
      //       loops,
      //       password,
      //     }),
      //   });
      // }

      // const data = await response.json();
      // if (data.code === 200) {
      //   toast.showSuccess({
      //     message: '操作成功',
      //   });
      // } else {
      //   toast.showError({
      //     message: data.message || '操作失败',
      //   });
      // }
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

  const renderLoopButtons = () => (
    <View style={styles.loopContainer}>
      {loopButtons.map((button, index) => (
        <TouchableOpacity
          key={button.id}
          style={[
            styles.loopButton,
            button.isActive && styles.loopButtonActive
          ]}
          onPress={() => handleLoopPress(index)}
        >
          <Text style={[
            styles.loopButtonText,
            button.isActive && styles.loopButtonTextActive
          ]}>
            {button.id}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOperationButtons = () => (
    <View style={styles.operationContainer}>
      <TouchableOpacity 
        style={styles.operationButton} 
        className="bg-success-500"
        onPress={() => handleOperation('open')}
      >
        <Ionicons name="sunny" size={20} color="white" />
        <Text style={styles.operationButtonText}>开灯</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.operationButton} 
        className="bg-error-500"
        onPress={() => handleOperation('close')}
      >
        <Ionicons name="moon" size={20} color="white" />
        <Text style={styles.operationButtonText}>关灯</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.operationButton} 
        className="bg-info-500"
        onPress={() => handleOperation('check')}
      >
        <Ionicons name="analytics" size={20} color="white" />
        <Text style={styles.operationButtonText}>检测状态</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOperation = ({ item }: { item: EboxOperation }) => (
    <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
      <TouchableOpacity
        style={styles.operationItem}
        className="bg-background-50"
        onPress={() => onOperationSelect(item)}
      >
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleSelect(item.id)}
        >
          <Ionicons 
            name={selectedOperations.has(item.id) ? "checkbox" : "square-outline"} 
            size={24} 
            className={selectedOperations.has(item.id) ? "text-primary-500" : "text-tertiary-500"}
          />
        </TouchableOpacity>
        <View style={[styles.typeIndicator, styles[item.type]]} />
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} className="text-error-500" numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.module} className="bg-tertiary-100 text-tertiary-900">
              {item.module}
            </Text>
          </View>
          <Text style={styles.content} className="text-tertiary-900" numberOfLines={2}>
            {item.content}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.timestamp} className="text-tertiary-500">
              {formatDate(item.timestamp)}
            </Text>
            <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
              <Text style={styles.statusText}>
                {item.status === 'pending' ? '待处理' : 
                 item.status === 'processing' ? '处理中' : '已完成'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="list-outline" size={48} className="text-tertiary-500" />
      <Text style={styles.emptyText} className="text-tertiary-500">暂无操作记录</Text>
    </View>
  );

  const ListFooterComponent = () => (
    <View style={styles.footer}>
      {operations.length > 0 ? (
        <Text style={styles.footerText} className="text-tertiary-500">
          暂无更多操作记录
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container} className="bg-background-50">
      <FlatList
        data={operations}
        renderItem={renderOperation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          operations.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
      />
      <GestureDetector gesture={panGesture}>
        <View style={[styles.operationPanel, { paddingBottom: tabBarHeight + 16 }]} className="bg-background-50 border-t border-outline-200">
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  operationPanel: {
    padding: 16,
    paddingBottom: 16,
  },
  loopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  loopButton: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loopButtonActive: {
    backgroundColor: '#409EFF',
    borderColor: '#409EFF',
  },
  loopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loopButtonTextActive: {
    color: 'white',
  },
  operationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  operationButton: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  operationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  operationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkbox: {
    marginRight: 8,
    padding: 4,
  },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  alarm: {
    backgroundColor: '#F56C6C',
  },
  warning: {
    backgroundColor: '#E6A23C',
  },
  info: {
    backgroundColor: '#409EFF',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  module: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  status_pending: {
    backgroundColor: '#E6A23C',
  },
  status_processing: {
    backgroundColor: '#409EFF',
  },
  status_completed: {
    backgroundColor: '#67C23A',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default EboxOperationList; 