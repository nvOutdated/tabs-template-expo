import { smart_personal_matchOptCode } from "@/api/street/configuration";
import { lightPole_devicectrl_sendSingleControlCmd } from "@/api/street/singleLampApi";
import { showMessageModal } from "@/components/ui/MessageGlobalModal";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface BatchControlModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (formData: BatchControlFormData) => void;
  eboxId?: number;
  lineId?: string;
  deviceInfo?: {
    sn: string;
    device_info: {
      id: number;
    };
  };
  controllerId?: string;
}

export interface BatchControlFormData {
  comm: "COMM_NORMAL" | "COMM_GROUP" | "COMM_BROADCAST";
  group: number;
  method: "MD_ON" | "MD_OFF" | "MD_DIM" | "MD_DETECT";
  dimming: string;
  enabledA: boolean;
  enabledB: boolean;
}

export default function BatchControlModal({
  visible,
  onClose,
  onConfirm,
  eboxId,
  lineId,
  deviceInfo,
  controllerId,
}: BatchControlModalProps) {
  const [formData, setFormData] = useState<BatchControlFormData>({
    comm: "COMM_NORMAL",
    group: 1,
    method: "MD_ON",
    dimming: '20',
    enabledA: true,
    enabledB: false,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!eboxId || !lineId) {
      showMessageModal({
        type: 'error',
        message: '请选择设备'
      });
      return;
    }

    if (formData.comm === "COMM_NORMAL" && !controllerId) {
      showMessageModal({
        type: 'error',
        message: '单控请选择控制器'
      });
      return;
    }
    /* 绕过密码验证 */
    const response = await lightPole_devicectrl_sendSingleControlCmd({
      ...formData,
      deviceId: deviceInfo?.device_info.id,
      id: controllerId?.toString(),
    });
    
    if (response.code === 200) {
      onConfirm(formData);
      showMessageModal({
        type: 'success',
        message: '设置成功'
      });
    } else {
      showMessageModal({
        type: 'error',
        message: response.message || '设置失败'
      });
    }
    /* 11 */
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    setIsLoading(true);
    try {
      // 验证密码
      const passwordResponse = await smart_personal_matchOptCode({
        isCreated: true,
        optCode: password
      });

      if (passwordResponse.code !== 200) {
        showMessageModal({
          type: 'error',
          message: '密码验证失败'
        });
        return;
      }
      // 发送控制命令
      const response = await lightPole_devicectrl_sendSingleControlCmd({
        ...formData,
        deviceId: deviceInfo?.device_info.id,
        id: controllerId?.toString(),
      });
      
      if (response.code === 200) {
        onConfirm(formData);
        showMessageModal({
          type: 'success',
          message: '设置成功'
        });
      } else {
        showMessageModal({
          type: 'error',
          message: response.message || '设置失败'
        });
      }
    } catch (error) {
      showMessageModal({
        type: 'error',
        message: '网络错误，请稍后重试'
      });
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>单灯控制操作</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* 操作模式选择 */}
            <View style={styles.formItem}>
              <Text style={styles.label}>选择操作模式</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.comm}
                  onValueChange={(value) =>
                    setFormData({ ...formData, comm: value })
                  }
                  style={styles.picker}
                  itemStyle={{
                    height: 40,
                    lineHeight: 40,
                    padding: 0,
                    margin: 0,
                  }}
                  mode="dropdown"
                >
                  <Picker.Item label="单控" value="COMM_NORMAL" />
                  <Picker.Item label="组控" value="COMM_GROUP" />
                  <Picker.Item label="广播" value="COMM_BROADCAST" />
                </Picker>
              </View>
            </View>

            {/* 组控模式选择 */}
            <View style={styles.formItem}>
              <Text style={styles.label}>选择组控模式</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.group}
                  onValueChange={(value) =>
                    setFormData({ ...formData, group: value })
                  }
                  style={styles.picker}
                  itemStyle={{
                    height: 40,
                    lineHeight: 40,
                    padding: 0,
                    margin: 0,
                  }}
                  mode="dropdown"
                >
                  {Array.from({ length: 16 }, (_, i) => (
                    <Picker.Item
                      key={i + 1}
                      label={`${i + 1}组`}
                      value={i + 1}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* 控制方式选择 */}
            <View style={styles.formItem}>
              <Text style={styles.label}>选择控制方式</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, method: value })
                  }
                  style={styles.picker}
                  itemStyle={{
                    height: 30,
                    lineHeight: 1,
                    padding: 0,
                    margin: 0,
                    includeFontPadding: false,
                    textAlignVertical:'center'
                  }}
                  mode="dropdown"
                >
                  <Picker.Item label="开灯" value="MD_ON" />
                  <Picker.Item label="关灯" value="MD_OFF" />
                  <Picker.Item label="调光" value="MD_DIM" />
                  <Picker.Item label="查询" value="MD_DETECT" />
                </Picker>
              </View>
            </View>

            {/* 调光值输入 */}
            <View style={styles.formItem}>
              <Text style={styles.label}>调光值 (0-20)</Text>
              <TextInput
                style={styles.input}
                value={formData.dimming}
                onChangeText={(value) => {
                  // 只允许输入数字
                  const numericValue = value.replace(/[^0-9]/g, '');
                  // 限制范围在0-20之间
                  const validValue = numericValue === '' ? '' : 
                    Math.min(Math.max(parseInt(numericValue) || 0, 0), 20).toString();
                  setFormData({ ...formData, dimming: validValue });
                }}
                keyboardType="numeric"
                placeholder="请输入调光值(0-20)"
                maxLength={2}
              />
            </View>

            {/* A灯B灯选项 */}
            <View style={styles.formItem}>
              <Text style={styles.label}>A灯B灯选项</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formData.enabledA && styles.checkboxSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, enabledA: !formData.enabledA })
                  }
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      formData.enabledA && styles.checkboxTextSelected,
                    ]}
                  >
                    A灯
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formData.enabledB && styles.checkboxSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, enabledB: !formData.enabledB })
                  }
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      formData.enabledB && styles.checkboxTextSelected,
                    ]}
                  >
                    B灯
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                设置
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

     {/*  <PasswordModal
        visible={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
        }}
        onConfirm={handlePasswordConfirm}
        loading={isLoading}
        title="请输入操作密码"
      /> */}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  formItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
    paddingVertical: 0,
    paddingHorizontal: 0,
    padding: 0,
    margin: 0,
    position: "relative",
    height: 40,
  },
  picker: {
    height: 50,
    padding: 0,
    margin: 0,
    width: "100%",
    paddingRight: 35,
    paddingLeft: 8,
    textAlignVertical:'bottom'
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    gap: 12,
  },
  checkbox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: "#e6f7ff",
    borderColor: "#91d5ff",
  },
  checkboxText: {
    fontSize: 14,
    color: "#666",
  },
  checkboxTextSelected: {
    color: "#1890ff",
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  confirmButton: {
    backgroundColor: "#1890ff",
  },
  buttonText: {
    fontSize: 16,
    color: "#666",
  },
  confirmButtonText: {
    color: "#fff",
  },
});
