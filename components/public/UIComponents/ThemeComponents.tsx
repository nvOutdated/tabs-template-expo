import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    FlatListProps,
    Image,
    ImageProps,
    Modal,
    ModalProps,
    Pressable,
    PressableProps,
    ScrollView,
    ScrollViewProps,
    SectionList,
    SectionListProps,
    Switch,
    SwitchProps,
    Text,
    TextInput,
    TextInputProps,
    TextProps,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
} from 'react-native';

// ThemedView
export function ThemedView({ className = '', style, ...props }: ViewProps & { className?: string }) {
  return <View className={className} style={style} {...props} />;
}

// ThemedText
export function ThemedText({ className = '', style, ...props }: TextProps & { className?: string }) {
  return <Text className={className} style={style} {...props} />;
}

// ThemedButton
export function ThemedButton({
  className = '',
  textClassName = '',
  children,
  ...props
}: PressableProps & { className?: string; textClassName?: string; children: React.ReactNode }) {
  return (
    <Pressable className={`h-11 rounded-lg items-center justify-center bg-primary-500 ${className}`} {...props}>
      <Text className={`text-white text-base font-semibold ${textClassName}`}>{children}</Text>
    </Pressable>
  );
}

// ThemedInputText
export function ThemedInputText({
  className = '',
  ...props
}: TextInputProps & { className?: string }) {
  return (
    <TextInput
      className={`h-11 border border-tertiary-200 rounded-lg px-3 text-base text-tertiary-900 bg-white ${className}`}
      placeholderTextColor="#999"
      {...props}
    />
  );
}

// ThemedScrollView
export function ThemedScrollView({
  className = '',
  ...props
}: ScrollViewProps & { className?: string }) {
  return <ScrollView className={className} {...props} />;
}

// ThemedTouchableOpacity
export function ThemedTouchableOpacity({
  className = '',
  ...props
}: TouchableOpacityProps & { className?: string }) {
  return <TouchableOpacity className={className} {...props} />;
}

// ThemedImage
export function ThemedImage({
  className = '',
  ...props
}: ImageProps & { className?: string }) {
  return <Image className={className} {...props} />;
}

// ThemedActivityIndicator
export function ThemedActivityIndicator({
  className = '',
  ...props
}: { className?: string } & Omit<ViewProps, 'children'>) {
  return <ActivityIndicator className={className} {...props} />;
}

// ThemedModal
export function ThemedModal({
  className = '',
  ...props
}: ModalProps & { className?: string }) {
  return <Modal className={className} {...props} />;
}

// ThemedFlatList
export function ThemedFlatList<T>({
  className = '',
  ...props
}: FlatListProps<T> & { className?: string }) {
  return <FlatList className={className} {...props} />;
}

// ThemedSectionList
export function ThemedSectionList<T, S>({
  className = '',
  ...props
}: SectionListProps<T, S> & { className?: string }) {
  return <SectionList className={className} {...props} />;
}

// ThemedSwitch
export function ThemedSwitch({
  className = '',
  ...props
}: SwitchProps & { className?: string }) {
  return <Switch className={className} {...props} />;
}
