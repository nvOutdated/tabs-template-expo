import { add_line, remove_line, update_line } from '@/api/street/singleLampApi';
import { useCustomToast } from '@/components/public/UIComponents/ToastComponent';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Line {
  id: number;
  name: string;
  line_index?: number;
}

interface LineManageModalProps {
  visible: boolean;
  onClose: () => void;
  lines: Line[];
  eboxId: number;
  onRefresh: () => void;
}

const LineManageModal: React.FC<LineManageModalProps> = ({
  visible,
  onClose,
  lines,
  eboxId,
  onRefresh,
}) => {
  const { showSuccess, showWarning } = useCustomToast();
  const [innerVisible, setInnerVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [formLine, setFormLine] = useState({ name: '', line_index: 1 });
  const [editFormLine, setEditFormLine] = useState<Line | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormLine({ name: '', line_index: 1 });
    setEditFormLine(null);
  }, []);

  // 打开添加弹窗
  const handleAddClick = useCallback(() => {
    resetForm();
    setInnerVisible(true);
  }, [resetForm]);

  // 打开修改弹窗
  const handleUpdateClick = useCallback((line: Line) => {
    setEditFormLine(line);
    setEditVisible(true);
  }, []);

  // 添加线路
  const handleAddLine = useCallback(async () => {
    if (!formLine.name.trim()) {
      showWarning({ message: '请输入线路名称' });
      return;
    }
    if (formLine.line_index < 1 || formLine.line_index > 20) {
      showWarning({ message: '线路编号必须在1-20之间' });
      return;
    }

    try {
      setLoading(true);
      const res = await add_line({
        ebox_id: eboxId,
        name: formLine.name.trim(),
        line_index: formLine.line_index,
      });
      if (res.code === 200) {
        showSuccess({ message: '添加成功' });
        setInnerVisible(false);
        resetForm();
        onRefresh();
      } else {
        showWarning({ message: res.message || '添加失败' });
      }
    } catch (error: any) {
      showWarning({ message: error.message || '添加失败' });
    } finally {
      setLoading(false);
    }
  }, [formLine, eboxId, onRefresh, showSuccess, showWarning, resetForm]);

  // 修改线路
  const handleUpdateLine = useCallback(async () => {
    if (!editFormLine) return;
    if (!editFormLine.name?.trim()) {
      showWarning({ message: '请输入线路名称' });
      return;
    }
    const lineIndex = editFormLine.line_index || 1;
    if (lineIndex < 1 || lineIndex > 20) {
      showWarning({ message: '线路编号必须在1-20之间' });
      return;
    }

    try {
      setLoading(true);
      const res = await update_line({
        id: editFormLine.id,
        name: editFormLine.name.trim(),
        line_index: lineIndex,
      });
      if (res.code === 200) {
        showSuccess({ message: '修改成功' });
        setEditVisible(false);
        resetForm();
        onRefresh();
      } else {
        showWarning({ message: res.message || '修改失败' });
      }
    } catch (error: any) {
      showWarning({ message: error.message || '修改失败' });
    } finally {
      setLoading(false);
    }
  }, [editFormLine, onRefresh, showSuccess, showWarning, resetForm]);

  // 删除线路
  const handleRemoveLine = useCallback(async (id: number) => {
    try {
      setDeleteLoading(id);
      const res = await remove_line({ id });
      if (res.code === 200) {
        showSuccess({ message: '删除成功' });
        onRefresh();
      } else {
        showWarning({ message: res.message || '删除失败' });
      }
    } catch (error: any) {
      showWarning({ message: error.message || '删除失败' });
    } finally {
      setDeleteLoading(null);
    }
  }, [onRefresh, showSuccess, showWarning]);

  // 关闭主弹窗时重置所有状态
  useEffect(() => {
    if (!visible) {
      setInnerVisible(false);
      setEditVisible(false);
      resetForm();
    }
  }, [visible, resetForm]);

  if (!visible) return null;

  return (
    <>
      {/* 主弹窗 */}
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[90%] max-w-md bg-white rounded-lg">
            {/* 标题栏 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">线路管理</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 添加按钮 */}
            <View className="p-4 border-b border-gray-200">
              <TouchableOpacity
                onPress={handleAddClick}
                className="self-start px-4 py-2 bg-blue-500 rounded-md"
              >
                <Text className="text-sm text-white">添加</Text>
              </TouchableOpacity>
            </View>

            {/* 线路列表 */}
            <ScrollView className="max-h-96">
              {lines.length === 0 ? (
                <View className="p-8 items-center">
                  <Text className="text-gray-500">暂无线路数据</Text>
                </View>
              ) : (
                <View className="p-2">
                  {lines.map((line) => (
                    <View
                      key={line.id}
                      className="flex-row items-center justify-between p-3 border-b border-gray-100"
                    >
                      <View className="flex-1">
                        <Text className="text-sm text-gray-700 font-medium">
                          编号: {line.line_index ?? line.id}
                        </Text>
                        <Text className="text-sm text-gray-900 mt-1">名称: {line.name}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => handleUpdateClick(line)}
                          className="px-3 py-1"
                          disabled={deleteLoading === line.id}
                        >
                          <Text className="text-sm text-blue-500">修改</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveLine(line.id)}
                          className="px-3 py-1"
                          disabled={deleteLoading === line.id}
                        >
                          {deleteLoading === line.id ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Text className="text-sm text-red-500">删除</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 添加线路弹窗 */}
      <Modal
        visible={innerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInnerVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[80%] max-w-sm bg-white rounded-lg">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">添加</Text>
              <TouchableOpacity onPress={() => setInnerVisible(false)} className="p-1">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">名称</Text>
                <TextInput
                  className="w-full h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="请输入线路名称"
                  value={formLine.name}
                  onChangeText={(text) => setFormLine({ ...formLine, name: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">编号</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => {
                      if (formLine.line_index > 1) {
                        setFormLine({ ...formLine, line_index: formLine.line_index - 1 });
                      }
                    }}
                    className="w-10 h-10 border border-gray-300 rounded-l-md items-center justify-center"
                  >
                    <Text className="text-lg py-1 text-gray-700">-</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 h-10 border-t py-1 border-b border-gray-300 text-center text-sm"
                    value={formLine.line_index.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      if (num >= 1 && num <= 20) {
                        setFormLine({ ...formLine, line_index: num });
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (formLine.line_index < 20) {
                        setFormLine({ ...formLine, line_index: formLine.line_index + 1 });
                      }
                    }}
                    className="w-10 h-10 border border-gray-300 rounded-r-md items-center justify-center"
                  >
                    <Text className="text-lg text-gray-700">+</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 mt-1">范围: 1-20</Text>
              </View>
            </View>

            <View className="flex-row justify-end gap-2 p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setInnerVisible(false)}
                className="px-4 py-2 rounded-md border border-gray-300"
                disabled={loading}
              >
                <Text className="text-sm text-gray-700">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddLine}
                className="px-4 py-2 rounded-md bg-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm text-white">确定</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 修改线路弹窗 */}
      <Modal
        visible={editVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[80%] max-w-sm bg-white rounded-lg">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">修改</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} className="p-1">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">名称</Text>
                <TextInput
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="请输入线路名称"
                  value={editFormLine?.name || ''}
                  onChangeText={(text) =>
                    setEditFormLine(editFormLine ? { ...editFormLine, name: text } : null)
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">编号</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => {
                      if (editFormLine && (editFormLine.line_index || 1) > 1) {
                        setEditFormLine({
                          ...editFormLine,
                          line_index: (editFormLine.line_index || 1) - 1,
                        });
                      }
                    }}
                    className="w-10 h-10 py-1 border border-gray-300 rounded-l-md items-center justify-center"
                  >
                    <Text className="text-lg text-gray-700">-</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 h-10 py-1 border-t border-b border-gray-300 text-center text-sm"
                    value={(editFormLine?.line_index || editFormLine?.id || 1).toString()}
                    onChangeText={(text) => {
                      if (editFormLine) {
                        const num = parseInt(text) || 1;
                        if (num >= 1 && num <= 20) {
                          setEditFormLine({ ...editFormLine, line_index: num });
                        }
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (editFormLine && (editFormLine.line_index || 1) < 20) {
                        setEditFormLine({
                          ...editFormLine,
                          line_index: (editFormLine.line_index || 1) + 1,
                        });
                      }
                    }}
                    className="w-10 h-10 border border-gray-300 rounded-r-md items-center justify-center"
                  >
                    <Text className="text-lg text-gray-700">+</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 mt-1">范围: 1-20</Text>
              </View>
            </View>

            <View className="flex-row justify-end gap-2 p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                className="px-4 py-2 rounded-md border border-gray-300"
                disabled={loading}
              >
                <Text className="text-sm text-gray-700">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateLine}
                className="px-4 py-2 rounded-md bg-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm text-white">确定</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default LineManageModal;

