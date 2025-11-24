import CollectionHeader from '@/components/collection/CollectionHeader';
import CollectionList, { CollectionItem } from '@/components/collection/CollectionList';
import { Area } from '@/components/ebox/AreaDrawer';
import RemoveTipModal from '@/components/public/publicModal/removeTipmodal';
import { showMessageModal } from '@/components/ui/MessageGlobalModal';
import { deleteSingleLamp, getSingleLampList, initDatabase } from '@/services/database';
import { useAreaStore } from '@/store/areaStore';
import useLoadingStore from '@/store/loadingStore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SingleLampScreen() {
    const router = useRouter();
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
    const loadingRef = useRef(false);
    const endReachedRef = useRef(false);
    const { allAreaList } = useAreaStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<CollectionItem | null>(null);

    const loadCollectionList = useCallback(
        async (page: number, isRefresh: boolean = false) => {
            if (loadingRef.current) return;
            try {
                loadingRef.current = true;
                setLoading(true);
                const params = {
                    page_size: pageSize,
                    current: page,
                    area_id: selectedArea.area_id || null,
                    pole_code: searchText || null,
                };
                const data = getSingleLampList(params);

                // Add area names to items and map to CollectionItem format
                const itemsWithAreaNames = data.map((item: any) => ({
                    id: item.id,
                    name: item.pole_code, // Use pole_code as name for display
                    sn: item.location || '无位置信息', // Use location as SN/subtitle
                    area_id: item.area_id,
                    area_name: allAreaList.find(a => a.area_id === item.area_id)?.name || '未知区域',
                    created_at: item.created_at,
                    // Store original data for editing
                    originalData: item
                }));

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
        [selectedArea.area_id, searchText, pageSize, allAreaList]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setSelectedArea({
            area_id: 0,
            name: '',
            children: [],
        });
        setSearchText('');
        setCurrentPage(1);
        setHasMore(true);
        endReachedRef.current = false;
        loadCollectionList(1, true);
    }, [loadCollectionList]);

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            setCurrentPage(1);
            loadCollectionList(1, true);
        }, [loadCollectionList])
    );

    // Monitor search and area changes
    React.useEffect(() => {
        if (currentPage === 0) return;
        setCurrentPage(1);
        loadCollectionList(1, true);
    }, [searchText, selectedArea.area_id]);

    const onEndReached = useCallback(() => {
        if (!refreshing && hasMore && !loading && !endReachedRef.current) {
            loadCollectionList(currentPage + 1);
        }
    }, [hasMore, refreshing, loading, currentPage, loadCollectionList]);

    const handleSearch = useCallback((text: string) => {
        setSearchText(text);
        if (text) {
            setSelectedArea({} as Area);
        }
    }, []);

    const handleOpenDrawer = useCallback(() => {
        setShowDrawer(true);
    }, []);

    const handleEditItem = useCallback((item: CollectionItem) => {
        router.push({ pathname: '/collection/(modal)/addSingleLamp', params: { id: item.id } });
    }, [router]);

    const handleDeleteItem = useCallback((item: CollectionItem) => {
        setRemoveTarget(item);
        setRemoveModalVisible(true);
    }, []);

    const handleRemoveConfirm = async () => {
        if (!removeTarget) return;
        try {
            showLoading();
            deleteSingleLamp(removeTarget.id);
            onRefresh();
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

    return (
        <GestureHandlerRootView className="flex-1">
            <View style={styles.container} >
                <CollectionHeader
                    onSearch={handleSearch}
                    onOpenDrawer={handleOpenDrawer}
                    selectedArea={selectedArea}
                    searchText={searchText}
                    placeholder="搜索灯杆编号"
                />

                <CollectionList
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
            </View>

            <RemoveTipModal
                visible={removeModalVisible}
                onCancel={handleRemoveCancel}
                onConfirm={handleRemoveConfirm}
                title="删除确认"
                message={`确定要删除灯杆 ${removeTarget?.name} 吗？此操作不可撤销。`}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
});
