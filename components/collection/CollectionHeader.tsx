import { Area } from '@/components/collection/CollectionAreaDrawer';
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface CollectionHeaderProps {
  onSearch: (text: string) => void;
  onOpenDrawer: () => void;
  selectedArea?: Area;
  searchText?: string;
  placeholder?: string;
  showOpenDrawer?: boolean;
}

const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  onSearch,
  onOpenDrawer,
  selectedArea,
  searchText = '',
  placeholder = '搜索设备名称或编号',
  showOpenDrawer = true,
}) => {
  const currentTheme = useCurrentTheme();
  const [localSearchText, setLocalSearchText] = useState(searchText);

  const handleSearchChange = (text: string) => {
    setLocalSearchText(text);
    onSearch(text);
  };

  const handleClearSearch = () => {
    setLocalSearchText('');
    onSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.headerBg }]}>
      {/* 搜索栏 */}
      <View style={styles.searchRow}>
        {showOpenDrawer && (
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: currentTheme.drawerBg }]}
            onPress={onOpenDrawer}
          >
            <Ionicons name="filter" size={20} color={currentTheme.activeTint} />
          </TouchableOpacity>
        )}
        <View style={[styles.searchContainer, { backgroundColor: currentTheme.drawerBg }]}>
          <Ionicons name="search" size={20} color={currentTheme.inactiveTint} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.activeTint }]}
            placeholder={placeholder}
            placeholderTextColor={currentTheme.inactiveTint}
            value={localSearchText}
            onChangeText={handleSearchChange}
          />
          {localSearchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={currentTheme.inactiveTint} />
            </TouchableOpacity>
          )}
        </View>


      </View>

      {/* 选中的区域显示 */}
      {selectedArea && selectedArea.area_id > 0 && (
        <View style={styles.selectedAreaContainer}>
          <Text style={[styles.selectedAreaText, { color: currentTheme.activeTint }]}>
            当前区域: {selectedArea.name}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 22,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    lineHeight: 30,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAreaContainer: {
    marginTop: 8,
    paddingVertical: 6,
  },
  selectedAreaText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CollectionHeader;
