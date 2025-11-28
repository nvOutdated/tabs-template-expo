import AreaForm, { AreaFormData } from '@/components/area/AreaForm';
import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { useCollectionEntitiesStore } from '@/store/collectionEntitiesStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AreaNode {
    area_id: number;
    name: string;
    adcode: string;
    area_type: 'area' | 'road';
    pid?: number | null;
    remark?: string;
    children?: AreaNode[];
}

export default function AreaScreen() {
    const currentTheme = useCurrentTheme();
    const insets = useSafeAreaInsets();
    const [expandedAreas, setExpandedAreas] = useState<Set<number>>(new Set());
    const [searchText, setSearchText] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'addChild'>('add');
    const [selectedArea, setSelectedArea] = useState<AreaNode | null>(null);
    const [parentArea, setParentArea] = useState<{ area_id: number; name: string; adcode: string } | null>(null);
    const areaTree = useCollectionEntitiesStore(state => state.areaTree as AreaNode[]);
    const flatAreas = useCollectionEntitiesStore(state => state.flatAreas as AreaNode[]);
    const refreshAreas = useCollectionEntitiesStore(state => state.refreshAreas);
    const createArea = useCollectionEntitiesStore(state => state.createArea);
    const editArea = useCollectionEntitiesStore(state => state.editArea);
    const deleteAreaCascade = useCollectionEntitiesStore(state => state.deleteAreaCascade);
    const initializedRef = useRef(false);

    useEffect(() => {
        refreshAreas();
    }, [refreshAreas]);

    useEffect(() => {
        if (!initializedRef.current && flatAreas.length) {
            setExpandedAreas(new Set(flatAreas.map(a => a.area_id)));
            initializedRef.current = true;
        }
    }, [flatAreas]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refreshAreas();
        setRefreshing(false);
    }, [refreshAreas]);

    const toggleExpand = (areaId: number) => {
        setExpandedAreas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(areaId)) {
                newSet.delete(areaId);
            } else {
                newSet.add(areaId);
            }
            return newSet;
        });
    };

    const handleAdd = () => {
        setFormMode('add');
        setSelectedArea(null);
        setParentArea(null);
        setFormVisible(true);
    };

    const handleAddChild = (area: AreaNode) => {
        setFormMode('addChild');
        setSelectedArea(null);
        setParentArea({ area_id: area.area_id, name: area.name, adcode: area.adcode });
        setFormVisible(true);
    };

    const handleEdit = (area: AreaNode) => {
        setFormMode('edit');
        setSelectedArea(area);
        setParentArea(null);
        setFormVisible(true);
    };

    const handleDelete = (area: AreaNode) => {
        Alert.alert(
            '确认删除',
            `确定要删除区域"${area.name}"吗？${area.children && area.children.length > 0 ? '这将同时删除所有子区域。' : ''}`,
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '删除',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            deleteAreaCascade(area.area_id);
                            Alert.alert('成功', '删除成功');
                        } catch (error) {
                            Alert.alert('错误', '删除失败');
                        }
                    },
                },
            ]
        );
    };

    const handleFormSubmit = (data: AreaFormData) => {
        try {
            if (formMode === 'edit' && selectedArea) {
                editArea(selectedArea.area_id, data);
                Alert.alert('成功', '修改成功');
            } else {
                createArea(data);
                Alert.alert('成功', '新增成功');
            }
            setFormVisible(false);
        } catch (error) {
            Alert.alert('错误', '操作失败');
        }
    };

    const filterAreas = (areas: AreaNode[], searchText: string): AreaNode[] => {
        if (!searchText) return areas;

        const filtered: AreaNode[] = [];

        areas.forEach(area => {
            const matches = area.name.toLowerCase().includes(searchText.toLowerCase());
            const filteredChildren = area.children ? filterAreas(area.children, searchText) : [];

            if (matches || filteredChildren.length > 0) {
                filtered.push({
                    ...area,
                    children: filteredChildren.length > 0 ? filteredChildren : area.children,
                });
            }
        });

        return filtered;
    };

    const renderAreaItem = (area: AreaNode, level: number = 0) => {
        const isExpanded = expandedAreas.has(area.area_id);
        const hasChildren = area.children && area.children.length > 0;
        const paddingLeft = 16 + level * 20;

        return (
            <View key={area.area_id}>
                <View
                    style={[
                        styles.areaItem,
                        { paddingLeft, backgroundColor: currentTheme.headerBg, borderBottomColor: currentTheme.inactiveTint + '40' },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.areaContent}
                        onPress={() => hasChildren && toggleExpand(area.area_id)}
                    >
                        {hasChildren && (
                            <Ionicons
                                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                                size={20}
                                color={currentTheme.textColor}
                                style={styles.expandIcon}
                            />
                        )}
                        {!hasChildren && <View style={styles.expandIcon} />}
                        <View style={styles.areaInfo}>
                            <Text style={[styles.areaName, { color: currentTheme.textColor }]}>
                                {area.name}
                            </Text>
                            <Text style={[styles.areaType, { color: currentTheme.inactiveTint }]}>
                                {area.area_type === 'area' ? '行政区域' : '道路'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleAddChild(area)}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={currentTheme.activeTint} />
                        </TouchableOpacity>
                        {area.area_type === 'road' && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleEdit(area)}
                            >
                                <Ionicons name="create-outline" size={20} color={currentTheme.activeTint} />
                            </TouchableOpacity>
                        )}
                        {area.remark && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => Alert.alert('备注信息', area.remark || '无')}
                            >
                                <Ionicons name="document-text-outline" size={20} color={currentTheme.inactiveTint} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(area)}
                        >
                            <Ionicons name="trash-outline" size={20} color="#F56C6C" />
                        </TouchableOpacity>
                    </View>
                </View>

                {isExpanded && hasChildren && (
                    <View>
                        {area.children!.map(child => renderAreaItem(child, level + 1))}
                    </View>
                )}
            </View>
        );
    };

    const filteredAreas = useMemo(() => filterAreas(areaTree, searchText), [areaTree, searchText]);

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.drawerBg }]}>
            {/* Header with Safe Area */}
            <View style={[styles.header, { backgroundColor: currentTheme.headerBg, borderBottomColor: currentTheme.inactiveTint + '40', paddingTop: insets.top + 12 }]}>
                <View style={styles.searchRow}>
                    <View style={[styles.searchContainer, { backgroundColor: currentTheme.activeBg }]}>
                        <Ionicons name="search" size={20} color={currentTheme.inactiveTint} />
                        <TextInput
                            style={[styles.searchInput, { color: currentTheme.textColor }]}
                            placeholder="输入关键字进行过滤"
                            placeholderTextColor={currentTheme.inactiveTint}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText ? (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Ionicons name="close-circle" size={20} color={currentTheme.inactiveTint} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: currentTheme.activeTint }]}
                        onPress={handleAdd}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Area List */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredAreas.length > 0 ? (
                    filteredAreas.map(area => renderAreaItem(area))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color={currentTheme.inactiveTint} />
                        <Text style={[styles.emptyText, { color: currentTheme.inactiveTint }]}>
                            {searchText ? '未找到匹配的区域' : '暂无区域数据'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Form Modal */}
            <AreaForm
                visible={formVisible}
                onClose={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedArea || undefined}
                parentArea={parentArea}
                mode={formMode}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
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
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        lineHeight: 40,
        padding: 0,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    areaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingRight: 12,
        borderBottomWidth: 1,
    },
    areaContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandIcon: {
        width: 20,
        marginRight: 8,
    },
    areaInfo: {
        flex: 1,
    },
    areaName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    areaType: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 14,
        marginTop: 16,
    },
});
