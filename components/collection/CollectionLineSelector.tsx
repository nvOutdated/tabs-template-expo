import { Line } from '@/services/database';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CollectionLineManageModal from './CollectionLineManageModal';

interface CollectionLineSelectorProps {
  lines: Line[];
  selectedLine: Line | null;
  onSelectLine: (line: Line) => void;
  eboxId?: number;
  onRefreshLines?: () => void;
}

const CollectionLineSelector = ({ 
  lines, 
  selectedLine, 
  onSelectLine,
  eboxId,
  onRefreshLines,
}: CollectionLineSelectorProps) => {
  const [showLineManageModal, setShowLineManageModal] = useState(false);

  const handleSelectLine = useCallback((line: Line) => {
    onSelectLine(line);
  }, [onSelectLine]);

  const handleLineManage = useCallback(() => {
    setShowLineManageModal(true);
  }, []);

  const handleRefreshLines = useCallback(() => {
    if (onRefreshLines) {
      onRefreshLines();
    }
  }, [onRefreshLines]);

  return (
    <>
      <View className="h-12 bg-white border-b border-gray-200 flex-row">
        <View className="w-[75%] h-full">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="h-full"
            contentContainerStyle={{
              height: 48,
              alignItems: 'center',
            }}
          >
            <View className="flex-row h-full items-center px-2">
              {lines.map((line) => (
                <TouchableOpacity
                  key={line.id}
                  onPress={() => handleSelectLine(line)}
                  className={`px-3 h-8 mx-1 rounded-full justify-center ${
                    selectedLine?.id === line.id
                      ? 'bg-blue-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selectedLine?.id === line.id
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {line.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="w-[25%] h-full flex-row items-center justify-end pr-2">
          <TouchableOpacity 
            className="h-10 px-3 rounded-md justify-center items-center bg-blue-500"
            onPress={handleLineManage}
          >
            <Text className="text-sm text-white">线路管理</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 线路管理弹窗 */}
      {eboxId && (
        <CollectionLineManageModal
          visible={showLineManageModal}
          onClose={() => setShowLineManageModal(false)}
          eboxId={eboxId}
          onRefresh={handleRefreshLines}
        />
      )}
    </>
  );
};

export default CollectionLineSelector;

