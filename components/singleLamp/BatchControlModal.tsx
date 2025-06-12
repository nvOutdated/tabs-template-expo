import {
  changeSwitchAuto,
  detect_dev_param,
  detect_lamp_time,
  deviceCtrl_sendTimingCmd,
  singleLamp_reset,
  smart_personal_matchOptCode
} from "@/api/street/configuration";
import { lightPole_devicectrl_sendSingleControlCmd } from "@/api/street/singleLampApi";
import { showMessageModal } from "@/components/ui/MessageGlobalModal";
import useLoadingStore from '@/store/loadingStore';
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  dimming: number;
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
  const [activeTab, setActiveTab] = useState<'single' | 'concentrator'>('single');
  const [concentratorParams, setConcentratorParams] = useState(1);
  const [formData, setFormData] = useState<BatchControlFormData>({
    comm: "COMM_NORMAL",
    group: 1,
    method: "MD_ON",
    dimming: 20,
    enabledA: true,
    enabledB: false,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoadingStore();
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
     try{
        /* 绕过密码验证 */
        showLoading();
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
     }catch(e){
       console.log(e);
     }finally{
      hideLoading();
     }
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

  const handleConcentratorConfirm = async () => {
    if (!deviceInfo?.device_info.id) {
      showMessageModal({
        type: 'error',
        message: '请选择设备'
      });
      return;
    }

    try {
      showLoading();
      let response;
      switch (concentratorParams) {
        case 1:
          response = await detect_dev_param({ deviceId: deviceInfo.device_info.id });
          break;
        case 2:
          response = await singleLamp_reset({ deviceId: deviceInfo.device_info.id });
          break;
        case 3:
          response = await changeSwitchAuto({ deviceId: deviceInfo.device_info.id });
          break;
        case 4:
          response = await detect_lamp_time({ deviceId: deviceInfo.device_info.id });
          break;
        case 5:
          response = await deviceCtrl_sendTimingCmd({ deviceIds: [deviceInfo.device_info.id] });
          break;
        default:
          return;
      }

      if (response.code === 200) {
        showMessageModal({
          type: 'success',
          message: '设置成功'
        });
        onConfirm(formData);
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
      hideLoading();
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
            <Text style={styles.title}>参数设置和检测</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tab 切换 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'single' && styles.activeTab]}
              onPress={() => setActiveTab('single')}
            >
              <Text style={[styles.tabText, activeTab === 'single' && styles.activeTabText]}>
                单灯控制
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'concentrator' && styles.activeTab]}
              onPress={() => setActiveTab('concentrator')}
            >
              <Text style={[styles.tabText, activeTab === 'concentrator' && styles.activeTabText]}>
                集中器控制
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'single' ? (
            <View style={styles.formContainer}>
              {/* 操作模式选择 */}
              <View style={styles.formItem}>
                <View style={styles.formItemRow}>
                  <Text style={styles.label}>操作模式</Text>
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
              </View>

              {/* 组控模式选择 */}
              <View style={styles.formItem}>
                <View style={styles.formItemRow}>
                  <Text style={styles.label}>组控模式</Text>
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
              </View>

              {/* 控制方式选择 */}
              <View style={styles.formItem}>
                <View style={styles.formItemRow}>
                  <Text style={styles.label}>控制方式</Text>
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
              </View>

              {/* 调光值输入 */}
              <View style={styles.formItem}>
                <View style={styles.formItemRow}>
                  <Text style={styles.label}>调光值 (0-20)</Text>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={20}
                      step={1}
                      value={formData.dimming}
                      onSlidingComplete={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dimming: value
                        }));
                      }}
                      minimumTrackTintColor="#1890ff"
                      maximumTrackTintColor="#ddd"
                      thumbTintColor="#1890ff"
                    />
                    <Text style={styles.sliderValue}>{formData.dimming}</Text>
                  </View>
                </View>
              </View>

              {/* A灯B灯选项 */}
              <View style={styles.formItem}>
                <View style={styles.formItemRow}>
                  <Text style={styles.label}>AB灯选项</Text>
                  <View className="flex-1 flex-row gap-3">
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center gap-2 rounded border p-2 ${
                        formData.enabledA ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, enabledA: !formData.enabledA })
                      }
                    >
                      <View className={`h-5 w-5 items-center justify-center rounded border ${
                        formData.enabledA ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                        {formData.enabledA && (
                          <Ionicons name="checkmark" size={16} color="#1890ff" />
                        )}
                      </View>
                      <Text className={`text-sm ${
                        formData.enabledA ? 'text-blue-500' : 'text-gray-600'
                      }`}>
                        A灯
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center gap-2 rounded border p-2 ${
                        formData.enabledB ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, enabledB: !formData.enabledB })
                      }
                    >
                      <View className={`h-5 w-5 items-center justify-center rounded border ${
                        formData.enabledB ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                        {formData.enabledB && (
                          <Ionicons name="checkmark" size={16} color="#1890ff" />
                        )}
                      </View>
                      <Text className={`text-sm ${
                        formData.enabledB ? 'text-blue-500' : 'text-gray-600'
                      }`}>
                        B灯
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.formItem}>
                <Text style={styles.label}>选择操作类型</Text>
                <View style={styles.radioGroup}>
                  {[
                    { label: '检测集中器参数', value: 1 },
                    { label: '设置集中器复位', value: 2 },
                    { label: '集中器手/自动切换', value: 3 },
                    { label: '检测集中器系统时钟', value: 4 },
                    { label: '设置集中器校时', value: 5 },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.radioButton,
                        concentratorParams === option.value && styles.radioButtonSelected,
                      ]}
                      onPress={() => setConcentratorParams(option.value)}
                    >
                      <View style={styles.radioButtonContent}>
                        <View style={[
                          styles.checkbox,
                          concentratorParams === option.value && styles.checkboxSelected
                        ]}>
                          {concentratorParams === option.value && (
                            <Ionicons name="checkmark" size={16} color="#1890ff" />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.radioButtonText,
                            concentratorParams === option.value && styles.radioButtonTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

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
              onPress={activeTab === 'single' ? handleConfirm : handleConcentratorConfirm}
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
    // height:320
  },
  formItem: {
    marginBottom: 16,
  },
  formItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    minWidth: 80,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    height: 40,
    // justifyContent: 'center',
  },
  picker: {
    height: 50,
    padding: 0,
    margin: 0,
    width: '100%',
    transform: [{ translateY: -7 }],
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight:40,
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
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1890ff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#1890ff',
    fontWeight: '600',
  },
  radioGroup: {
    gap: 8,
  },
  radioButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#91d5ff',
  },
  radioButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#1890ff',
    backgroundColor: '#e6f7ff',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  radioButtonTextSelected: {
    color: '#1890ff',
  },
});
