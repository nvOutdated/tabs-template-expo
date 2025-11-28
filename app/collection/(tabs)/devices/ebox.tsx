import CollectionAreaDrawer, { Area, Device } from '@/components/collection/CollectionAreaDrawer';
import CollectionHeader from '@/components/collection/CollectionHeader';
import CollectionList, { CollectionItem } from '@/components/collection/CollectionList';
import RemoveTipModal from '@/components/public/publicModal/removeTipmodal';
import { showMessageModal } from '@/components/ui/MessageGlobalModal';
import { initDatabase } from '@/services/database';
import { useCollectionEntitiesStore } from '@/store/collectionEntitiesStore';
import { useCollectionUIStore } from '@/store/collectionUIStore';
import useLoadingStore from '@/store/loadingStore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function EboxScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [searchText, setSearchText] = useState('');
    const [selectedArea, setSelectedArea] = useState<Area>({
        area_id: 0,
        name: '',
        children: [],
    });
    const endReachedRef = useRef(false);
    const { setSelectedAreaId } = useCollectionUIStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<CollectionItem | null>(null);
    const eboxImage = require('@/assets/images/street/electricBox/centralController.png');
    const areaTree = useCollectionEntitiesStore(state => state.areaTree as Area[]);
    const refreshAreas = useCollectionEntitiesStore(state => state.refreshAreas);
    const flatAreas = useCollectionEntitiesStore(state => state.flatAreas as Area[]);
    const eboxes = useCollectionEntitiesStore(state => state.eboxes);
    const refreshEboxes = useCollectionEntitiesStore(state => state.refreshEboxes);
    const deleteEboxCascade = useCollectionEntitiesStore(state => state.deleteEboxCascade);
    // Sync selected area ID to store for _layout.tsx to use
    useEffect(() => {
        setSelectedAreaId(selectedArea.area_id);
    }, [selectedArea.area_id, setSelectedAreaId]);

    const areaNameMap = useMemo(() => {
        const map = new Map<number, string>();
        flatAreas.forEach(area => {
            map.set(area.area_id, area.name);
        });
        return map;
    }, [flatAreas]);

    const filteredEboxes = useMemo(() => {
        let dataset = [...eboxes];
        if (selectedArea.area_id) {
            dataset = dataset.filter(item => item.area_id === selectedArea.area_id);
        }
        if (searchText) {
            const keyword = searchText.toLowerCase();
            dataset = dataset.filter(item =>
                item.name?.toLowerCase().includes(keyword) ||
                item.sn?.toLowerCase().includes(keyword)
            );
        }
        return dataset.map(item => ({
            ...item,
            area_name: areaNameMap.get(item.area_id) || '未知区域',
        })) as CollectionItem[];
    }, [eboxes, selectedArea.area_id, searchText, areaNameMap]);

    useEffect(() => {
        setItems(filteredEboxes.slice(0, pageSize * currentPage));
        setHasMore(filteredEboxes.length > pageSize * currentPage);
    }, [filteredEboxes, currentPage, pageSize]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refreshAreas();
        refreshEboxes();
        setSelectedArea({
            area_id: 0,
            name: '',
            children: [],
        });
        setSearchText('');
        setCurrentPage(1);
        setHasMore(true);
        endReachedRef.current = false;
        setRefreshing(false);
    }, [refreshAreas, refreshEboxes]);

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            refreshAreas();
            refreshEboxes();
            setCurrentPage(1);
        }, [refreshAreas, refreshEboxes])
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, selectedArea.area_id, eboxes.length]);

    const onEndReached = useCallback(() => {
        if (!refreshing && hasMore && !loading && !endReachedRef.current) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMore, refreshing, loading]);

    const handleSearch = useCallback((text: string) => {
        setSearchText(text);
        if (text) {
            setSelectedArea({
                area_id: 0,
                name: '',
                children: [],
            });
        }
    }, []);

    const handleOpenDrawer = useCallback(() => {
        setShowDrawer(true);
    }, []);

    const handleSelectArea = useCallback((area: Area) => {
        setSelectedArea(area);
        setSearchText('');
        setShowDrawer(false);
    }, []);

    const handleSelectDevice = useCallback((device: Device) => {
        setSearchText(device.name);
        setSelectedArea({
            area_id: 0,
            name: '',
            children: [],
        });
        setShowDrawer(false);
    }, []);

    const handleEditItem = useCallback((item: CollectionItem) => {
        router.push({ pathname: '/collection/(modal)/addDevice', params: { id: item.id } });
    }, [router]);

    const handleDeleteItem = useCallback((item: CollectionItem) => {
        setRemoveTarget(item);
        setRemoveModalVisible(true);
    }, []);

    const handleRemoveConfirm = async () => {
        if (!removeTarget) return;
        try {
            showLoading();
            deleteEboxCascade(removeTarget.id);
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
                />

                <CollectionList
                    items={items}
                    loading={loading}
                    hasMore={hasMore}
                    onEndReached={onEndReached}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    ImageSource={eboxImage}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>

            <CollectionAreaDrawer
                visible={showDrawer}
                onClose={() => setShowDrawer(false)}
                areas={areaTree}
                selectedArea={selectedArea}
                onSelectArea={handleSelectArea}
                onSelectDevice={handleSelectDevice}
                devices={items as unknown as Device[]}
            />

            <RemoveTipModal
                visible={removeModalVisible}
                onCancel={handleRemoveCancel}
                onConfirm={handleRemoveConfirm}
                title="删除确认"
                message={`确定要删除${removeTarget?.name}(${removeTarget?.sn})吗？此操作不可撤销。`}
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
