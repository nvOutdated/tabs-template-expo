import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { addLine, deleteLine, getLinesByEboxId, Line, updateLine } from "@/services/database";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CollectionLineManageModalProps = {
    visible: boolean;
    onClose: () => void;
    eboxId: number;
    onRefresh: () => void;
};

export default function CollectionLineManageModal({
    visible,
    onClose,
    eboxId,
    onRefresh,
}: CollectionLineManageModalProps) {
    const currentTheme = useCurrentTheme();
    const insets = useSafeAreaInsets();
    const { showSuccess, showWarning } = useCustomToast();
    const [lines, setLines] = useState<Line[]>([]);
    const [editingLine, setEditingLine] = useState<Line | null>(null);
    const [lineName, setLineName] = useState("");
    const [showAddEdit, setShowAddEdit] = useState(false);

    useEffect(() => {
        if (visible) {
            loadLines();
        }
    }, [visible, eboxId]);

    const loadLines = () => {
        try {
            const lineList = getLinesByEboxId(eboxId);
            setLines(lineList);
        } catch (error) {
            console.error('Failed to load lines:', error);
        }
    };

    const handleAdd = () => {
        setEditingLine(null);
        setLineName("");
        setShowAddEdit(true);
    };

    const handleEdit = (line: Line) => {
        setEditingLine(line);
        setLineName(line.name);
        setShowAddEdit(true);
    };

    const handleDelete = (line: Line) => {
        Alert.alert(
            "删除确认",
            `确定要删除线路"${line.name}"吗？删除线路将同时删除该线路下的所有单灯数据。`,
            [
                { text: "取消", style: "cancel" },
                {
                    text: "删除",
                    style: "destructive",
                    onPress: () => {
                        try {
                            deleteLine(line.id);
                            showSuccess({ message: "删除成功" });
                            loadLines();
                            onRefresh();
                        } catch (error: any) {
                            showWarning({ message: error.message || "删除失败" });
                        }
                    },
                },
            ]
        );
    };

    const handleSave = () => {
        if (!lineName.trim()) {
            Alert.alert("提示", "请输入线路名称");
            return;
        }

        try {
            if (editingLine) {
                updateLine(editingLine.id, lineName.trim());
                showSuccess({ message: "更新成功" });
            } else {
                addLine(lineName.trim(), eboxId);
                showSuccess({ message: "添加成功" });
            }
            setShowAddEdit(false);
            setLineName("");
            setEditingLine(null);
            loadLines();
            onRefresh();
        } catch (error: any) {
            showWarning({ message: error.message || "操作失败" });
        }
    };

    const renderLineItem = ({ item }: { item: Line }) => (
        <View style={styles.lineItem}>
            <View style={styles.lineInfo}>
                <Ionicons name="git-branch-outline" size={20} color={currentTheme.activeTint} />
                <Text style={[styles.lineName, { color: currentTheme.textColor }]}>
                    {item.name}
                </Text>
            </View>
            <View style={styles.lineActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={20} color="#409eff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#f56c6c" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalContent,
                        {
                            paddingTop: insets.top + 10,
                            paddingBottom: insets.bottom + 10,
                            backgroundColor: currentTheme.headerBg,
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={currentTheme.textColor} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: currentTheme.textColor }]}>
                            线路管理
                        </Text>
                        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                            <Ionicons name="add" size={24} color={currentTheme.activeTint} />
                        </TouchableOpacity>
                    </View>

                    {/* Line List */}
                    <FlatList
                        data={lines}
                        renderItem={renderLineItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="git-branch-outline" size={64} color="#999" />
                                <Text style={styles.emptyText}>暂无线路数据</Text>
                                <Text style={styles.emptyHint}>点击右上角 + 添加线路</Text>
                            </View>
                        }
                    />

                    {/* Add/Edit Modal */}
                    <Modal
                        visible={showAddEdit}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setShowAddEdit(false)}
                    >
                        <View style={styles.addEditOverlay}>
                            <View style={[styles.addEditContent, { backgroundColor: currentTheme.headerBg }]}>
                                <Text style={[styles.addEditTitle, { color: currentTheme.textColor }]}>
                                    {editingLine ? "编辑线路" : "新增线路"}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            color: currentTheme.textColor,
                                            borderColor: currentTheme.inactiveTint,
                                        },
                                    ]}
                                    placeholder="请输入线路名称"
                                    placeholderTextColor={currentTheme.inactiveTint}
                                    value={lineName}
                                    onChangeText={setLineName}
                                    autoFocus
                                />
                                <View style={styles.addEditActions}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => {
                                            setShowAddEdit(false);
                                            setLineName("");
                                            setEditingLine(null);
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>取消</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.confirmButton]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.confirmButtonText}>确定</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: "80%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    addButton: {
        padding: 4,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    lineItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        marginBottom: 12,
    },
    lineInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    lineName: {
        fontSize: 16,
        flex: 1,
    },
    lineActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 16,
    },
    emptyHint: {
        fontSize: 14,
        color: "#ccc",
        marginTop: 8,
    },
    addEditOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    addEditContent: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 12,
        padding: 20,
    },
    addEditTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    addEditActions: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
    },
    confirmButton: {
        backgroundColor: "#409eff",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#666",
    },
    confirmButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
    },
});
