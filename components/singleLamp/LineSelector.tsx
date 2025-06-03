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
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-gray-500 text-center">暂无线路数据</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="bg-white border-b border-gray-200"
    >
      <View className="flex-row px-2 py-2">
        {lines.map((line) => (
          <TouchableOpacity
            key={line.id}
            onPress={() => handleSelectLine(line)}
            className={`px-4 py-2 mx-1 rounded-full ${
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
  );
};

export default LineSelector;