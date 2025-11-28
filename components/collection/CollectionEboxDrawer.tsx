import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { getAreaList, getEboxList } from "@/services/database";
import { listToTree } from "@/utils/treeUtils";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.8;

export type Area = {
    area_id: number;
    name: string;
    children?: Area[];
};

export type Ebox = {
    id: number;
    sn: string;
    name: string;
    area_id: number;
};

type CollectionEboxDrawerProps = {
    visible: boolean;
    onClose: () => void;
    selectedEbox: Ebox | null;
    onSelectEbox: (ebox: Ebox) => void;
};

type ListItem = {
    type: 'area' | 'ebox';
    data: Area | Ebox;
    level: number;
    isExpanded?: boolean;
    hasChildren?: boolean;
};

// Ebox Item Component
const EboxItem = ({
    ebox,
    level,
    isSelected,
    onSelect,
}: {
    ebox: Ebox;
    level: number;
    isSelected: boolean;
    onSelect: (ebox: Ebox) => void;
}) => {
    const currentTheme = useCurrentTheme();

    return (
        <TouchableOpacity
            style={[
                styles.eboxItem,
                { paddingLeft: 10 + (level + 1) * 20 },
                isSelected && { backgroundColor: "rgba(64,158,255,0.1)" },
            ]}
            onPress={() => onSelect(ebox)}
        >
            <View style={styles.eboxContent}>
                <Ionicons name="cube-outline" size={16} color="#666" />
                <Text
                    style={[
                        styles.eboxName,
                        { color: "#666666" },
                        isSelected && { color: "#409eff", fontWeight: "600" },
                    ]}
                >
                    {ebox.name} ({ebox.sn})
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// Area Item Component
const AreaItem = ({
    area,
    level,
    isExpanded,
    hasChildren,
    onToggle,
    themeColor
}: {
    area: Area;
    level: number;
    isExpanded: boolean;
    hasChildren: boolean;
    onToggle: (id: number) => void;
    themeColor: string;
}) => (
    <View
        style={[
            styles.areaItem,
            { paddingLeft: 10 + level * 20 },
        ]}
    >
        <View style={styles.areaContent}>
            <Text
                style={[
                    styles.areaName,
                    { color: themeColor },
                ]}
            >
                {area.name}
            </Text>
            {hasChildren && (
                <TouchableOpacity
                    onPress={() => onToggle(area.area_id)}
                >
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={themeColor}
                    />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

export default function CollectionEboxDrawer({
    visible,
    onClose,
    selectedEbox,
    onSelectEbox,
}: CollectionEboxDrawerProps) {
    const currentTheme = useCurrentTheme();
    const insets = useSafeAreaInsets();
    const [areas, setAreas] = useState<Area[]>([]);
    const [eboxes, setEboxes] = useState<Ebox[]>([]);
    const [expandedAreas, setExpandedAreas] = useState<Set<number>>(new Set());
    const [searchText, setSearchText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const translateX = useSharedValue(-DRAWER_WIDTH);
    const opacity = useSharedValue(0);

    // Load areas and eboxes
    useEffect(() => {
        try {
            const areaList = getAreaList();
            const tree = listToTree(areaList, 'pid', 'area_id');
            setAreas(tree);

            const eboxList = getEboxList({ page_size: 1000, current: 1 });
            setEboxes(eboxList.map((item: any) => ({
                id: item.id,
                sn: item.sn,
                name: item.name,
                area_id: item.area_id
            })));
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }, []);

    // Expand all areas initially
    useEffect(() => {
        const expandAllAreas = (areas: Area[]) => {
            const allAreaIds = new Set<number>();
            const traverse = (areas: Area[]) => {
                areas.forEach(area => {
                    allAreaIds.add(area.area_id);
                    if (area.children) {
                        traverse(area.children);
                    }
                });
            };
            traverse(areas);
            return allAreaIds;
        };

        if (areas.length > 0 && expandedAreas.size === 0) {
            setExpandedAreas(expandAllAreas(areas));
        }
    }, [areas]);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, {
                duration: 150,
                easing: Easing.out(Easing.ease),
            });
            translateX.value = withTiming(0, {
                duration: 250,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
        } else {
            opacity.value = withTiming(0, {
                duration: 150,
                easing: Easing.in(Easing.ease),
            });
            translateX.value = withTiming(-DRAWER_WIDTH, {
                duration: 250,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
        }
    }, [visible]);

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        backgroundColor: `rgba(0, 0, 0, ${opacity.value * 0.5})`,
    }));

    const toggleArea = useCallback((areaId: number) => {
        setExpandedAreas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(areaId)) {
                newSet.delete(areaId);
            } else {
                newSet.add(areaId);
            }
            return newSet;
        });
    }, []);

    const listData = useMemo(() => {
        const flattenData = (area: Area, level: number = 0): ListItem[] => {
            const items: ListItem[] = [];
            const isExpanded = expandedAreas.has(area.area_id);
            const areaEboxes = eboxes.filter(ebox => ebox.area_id === area.area_id);
            const hasChildren = (area.children && area.children.length > 0) || areaEboxes.length > 0;

            items.push({
                type: 'area',
                data: area,
                level,
                isExpanded,
                hasChildren,
            });

            if (isExpanded) {
                const filteredEboxes = searchText
                    ? areaEboxes.filter(ebox =>
                        ebox.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        ebox.sn.toLowerCase().includes(searchText.toLowerCase())
                    )
                    : areaEboxes;

                filteredEboxes.forEach(ebox => {
                    items.push({
                        type: 'ebox',
                        data: ebox,
                        level,
                    });
                });

                if (area.children) {
                    area.children.forEach(child => {
                        items.push(...flattenData(child, level + 1));
                    });
                }
            }

            return items;
        };

        return areas.flatMap(area => flattenData(area));
    }, [areas, expandedAreas, eboxes, searchText]);

    const renderItem = useCallback(({ item }: { item: any }) => {
        if (item.type === 'area') {
            return (
                <AreaItem
                    area={item.data}
                    level={item.level}
                    isExpanded={item.isExpanded}
                    hasChildren={item.hasChildren}
                    onToggle={toggleArea}
                    themeColor={currentTheme.activeTint}
                />
            );
        } else {
            return (
                <EboxItem
                    ebox={item.data}
                    level={item.level}
                    isSelected={selectedEbox?.id === item.data.id}
                    onSelect={onSelectEbox}
                />
            );
        }
    }, [selectedEbox?.id, currentTheme.activeTint, toggleArea, onSelectEbox]);

    const keyExtractor = useCallback((item: any) => {
        if (item.type === 'area') {
            return `area-${item.data.area_id}`;
        } else {
            return `ebox-${item.data.id}`;
        }
    }, []);

    return (
        <View style={[styles.overlay, { display: visible ? 'flex' : 'none' }]}>
            <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.drawer,
                    {
                        height: height - insets.top - insets.bottom,
                        width: DRAWER_WIDTH,
                    },
                    drawerStyle,
                ]}
                className="bg-secondary-300"
            >
                <View style={styles.header}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={currentTheme.activeTint} />
                        <TextInput
                            style={[styles.searchInput, { color: currentTheme.activeTint }]}
                            placeholder="搜索集中器名称或编号"
                            placeholderTextColor={currentTheme.inactiveTint}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText ? (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color={currentTheme.activeTint}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={currentTheme.activeTint} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    ref={flatListRef}
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    removeClippedSubviews={true}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    drawer: {
        position: "absolute",
        left: 0,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 1,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 8,
        paddingHorizontal: 8,
        marginRight: 8,
        height: 36,
    },
    searchInput: {
        flex: 1,
        height: "100%",
        fontSize: 14,
        marginLeft: 8,
        padding: 0,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    areaItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingRight: 12,
    },
    areaContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    eboxItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingRight: 12,
    },
    eboxContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    areaName: {
        fontSize: 14,
        flex: 1,
    },
    eboxName: {
        fontSize: 14,
        flex: 1,
    },
});
