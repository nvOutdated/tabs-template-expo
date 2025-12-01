import { Area } from '@/components/collection/CollectionAreaDrawer';
import CollectionDeviceSelector from '@/components/collection/CollectionDeviceSelector';
import CollectionEboxDrawer, { Ebox } from '@/components/collection/CollectionEboxDrawer';
import CollectionHeader from '@/components/collection/CollectionHeader';
import CollectionLineSelector from '@/components/collection/CollectionLineSelector';
import type { CollectionItem } from '@/components/collection/CollectionList';
import SingleLampEditModal, { SingleLamp, SingleLampEditModalOverrides, SingleLampSubmitContext } from '@/components/collection/CollectionSingleLampEditModel';
import CollectionSingleLampList from '@/components/collection/CollectionSingleLampList';
import RemoveTipModal from '@/components/public/publicModal/removeTipmodal';
import { showMessageModal } from '@/components/ui/MessageGlobalModal';
import { addSingleLamp, deleteSingleLamp, getLinesByEboxId, getSingleLampById, getSingleLampList, initDatabase, Line, SingleLampData, StoredSingleLamp, updateSingleLamp } from '@/services/database';
import { useAreaStore } from '@/store/areaStore';
import { useCollectionUIStore } from '@/store/collectionUIStore';
import useLoadingStore from '@/store/loadingStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const createEmptyLamp = (lineId?: number): SingleLamp => ({
    id: 0,
    poleName: '',
    poleCode: '',
    poleType: '1',
    installTime: null,
    lng: 0,
    lat: 0,
    addr: null,
    direction: 1,
    controllers: [],
    line_id: lineId ?? 0,
});

const mapStoredLampToForm = (record: StoredSingleLamp, fallbackLineId?: number): SingleLamp => ({
    id: record.id,
    poleName: record.pole_name || record.pole_code || '',
    poleCode: record.pole_code || '',
    poleType: record.pole_type || '1',
    installTime: record.install_time || null,
    lng: record.lng ? Number(record.lng) : 0,
    lat: record.lat ? Number(record.lat) : 0,
    addr: record.addr || record.location || null,
    direction: record.direction ? Number(record.direction) : 1,
    controllers: record.controllers || [],
    line_id: record.line_id ? Number(record.line_id) : fallbackLineId || 0,
});

export default function SingleLampScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [searchText, setSearchText] = useState('');
    const [selectedArea, setSelectedArea] = useState<Area>({
        area_id: 0,
        name: '',
        children: [],
    });
    const [selectedEbox, setSelectedEbox] = useState<Ebox | null>(null);
    const [selectedLine, setSelectedLine] = useState<Line | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    const loadingRef = useRef(false);
    const endReachedRef = useRef(false);
    const { allAreaList } = useAreaStore();
    const { setSelectedAreaId } = useCollectionUIStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<CollectionItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLampId, setEditingLampId] = useState<number | null>(null);
    const [editLampInfo, setEditLampInfo] = useState<SingleLamp>(createEmptyLamp());

    // Sync selected area ID to store
    useEffect(() => {
        setSelectedAreaId(selectedArea.area_id);
    }, [selectedArea.area_id, setSelectedAreaId]);

    const loadLines = useCallback((eboxId: number) => {
        try {
            const lineList = getLinesByEboxId(eboxId);
            setLines(lineList);
            if (lineList.length > 0) {
                setSelectedLine(lineList[0]);
            } else {
                setSelectedLine(null);
                setItems([]);
            }
        } catch (error) {
            console.error('加载线路列表失败:', error);
            setLines([]);
            setSelectedLine(null);
        }
    }, []);

    useEffect(() => {
        if (selectedEbox) {
            loadLines(selectedEbox.id);
        }
    }, [selectedEbox, loadLines]);

    const loadCollectionList = useCallback(
        async (page: number, isRefresh: boolean = false) => {
            if (loadingRef.current) return;
            if (!selectedLine) {
                setItems([]);
                return;
            }

            try {
                loadingRef.current = true;
                setLoading(true);
                const params = {
                    page_size: pageSize,
                    current: page,
                    line_id: selectedLine.id,
                    ebox_id: selectedEbox?.id || null,
                    pole_code: searchText || null,
                };
                const data = getSingleLampList(params);

                const itemsWithAreaNames = data.map((item: StoredSingleLamp) => {
                    const normalizedLineId = item.line_id === null || item.line_id === undefined ? undefined : Number(item.line_id);
                    const normalizedEboxId = item.ebox_id === null || item.ebox_id === undefined ? undefined : Number(item.ebox_id);
                    return {
                        id: item.id,
                        name: item.pole_name || item.pole_code,
                        sn: item.addr || item.location || '无位置信息',
                        area_id: item.area_id as number,
                        area_name: allAreaList.find(a => a.area_id === item.area_id)?.name || '未知区域',
                        created_at: item.created_at,
                        pole_code: item.pole_code,
                        pole_type: item.pole_type,
                        location: item.addr || item.location,
                        addr: item.addr,
                        direction: item.direction ? Number(item.direction) : undefined,
                        line_id: normalizedLineId,
                        ebox_id: normalizedEboxId,
                        lat: item.lat,
                        lng: item.lng,
                        controllers: item.controllers,
                        container_id: item.container_id,
                        originalData: item
                    };
                });

                setItems((prev) => {
                    if (isRefresh) return itemsWithAreaNames;
                    const existingIds = new Set(prev.map((item) => item.id));
                    const uniqueNewItems = itemsWithAreaNames.filter(
                        (item: any) => !existingIds.has(item.id)
                    );
                    return [...prev, ...uniqueNewItems];
                });

                const hasMoreData = itemsWithAreaNames.length >= pageSize;
                setHasMore(hasMoreData);
                endReachedRef.current = !hasMoreData;
                setCurrentPage(page);
            } catch (error) {
                console.error('加载单灯列表失败:', error);
                if (isRefresh) {
                    setItems([]);
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
                loadingRef.current = false;
            }
        },
        [selectedLine, selectedEbox, searchText, pageSize, allAreaList]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (selectedEbox) {
            loadLines(selectedEbox.id);
        }
        setSearchText('');
        setCurrentPage(1);
        setHasMore(true);
        endReachedRef.current = false;
        loadCollectionList(1, true);
    }, [loadCollectionList, selectedEbox, loadLines]);

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            if (selectedLine) {
                setCurrentPage(1);
                loadCollectionList(1, true);
            }
        }, [loadCollectionList, selectedLine])
    );

    React.useEffect(() => {
        if (currentPage === 0) return;
        setCurrentPage(1);
        loadCollectionList(1, true);
    }, [searchText, selectedLine?.id]);

    const onEndReached = useCallback(() => {
        if (!refreshing && hasMore && !loading && !endReachedRef.current) {
            loadCollectionList(currentPage + 1);
        }
    }, [hasMore, refreshing, loading, currentPage, loadCollectionList]);

    const handleSearch = useCallback((text: string) => {
        setSearchText(text);
    }, []);

    const handleOpenDrawer = useCallback(() => {
        setShowDrawer(true);
    }, []);

    const handleSelectEbox = useCallback((ebox: Ebox) => {
        setSelectedEbox(ebox);
        setShowDrawer(false);
        loadLines(ebox.id);
    }, [loadLines]);

    const handleSelectLine = useCallback((line: Line) => {
        setSelectedLine(line);
    }, []);

    const handleEditItem = useCallback((item: CollectionItem) => {
        if (!selectedLine) {
            Alert.alert('提示', '请先选择线路');
            return;
        }
        const record = getSingleLampById(item.id);
        if (!record) {
            Alert.alert('提示', '未找到单灯记录');
            return;
        }
        setEditLampInfo(mapStoredLampToForm(record, selectedLine.id));
        setEditingLampId(item.id);
        setShowEditModal(true);
    }, [selectedLine]);

    const handleDeleteItem = useCallback((item: CollectionItem) => {
        setRemoveTarget(item);
        setRemoveModalVisible(true);
    }, []);

    const handleRemoveConfirm = async () => {
        if (!removeTarget) return;
        try {
            showLoading();
            deleteSingleLamp(removeTarget.id);
            // 刷新列表
            setCurrentPage(1);
            setHasMore(true);
            endReachedRef.current = false;
            await loadCollectionList(1, true);
            showMessageModal({ type: 'success', message: '删除成功' });
        } catch (e) {
            showMessageModal({ type: 'error', message: '删除失败' });
        } finally {
            setRemoveModalVisible(false);
            setRemoveTarget(null);
            hideLoading();
        }
    };

    const handleRemoveCancel = () => {
        setRemoveModalVisible(false);
        setRemoveTarget(null);
    };

    const handleModalClose = useCallback(() => {
        setShowEditModal(false);
        setEditingLampId(null);
    }, []);

    const handleModalSuccess = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);
        endReachedRef.current = false;
        loadCollectionList(1, true);
        setShowEditModal(false);
        setEditingLampId(null);
    }, [loadCollectionList]);

    const modalOverrides = useMemo<SingleLampEditModalOverrides>(() => {
        const persist = async (contextMode: 'create' | 'update', context: SingleLampSubmitContext): Promise<{ success: boolean; message?: string }> => {
            if (!selectedEbox) {
                return { success: false, message: '请先选择集中器' };
            }
            const { formData, lineInfo } = context;
            const areaId = selectedArea.area_id || 0;
            const payload: SingleLampData = {
                pole_code: formData.poleCode,
                pole_name: formData.poleName,
                pole_type: formData.poleType,
                location: formData.addr || '',
                addr: formData.addr || '',
                area_id: areaId,
                line_id: lineInfo?.id,
                ebox_id: selectedEbox.id,
                lng: formData.lng?.toString() || '',
                lat: formData.lat?.toString() || '',
                direction: formData.direction,
                install_time: formData.installTime,
                controllers: formData.controllers,
            };

            if (contextMode === 'create') {
                addSingleLamp(payload);
                return { success: true, message: '采集记录已保存' };
            }

            if (!formData.id) {
                return { success: false, message: '缺少单灯ID' };
            }

            updateSingleLamp(formData.id, payload);
            return { success: true, message: '采集记录已更新' };
        };

        return {
            onSubmitBatchAdd: async (context) => persist('create', context),
            onSubmitLightPole: async (context) => persist('update', context),
            onSubmitController: async (context) => persist('update', context),
        };
    }, [selectedArea.area_id, selectedEbox]);

    const handleAddLamp = useCallback(() => {
        if (!selectedEbox) {
            Alert.alert('提示', '请先选择集中器');
            return;
        }
        if (!selectedLine) {
            Alert.alert('提示', '请先选择线路');
            return;
        }
        setEditLampInfo(createEmptyLamp(selectedLine.id));
        setEditingLampId(null);
        setShowEditModal(true);
    }, [selectedEbox, selectedLine]);

    const renderEmptyState = () => {
        if (!selectedEbox) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <Text className="text-gray-500">请先选择一个集中器</Text>
                </View>
            );
        }
        if (lines.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="add-circle-outline" size={48} color="#999" />
                        <Text className="text-gray-500 mt-4 mb-4">该集中器下暂无线路数据</Text>
                        <Text className="text-gray-400 text-sm">请在线路选择器中点击线路管理添加线路</Text>
                    </View>
                </View>
            );
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <View style={{ alignItems: 'center' }}>
                    <Ionicons name="add-circle-outline" size={48} color="#999" />
                    <Text className="text-gray-500 mt-4 mb-4">暂无单灯数据</Text>
                </View>
            </View>
        );
    };

    return (
        <GestureHandlerRootView className="flex-1">
            <View style={styles.container}>
                <CollectionDeviceSelector
                    selectedEbox={selectedEbox}
                    onSelectDevice={handleOpenDrawer}
                    onAddLamp={handleAddLamp}
                    hasLine={!!selectedLine}
                />

                {selectedEbox && (
                    <CollectionLineSelector
                        lines={lines}
                        selectedLine={selectedLine}
                        onSelectLine={handleSelectLine}
                        eboxId={selectedEbox.id}
                        onRefreshLines={() => {
                            if (selectedEbox) {
                                loadLines(selectedEbox.id);
                            }
                        }}
                    />
                )}

                <CollectionHeader
                    onSearch={handleSearch}
                    onOpenDrawer={handleOpenDrawer}
                    selectedArea={selectedArea}
                    searchText={searchText}
                    showOpenDrawer={false}
                    placeholder="搜索灯杆编号"
                />

                {!selectedEbox || lines.length === 0 || items.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <CollectionSingleLampList
                        items={items}
                        loading={loading}
                        hasMore={hasMore}
                        onEndReached={onEndReached}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )}
            </View>

            <CollectionEboxDrawer
                visible={showDrawer}
                onClose={() => setShowDrawer(false)}
                selectedEbox={selectedEbox}
                onSelectEbox={handleSelectEbox}
            />

            <RemoveTipModal
                visible={removeModalVisible}
                onCancel={handleRemoveCancel}
                onConfirm={handleRemoveConfirm}
                title="删除确认"
                message={`确定要删除灯杆 ${removeTarget?.name} 吗？此操作不可撤销。`}
            />

            {selectedLine && (
                <SingleLampEditModal
                    visible={showEditModal}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    lineInfo={selectedLine}
                    lampId={editingLampId ?? undefined}
                    contactors={[]}
                    lampInfo={editLampInfo}
                    overrides={modalOverrides}
                />
            )}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});
