import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomSelectPickerProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  initialLabel: string;
  mode?: 'dropdown' | 'modal';
  searchable?: boolean;
  searchPlaceholder?: string;
  dropdownDirection?: 'bottom' | 'top';
  maxHeight?: number;
}

interface ButtonLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CustomSelectPicker({
  options,
  value,
  placeholder = "请选择",
  onChange,
  disabled = false,
  className = "",
  initialLabel,
  mode = 'dropdown',
  searchable = false,
  searchPlaceholder = "搜索...",
  dropdownDirection = 'bottom',
  maxHeight = 300,
}: CustomSelectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout | null>(null);
  const buttonRef = useRef<View>(null);
  const translateY = useSharedValue(0);
  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const calculateDropdownPosition = () => {
    if (!buttonLayout) return {};
    
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    
    // 检查下拉框是否超出屏幕底部
    const spaceBelow = screenHeight - buttonLayout.y - buttonLayout.height;
    const spaceAbove = buttonLayout.y;
    
    // 决定显示方向
    const shouldShowAbove = dropdownDirection === 'top' || 
      (dropdownDirection === 'bottom' && spaceBelow < maxHeight && spaceAbove > spaceBelow);
    
    // 计算位置
    let left = buttonLayout.x;
    let width = buttonLayout.width;
    
    // 确保不超出屏幕右边
    if (left + width > screenWidth - 16) {
      left = screenWidth - width - 16;
    }
    
    // 确保不超出屏幕左边
    if (left < 16) {
      left = 16;
      width = Math.min(width, screenWidth - 32);
    }
    
    const position: any = {
      left,
      width,
      maxHeight: shouldShowAbove ? Math.min(maxHeight, spaceAbove - 20) : Math.min(maxHeight, spaceBelow - 20),
    };
    
    if (shouldShowAbove) {
      position.bottom = screenHeight - buttonLayout.y + 4;
    } else {
      position.top = buttonLayout.y + buttonLayout.height -25;
    }
    
    return position;
  };

  const handleOpen = () => {
    if (disabled) return;
    
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setButtonLayout({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setIsOpen(true);
    });
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchText('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchText('');
    setButtonLayout(null);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (mode === 'modal') {
        translateY.value = Math.max(0, event.translationY);
      }
    })
    .onEnd((event) => {
      if (mode === 'modal' && event.translationY > 100) {
        handleClose();
      }
      translateY.value = withSpring(0);
    });

  const renderModalContent = () => (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
      style={animatedStyle}
    >
      <View className="w-full items-center py-2">
        <View className="w-12 h-1 bg-gray-300 rounded-full" />
      </View>
      
      {searchable && (
        <View className="px-4 py-1 border-b border-gray-100">
          <TextInput
            className="h-10 px-3 bg-gray-50 rounded-lg text-base py-1 text-gray-900"
            placeholder={searchPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      )}

      <ScrollView style={{ maxHeight }}>
        {filteredOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            disabled={option.disabled}
            className={`
              px-4 py-3 border-b border-gray-100
              ${option.disabled ? 'opacity-50' : ''}
              ${option.value === value ? 'bg-gray-50' : ''}
            `}
          >
            <Text className="text-base text-gray-900">{option.label}</Text>
          </Pressable>
        ))}

        {searchable && filteredOptions.length === 0 && (
          <View className="px-4 py-3">
            <Text className="text-base text-gray-500 text-center">无匹配结果</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderDropdownContent = () => (
    <>
      {searchable && (
        <View className="px-4 py-1 border-b border-gray-100">
          <TextInput
            className="h-10 px-3 bg-gray-50 rounded-lg text-base py-1 text-gray-900"
            placeholder={searchPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      )}

      <ScrollView style={{ maxHeight }} nestedScrollEnabled>
        {filteredOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            disabled={option.disabled}
            className={`
              px-4 py-3 border-b border-gray-100
              ${option.disabled ? 'opacity-50' : ''}
              ${option.value === value ? 'bg-gray-50' : ''}
            `}
          >
            <Text className="text-base text-gray-900">{option.label}</Text>
          </Pressable>
        ))}

        {searchable && filteredOptions.length === 0 && (
          <View className="px-4 py-3">
            <Text className="text-base text-gray-500 text-center">无匹配结果</Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  return (
    <View className={`w-full ${className} relative`}>
      <Pressable
        ref={buttonRef}
        onPress={handleOpen}
        disabled={disabled}
        className={`
          flex-1 justify-between px-4 h-12 bg-white border border-gray-200 rounded-lg
          flex-row items-center
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text className="text-base text-gray-900">
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </Pressable>

      {isOpen && (
        mode === 'modal' ? (
          <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={handleClose}
            >
              <Pressable onPress={() => {}}>
                <GestureDetector gesture={gesture}>
                  {renderModalContent()}
                </GestureDetector>
              </Pressable>
            </Pressable>
          </Modal>
        ) : (
          buttonLayout && (
            <Modal
              visible={isOpen}
              transparent
              animationType="none"
              onRequestClose={handleClose}
            >
              <View style={styles.dropdownModalContainer}>
                {/* 背景覆盖层 */}
                <Pressable
                  style={StyleSheet.absoluteFillObject}
                  onPress={handleClose}
                />
                
                {/* 下拉内容 - 根据按钮位置精确定位 */}
                <View
                  style={[
                    styles.dropdownInModal,
                    calculateDropdownPosition()
                  ]}
                  className="bg-white rounded-lg"
                >
                  {renderDropdownContent()}
                </View>
              </View>
            </Modal>
          )
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownInModal: {
    position: 'absolute',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
});