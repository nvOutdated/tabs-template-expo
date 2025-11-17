import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Message {
  id: string;
  content: string;
  timestamp: number;
}

interface MessagePanelProps {
  messages: Message[];
  onClearMessages: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ messages, onClearMessages }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '75%'], []);
  const currentTheme = useCurrentTheme();

  const renderItem = useCallback(({ item }: { item: Message }) => {
    return(
      <View className="p-4 border-b border-gray-200">
        <Text className="text-gray-800">{item.content}</Text>
        <Text className="text-xs text-gray-500 mt-1">
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    )
  }, []);

  const renderHeader = useCallback(() => (
    <View className="flex-row items-center justify-between px-2 border border-gray-200 py-1">
      <Text className="text-lg font-semibold">消息列表 ({messages.length})</Text>
      <TouchableOpacity
        onPress={onClearMessages}
        className="flex-row items-center"
      >
        <Ionicons name="trash-outline" size={20} color="#666" />
        <Text className="text-gray-600 ml-1">清空</Text>
      </TouchableOpacity>
    </View>
  ), [messages.length, onClearMessages]);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: currentTheme.activeTint,
          width: 40,
          height: 4,
        }}
        backgroundStyle={{backgroundColor:'transparent'}}
      >
        <BottomSheetFlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
          style={{backgroundColor:currentTheme.headerBg}}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  background: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default MessagePanel;