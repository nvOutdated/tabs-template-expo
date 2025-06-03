import { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Line {
  id: number;
  name: string;
}

interface LineSelectorProps {
  lines: Line[];
  selectedLine: Line | null;
  onSelectLine: (line: Line) => void;
}

const LineSelector = ({ lines, selectedLine, onSelectLine }: LineSelectorProps) => {
  const handleSelectLine = useCallback((line: Line) => {
    onSelectLine(line);
  }, [onSelectLine]);

  if (lines.length === 0) {
    return (
      <View className="h-12 bg-white border-b border-gray-200 justify-center">
        <Text className="text-gray-500 text-center text-sm">暂无线路数据</Text>
      </View>
    );
  }

  return (
    <View className="h-12 bg-white border-b border-gray-200">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ height: 48 }}
        contentContainerStyle={{
          height: 48,
          alignItems: 'center',
        }}
      >
        <View className="flex-row px-2 h-full items-center">
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
  );
};

export default LineSelector;