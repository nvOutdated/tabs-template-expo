import { useAreaStore } from '@/store/areaStore';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import EboxForm, { EboxFormData } from '../../addDevice/EboxForm';

interface PublicEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: EboxFormData) => void;
  initialData: EboxFormData;
  versionList: { label: string; value: string; }[];
}

const PublicEditModal: React.FC<PublicEditModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  versionList,
}) => {
  const [formData, setFormData] = React.useState<EboxFormData>(initialData);
  // console.log(initialData,"修改数据");
  const { allAreaList } = useAreaStore();
  const [allAreaListprops, setAllAreaListprops] = useState<any>([])
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);
  useEffect(() => {
    const setAllAreaListpropsData = allAreaList.map((item: any) => {
      return {
        key: item.area_id,
        value: item.area_id,
        label: item.name,
      }
    })
    setAllAreaListprops(setAllAreaListpropsData)
  }, [allAreaList])
  const handleFormDataChange = (data: EboxFormData) => {
    setFormData(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-background-50 rounded-t-3xl">
          <View className="flex-row items-center justify-between p-4 border-b border-outline-100">
            <Text className="text-lg font-medium text-primary-500">编辑设备信息</Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <EboxForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            versionList={versionList}
            allAreaList={allAreaListprops}
          />

          <View className="flex-row justify-end gap-4 p-4 border-t border-outline-100">
            <Pressable
              onPress={onClose}
              className="px-6 py-1 rounded-lg border border-outline-100"
            >
              <Text className="text-base text-primary-500">取消</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(formData)}
              className="px-6 py-1 rounded-lg bg-primary-500"
            >
              <Text className="text-base text-white">保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PublicEditModal;
