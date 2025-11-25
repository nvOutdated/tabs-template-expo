import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { CityNode, newCity } from '@/utils/areaUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface AreaFormData {
    name: string;
    adcode: string;
    area_type: 'area' | 'road';
    pid?: number | null;
    remark?: string;
}

interface AreaFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: AreaFormData) => void;
    initialData?: AreaFormData & { area_id?: number };
    parentArea?: { area_id: number; name: string; adcode: string } | null;
    mode: 'add' | 'edit' | 'addChild';
}

export default function AreaForm({
    visible,
    onClose,
    onSubmit,
    initialData,
    parentArea,
    mode,
}: AreaFormProps) {
    const currentTheme = useCurrentTheme();
    const [formData, setFormData] = useState<AreaFormData>({
        name: '',
        adcode: '',
        area_type: 'area',
        pid: null,
        remark: '',
    });
    const [showCityPicker, setShowCityPicker] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState<CityNode | null>(null);
    const [selectedCity, setSelectedCity] = useState<CityNode | null>(null);

    // 根据父级区域的adcode获取可选的子区域
    const getAvailableChildren = (): CityNode[] => {
        if (!parentArea || !parentArea.adcode) return [];

        // 在newCity中查找父级区域
        const findNodeByCode = (nodes: CityNode[], code: string): CityNode | null => {
            for (const node of nodes) {
                if (node.code === code) return node;
                if (node.children) {
                    const found = findNodeByCode(node.children, code);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentNode = findNodeByCode(newCity, parentArea.adcode);
        return parentNode?.children || [];
    };

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && initialData) {
                setFormData(initialData);
            } else if (mode === 'addChild' && parentArea) {
                setFormData({
                    name: '',
                    adcode: '',
                    area_type: 'area', // 默认为行政区域
                    pid: parentArea.area_id,
                    remark: '',
                });
            } else {
                setFormData({
                    name: '',
                    adcode: '',
                    area_type: 'area',
                    pid: null,
                    remark: '',
                });
            }
            setSelectedProvince(null);
            setSelectedCity(null);
        }
    }, [visible, mode, initialData, parentArea]);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            Alert.alert('提示', '请输入区域名称');
            return;
        }

        if (formData.area_type === 'area' && !formData.adcode.trim()) {
            Alert.alert('提示', '请选择行政区域');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    const renderCityPicker = () => {
        // 如果是添加子区域且类型为行政区域，只显示父级的子区域
        if (mode === 'addChild' && formData.area_type === 'area' && parentArea) {
            const availableChildren = getAvailableChildren();

            if (availableChildren.length === 0) {
                return (
                    <View style={styles.pickerList}>
                        <Text style={[styles.emptyText, { color: currentTheme.inactiveTint }]}>
                            该区域没有下级行政区域，请选择"道路"类型
                        </Text>
                    </View>
                );
            }

            // 判断子区域的层级
            const hasGrandChildren = availableChildren.some(child => child.children && child.children.length > 0);

            if (!selectedProvince && hasGrandChildren) {
                // 显示第一级子区域（如市级）
                return (
                    <ScrollView style={styles.pickerList}>
                        {availableChildren.map((child) => (
                            <View
                                key={child.code}
                                style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                            >
                                <TouchableOpacity
                                    style={styles.radioContainer}
                                    onPress={() => {
                                        setFormData({
                                            ...formData,
                                            adcode: child.code,
                                            name: child.name,
                                        });
                                        setShowCityPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.adcode === child.code && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                        {child.name}
                                    </Text>
                                </TouchableOpacity>
                                {child.children && child.children.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.chevronButton}
                                        onPress={() => setSelectedProvince(child)}
                                    >
                                        <Ionicons name="chevron-forward" size={20} color={currentTheme.inactiveTint} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                );
            } else if (selectedProvince && selectedProvince.children) {
                // 显示第二级子区域（如区县级）
                return (
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={[styles.backButton, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                            onPress={() => setSelectedProvince(null)}
                        >
                            <Ionicons name="chevron-back" size={20} color={currentTheme.activeTint} />
                            <Text style={[styles.backButtonText, { color: currentTheme.activeTint }]}>
                                返回上级
                            </Text>
                        </TouchableOpacity>
                        <ScrollView style={styles.pickerList}>
                            {selectedProvince.children.map((district) => (
                                <View
                                    key={district.code}
                                    style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                                >
                                    <TouchableOpacity
                                        style={styles.radioContainer}
                                        onPress={() => {
                                            setFormData({
                                                ...formData,
                                                adcode: district.code,
                                                name: district.name,
                                            });
                                            setShowCityPicker(false);
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.radio,
                                                { borderColor: currentTheme.activeTint },
                                                formData.adcode === district.code && {
                                                    backgroundColor: currentTheme.activeTint,
                                                },
                                            ]}
                                        />
                                        <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                            {district.name}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                );
            } else {
                // 直接显示所有子区域（无下级）
                return (
                    <ScrollView style={styles.pickerList}>
                        {availableChildren.map((child) => (
                            <View
                                key={child.code}
                                style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                            >
                                <TouchableOpacity
                                    style={styles.radioContainer}
                                    onPress={() => {
                                        setFormData({
                                            ...formData,
                                            adcode: child.code,
                                            name: child.name,
                                        });
                                        setShowCityPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.adcode === child.code && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                        {child.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                );
            }
        }

        // 原有的完整三级选择逻辑（用于mode='add'）
        if (!selectedProvince) {
            // Show provinces
            return (
                <ScrollView style={styles.pickerList}>
                    {newCity.map((province: any) => (
                        <View
                            key={province.code}
                            style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                        >
                            <TouchableOpacity
                                style={styles.radioContainer}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        adcode: province.code,
                                        name: province.name,
                                    });
                                    setShowCityPicker(false);
                                }}
                            >
                                <View
                                    style={[
                                        styles.radio,
                                        { borderColor: currentTheme.activeTint },
                                        formData.adcode === province.code && {
                                            backgroundColor: currentTheme.activeTint,
                                        },
                                    ]}
                                />
                                <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                    {province.name}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.chevronButton}
                                onPress={() => setSelectedProvince(province)}
                            >
                                <Ionicons name="chevron-forward" size={20} color={currentTheme.inactiveTint} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            );
        } else if (!selectedCity && selectedProvince.children) {
            // Show cities
            return (
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={[styles.backButton, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                        onPress={() => {
                            setSelectedProvince(null);
                            setFormData({ ...formData, name: '', adcode: '' });
                        }}
                    >
                        <Ionicons name="chevron-back" size={20} color={currentTheme.activeTint} />
                        <Text style={[styles.backButtonText, { color: currentTheme.activeTint }]}>
                            返回省份
                        </Text>
                    </TouchableOpacity>
                    <ScrollView style={styles.pickerList}>
                        {selectedProvince.children.map((city) => (
                            <View
                                key={city.code}
                                style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                            >
                                <TouchableOpacity
                                    style={styles.radioContainer}
                                    onPress={() => {
                                        setFormData({
                                            ...formData,
                                            adcode: city.code,
                                            name: city.name,
                                        });
                                        setShowCityPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.adcode === city.code && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                        {city.name}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.chevronButton}
                                    onPress={() => setSelectedCity(city)}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={currentTheme.inactiveTint} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            );
        } else if (selectedCity && selectedCity.children) {
            // Show districts
            return (
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={[styles.backButton, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                        onPress={() => {
                            setSelectedCity(null);
                            if (selectedProvince) {
                                setFormData({
                                    ...formData,
                                    name: selectedProvince.name,
                                    adcode: selectedProvince.code,
                                });
                            }
                        }}
                    >
                        <Ionicons name="chevron-back" size={20} color={currentTheme.activeTint} />
                        <Text style={[styles.backButtonText, { color: currentTheme.activeTint }]}>
                            返回城市
                        </Text>
                    </TouchableOpacity>
                    <ScrollView style={styles.pickerList}>
                        {selectedCity.children.map((district) => (
                            <View
                                key={district.code}
                                style={[styles.pickerItem, { borderBottomColor: currentTheme.inactiveTint + '40' }]}
                            >
                                <TouchableOpacity
                                    style={styles.radioContainer}
                                    onPress={() => {
                                        setFormData({
                                            ...formData,
                                            adcode: district.code,
                                            name: district.name,
                                        });
                                        setShowCityPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.adcode === district.code && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.pickerItemText, { color: currentTheme.textColor }]}>
                                        {district.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            );
        }
        console.log("return null");

        return null;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: currentTheme.headerBg }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: currentTheme.inactiveTint + '40' }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>
                            {mode === 'edit' ? '修改区域' : mode === 'addChild' ? '新增子区域' : '新增区域'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={currentTheme.textColor} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        {parentArea && (
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: currentTheme.textColor }]}>父级区域</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: currentTheme.activeBg, color: currentTheme.textColor, textAlignVertical: 'center' },

                                    ]}
                                    value={parentArea.name}
                                    editable={false}
                                />
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: currentTheme.textColor }]}>区域类型</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setFormData({ ...formData, area_type: 'area' })}
                                    disabled={mode === 'edit'}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.area_type === 'area' && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: currentTheme.textColor }]}>
                                        行政区域
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setFormData({ ...formData, area_type: 'road' })}
                                    disabled={mode === 'edit'}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: currentTheme.activeTint },
                                            formData.area_type === 'road' && {
                                                backgroundColor: currentTheme.activeTint,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: currentTheme.textColor }]}>
                                        道路
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: currentTheme.textColor }]}>名称 *</Text>
                            {formData.area_type === 'area' ? (
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        styles.pickerButton,
                                        { backgroundColor: currentTheme.activeBg },
                                    ]}
                                    onPress={() => setShowCityPicker(true)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerButtonText,
                                            { color: formData.name ? currentTheme.textColor : currentTheme.inactiveTint },
                                        ]}
                                    >
                                        {formData.name || '请选择行政区域'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={currentTheme.inactiveTint} />
                                </TouchableOpacity>
                            ) : (
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: currentTheme.activeBg, color: currentTheme.textColor, textAlignVertical: 'center', includeFontPadding: false, },
                                    ]}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="请输入道路名称"

                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: currentTheme.textColor }]}>备注</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    { backgroundColor: currentTheme.activeBg, color: currentTheme.textColor, textAlignVertical: 'center' },
                                ]}
                                value={formData.remark}
                                onChangeText={(text) => setFormData({ ...formData, remark: text })}
                                placeholder="请输入备注信息"
                                placeholderTextColor={currentTheme.inactiveTint}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>

                    <View style={[styles.modalFooter, { borderTopColor: currentTheme.inactiveTint + '40' }]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: currentTheme.inactiveTint + '40' }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, { backgroundColor: currentTheme.activeTint }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* City Picker Modal */}
            <Modal visible={showCityPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.headerBg }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: currentTheme.inactiveTint + '40' }]}>
                            <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>
                                选择行政区域
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                                    <Text style={{ color: currentTheme.activeTint, fontSize: 16, fontWeight: '600' }}>
                                        确定
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {renderCityPicker()}
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '70%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    formContainer: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        lineHeight: 24,
        textAlignVertical: 'center',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonText: {
        fontSize: 14,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
    },
    radioLabel: {
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    submitButton: {},
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    pickerList: {
        flex: 1,
        width: '100%',
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    pickerItemText: {
        fontSize: 14,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 8,
        borderBottomWidth: 1,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 32,
    },
    radioContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chevronButton: {
        padding: 8,
    },
});