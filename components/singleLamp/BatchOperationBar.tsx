import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface BatchOperationBarProps {
  onSearch: (text: string) => void;
  onEdit: () => void;
  selectedCount: number;
  totalCount: number;
}

const BatchOperationBar: React.FC<BatchOperationBarProps> = ({
  onSearch,
  onEdit,
  selectedCount,
  totalCount,
}) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索控制器编号..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]} 
            onPress={onEdit}
            disabled={selectedCount === 0}
          >
            <Text style={[styles.buttonText, selectedCount === 0 && styles.buttonTextDisabled]}>
              编辑 
             {/*  ({selectedCount}/{totalCount}) */}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 32,
    marginRight: 2,
    minWidth: '50%',
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    height: 28,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});

export default BatchOperationBar; 