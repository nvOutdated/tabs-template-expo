import {
  add_lightPole,
  lightPole_batchAdd,
  lightPole_saveController,
  update_lightPole,
} from "@/api/street/singleLampApi";
import ScannerModal from "@/app/(logging-in)/(modal)/scannerModal";
import CustomSelectPicker from "@/components/public/CustomSelectPicker";
import { useMessageModal } from "@/components/ui/useMessageModal";
import { ElectricItem } from "@/store/eboxStore";
import useLoadingStore from "@/store/loadingStore";
import { useScannerStore } from "@/store/scannerStore";
import { ExpoAmapLocationService } from '@/utils/mapUtils';
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const locationService = new ExpoAmapLocationService('3eecd5c781cbafb6efc01aecb6149836');
interface Lamp {
  id?: number;
  lightLoop: string;
  lightingType: number;
  cfgId: number;
  cfgName: string | null;
  cfgMatched: boolean;
  phase: string;
  phaseMatched: boolean;
}
export interface Line {
  id: number;
  name: string;
}
interface Controller {
  id?: number;
  controllerId: string;
  controllerType: string;
  groupIds4Save: number[];
  groupIds4Detect: number[];
  lamps: Lamp[];
  domain: string | null;
  stateA: string | null;
  stateB: string | null;
  powerOnA: boolean | null;
  powerOnB: boolean | null;
  productId?: string;
}

export interface SingleLamp {
  id?: number;
  poleName: string;
  poleCode: string;
  poleType: string;
  installTime: string | null;
  lng: number;
  lat: number;
  addr: string | null;
  direction: number;
  controllers: Controller[];
  line_id: number;
}

interface EboxContactor {
  cfgId: number;
  cfgName: string;
}

export interface SingleLampSubmitContext {
  formData: SingleLamp;
  lineInfo: Line;
  eboxInfo?: ElectricItem;
  lampId?: number;
}

export interface SingleLampEditModalOverrides {
  onSubmitLightPole?: (context: SingleLampSubmitContext) => Promise<{ success: boolean; message?: string }>;
  onSubmitController?: (context: SingleLampSubmitContext) => Promise<{ success: boolean; message?: string }>;
  onSubmitBatchAdd?: (context: SingleLampSubmitContext) => Promise<{ success: boolean; message?: string }>;
}

interface SingleLampEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lineInfo: Line;
  lampId?: number;
  contactors?: EboxContactor[];
  lampInfo: SingleLamp;
  eboxInfo?: ElectricItem;
  overrides?: SingleLampEditModalOverrides;
}

const CONTROLLER_TYPES = [
  { value: "SINGLE_HEAD_PLC", label: "PLC单头" },
  { value: "DOUBLE_HEAD_PLC", label: "PLC双头" },
  // { value: 'SINGLE_HEAD_4G', label: '4G单头' },
  // { value: 'SINGLE_HEAD_ZIGBEE', label: 'ZIGBEE单灯' },
  { value: "SINGLE_HEAD_CAT1", label: "Cat1单头" },
  { value: "DOUBLE_HEAD_CAT1", label: "Cat1双头" },
];

const POLE_TYPES = [
  { value: "1", label: "单挑臂" },
  { value: "2", label: "双挑臂" },
  { value: "3", label: "玉兰灯" },
  { value: "4", label: "庭院灯" },
  { value: "5", label: "其他" },
];

const DIRECTIONS = [
  { value: 1, label: "东" },
  { value: 2, label: "南" },
  { value: 3, label: "西" },
  { value: 4, label: "北" },
];

const LIGHT_LOOPS = ["A", "B"];
const LIGHTING_TYPES = [
  { value: 0, label: "未知" },
  { value: 1, label: "机动车" },
  { value: 2, label: "非机动车" },
  { value: 3, label: "顶部灯" },
  { value: 4, label: "节日灯" },
  { value: 5, label: "其他" },
];

const SingleLampEditModal: React.FC<SingleLampEditModalProps> = ({
  visible,
  onClose,
  onSuccess,
  lineInfo,
  lampId,
  contactors = [],
  lampInfo,
  eboxInfo,
  overrides,
}) => {
  const { showModalSuccess, showModalError } = useMessageModal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SingleLamp>({
    poleName: "",
    poleCode: "",
    poleType: "1",
    installTime: null,
    lng: 0,
    lat: 0,
    addr: null,
    direction: 1,
    controllers: [],
    line_id: lineInfo.id,
  });
  const { showLoading, hideLoading } = useLoadingStore();
  const { scanResult, setScanResult } = useScannerStore();
  const [showScanner, setShowScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState<{
    type: "poleCode" | "controllerId";
    index?: number;
  } | null>(null);

  const getCurrentLocation = async () => {
    try {
      showLoading();
      // getLocation()
      // 使用高德地图定位服务获取位置
      //   const location = await locationService.getCurrentLocation({
      //     // enableHighAccuracy: true,
      //     // timeout: 15000,
      //   }
      // );
      //  console.log(location,1111);
      //  const { status } = await Location.requestForegroundPermissionsAsync();
      //  console.log(status);  // 可能的状态值是 'granted', 'denied', 'undetermined'

      const expoLocation = await Location.getLastKnownPositionAsync();
      console.log(expoLocation, 2222);
      const location = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        useIPFallback: true,
        useCachedLocation: true
      });

      if (expoLocation && expoLocation.coords) {
        // 更新集中器表单的位置信息
        setFormData(prev => ({
          ...prev,
          lat: expoLocation.coords.latitude,
          lng: expoLocation.coords.longitude,
          addr: location.address ? location.address : ''
        }));
        console.log(expoLocation.coords.latitude, expoLocation.coords.longitude, 1111);

        showModalSuccess(`位置获取成功${location.address ? `: ${location.address}` : ''}`);
      } else {
        throw new Error('获取位置信息失败');
      }
      // if (location && location.coords) {
      //   // 更新集中器表单的位置信息
      //   setEboxFormData(prev => ({
      //     ...prev,
      //     lat: location.coords.latitude.toString(),
      //     lng: location.coords.longitude.toString()
      //   }));

      //   showSuccess({
      //     message: `位置获取成功${location.address ? `: ${location.address}` : ''}`,
      //   });
      // } else {
      //   throw new Error('获取位置信息失败');
      // }
    } catch (error: any) {
      // console.error('Error getting location:', error);
      showModalError(error.message || "获取位置信息失败");
    } finally {
      hideLoading();
    }
  };

  // const {showSuccess,showWarning} = useMessageModal();
  // 加载单灯详情
  useEffect(() => {
    if (visible && lampId) {
      // loadLampDetail();
      setFormData({
        ...lampInfo, // This will override the defaults with any values from lampInfo
        line_id: lineInfo.id,
      });
    } else if (visible && !lampId) {
      // 新增模式，重置表单
      setFormData({
        poleName: "",
        poleCode: "",
        poleType: "1",
        installTime: null,
        lng: 0,
        lat: 0,
        addr: null,
        direction: 1,
        controllers: [],
        line_id: lineInfo.id,
      });
    }
  }, [visible, lineInfo, lampInfo]);

  // const loadLampDetail = useCallback(async () => {
  //   if (!lampId) return;
  //   try {
  //     setLoading(true);
  //     const res = await lightPole_query_get({ id: lampId });
  //     if (res.code === 200 && res.data) {
  //       setFormData({
  //         ...res.data,
  //         line_id: lineId,
  //       });
  //     } else {
  //       showWarning(res.message as string);
  //     }
  //   } catch (error: any) {
  //     showWarning(error.message as string);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [lampId, lineId, showWarning]);

  // 添加控制器
  const handleAddController = useCallback(() => {
    const newController: Controller = {
      controllerId: "",
      controllerType: "SINGLE_HEAD_PLC",
      groupIds4Save: [],
      groupIds4Detect: [],
      lamps: [],
      domain: null,
      stateA: null,
      stateB: null,
      powerOnA: null,
      powerOnB: null,
    };
    setFormData((prev) => ({
      ...prev,
      controllers: [...prev.controllers, newController],
    }));
  }, []);

  // 删除控制器
  const handleRemoveController = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      controllers: prev.controllers.filter((_, i) => i !== index),
    }));
  }, []);

  // 更新控制器
  const handleUpdateController = useCallback(
    (index: number, field: keyof Controller, value: any) => {
      setFormData((prev) => {
        const newControllers = [...prev.controllers];
        newControllers[index] = { ...newControllers[index], [field]: value };
        return { ...prev, controllers: newControllers };
      });
    },
    []
  );

  useEffect(() => {
    if (scanResult && scanTarget) {
      if (scanTarget.type === "poleCode") {
        setFormData((prev) => ({ ...prev, poleCode: scanResult }));
      } else if (
        scanTarget.type === "controllerId" &&
        typeof scanTarget.index === "number"
      ) {
        handleUpdateController(scanTarget.index, "controllerId", scanResult);
      }
      setScanResult("");
      setScanTarget(null);
      setShowScanner(false);
    }
  }, [scanResult, scanTarget, handleUpdateController, setScanResult]);

  // 添加灯头
  const handleAddLamp = useCallback((controllerIndex: number) => {
    const newLamp: Lamp = {
      lightLoop: "A",
      lightingType: 1,
      cfgId: 0,
      cfgName: null,
      cfgMatched: false,
      phase: "A",
      phaseMatched: false,
    };
    setFormData((prev) => {
      const newControllers = [...prev.controllers];
      newControllers[controllerIndex] = {
        ...newControllers[controllerIndex],
        lamps: [...newControllers[controllerIndex].lamps, newLamp],
      };
      return { ...prev, controllers: newControllers };
    });
  }, []);

  // 删除灯头
  const handleRemoveLamp = useCallback(
    (controllerIndex: number, lampIndex: number) => {
      setFormData((prev) => {
        const newControllers = [...prev.controllers];
        newControllers[controllerIndex] = {
          ...newControllers[controllerIndex],
          lamps: newControllers[controllerIndex].lamps.filter(
            (_, i) => i !== lampIndex
          ),
        };
        return { ...prev, controllers: newControllers };
      });
    },
    []
  );

  // 更新灯头
  const handleUpdateLamp = useCallback(
    (
      controllerIndex: number,
      lampIndex: number,
      field: keyof Lamp,
      value: any
    ) => {
      setFormData((prev) => {
        const newControllers = [...prev.controllers];
        const newLamps = [...newControllers[controllerIndex].lamps];
        newLamps[lampIndex] = { ...newLamps[lampIndex], [field]: value };
        newControllers[controllerIndex] = {
          ...newControllers[controllerIndex],
          lamps: newLamps,
        };
        return { ...prev, controllers: newControllers };
      });
    },
    []
  );

  // 更新组ID
  const handleUpdateGroupIds = useCallback(
    (controllerIndex: number, type: "save" | "detect", groupId: number) => {
      setFormData((prev) => {
        const newControllers = [...prev.controllers];
        const groupIds =
          type === "save"
            ? [...newControllers[controllerIndex].groupIds4Save]
            : [...newControllers[controllerIndex].groupIds4Detect];

        const index = groupIds.indexOf(groupId);
        if (index === -1) {
          groupIds.push(groupId);
        } else {
          groupIds.splice(index, 1);
        }

        if (type === "save") {
          newControllers[controllerIndex] = {
            ...newControllers[controllerIndex],
            groupIds4Save: groupIds,
          };
        } else {
          newControllers[controllerIndex] = {
            ...newControllers[controllerIndex],
            groupIds4Detect: groupIds,
          };
        }
        return { ...prev, controllers: newControllers };
      });
    },
    []
  );

  const isGroupSelected = useCallback((groupIds: number[], groupId: number) => {
    return groupIds.includes(groupId);
  }, []);

  //add or update light pole
  const handleSubmitLightPole = useCallback(async () => {
    if (overrides?.onSubmitLightPole) {
      try {
        showLoading();
        const result = await overrides.onSubmitLightPole({
          formData,
          lineInfo,
          eboxInfo,
          lampId: formData.id,
        });
        if (result?.success) {
          showModalSuccess(result.message || "修改成功");
          onSuccess();
        } else if (result) {
          showModalError(result.message || "修改失败");
        }
      } catch (error: any) {
        showModalError(error.message || "修改失败");
      } finally {
        hideLoading();
      }
      return;
    }
    try {
      showLoading();
      const params = {
        id: formData.id,
        addr: formData.addr,
        address: formData.addr,
        direction: formData.direction,
        lng: formData.lng,
        lat: formData.lat,
        name: formData.poleName,
        sn: formData.poleCode,
        model_type: formData.poleType,
        install_time: formData.installTime,
        line_id: formData.line_id,
        ebox_id: eboxInfo?.id,
        lamp_devices: [],
        lamp_holders: [],
      };
      if (formData.id) {
        const res = await update_lightPole(params);
        if (res.code === 200) {
          showModalSuccess("修改成功");
          onSuccess();
        } else {
          showModalError("修改失败");
        }
      } else {
        const res = await add_lightPole(params);
        if (res.code === 200) {
          showModalSuccess("添加成功");
          onSuccess();
        } else {
          showModalError("添加失败");
        }
      }
    } catch (error: any) {
      showModalError(error.message as string);
    } finally {
      hideLoading();
    }
  }, [
    formData,
    showModalSuccess,
    showModalError,
    eboxInfo,
    onSuccess,
    showLoading,
    hideLoading,
    overrides,
    lineInfo,
  ]);

  //add or update controller
  const handleSubmitController = useCallback(async () => {
    if (overrides?.onSubmitController) {
      try {
        showLoading();
        const result = await overrides.onSubmitController({
          formData,
          lineInfo,
          eboxInfo,
          lampId: formData.id,
        });
        if (result?.success) {
          showModalSuccess(result.message || "修改成功");
          onSuccess();
        } else if (result) {
          showModalError(result.message || "修改失败");
        }
      } catch (error: any) {
        showModalError(error.message || "修改失败");
      } finally {
        hideLoading();
      }
      return;
    }
    const params = {
      id: formData.id,
      controllers: formData.controllers,
      poleCode: formData.poleCode,
      poleName: formData.poleName,
      poleType: formData.poleType,
      installTime: formData.installTime,
      lineId: formData.line_id,
      direction: formData.direction,
      lng: formData.lng,
      lat: formData.lat,
      addr: formData.addr,
      eboxId: eboxInfo?.id,
    };
    const res = await lightPole_saveController(params);
    console.log(res, 11111);

    if (res.code === 200) {
      showModalSuccess("修改成功");
      onSuccess();
    } else {
      showModalError("修改失败");
    }
  }, [formData, showModalSuccess, showModalError, onSuccess, eboxInfo, overrides, showLoading, hideLoading, lineInfo]);

  const handleSubmitBatchAdd = useCallback(async () => {
    if (overrides?.onSubmitBatchAdd) {
      try {
        showLoading();
        const result = await overrides.onSubmitBatchAdd({
          formData,
          lineInfo,
          eboxInfo,
          lampId: formData.id,
        });
        if (result?.success) {
          showModalSuccess(result.message || "添加成功");
          onSuccess();
        } else if (result) {
          showModalError(result.message || "添加失败");
        }
      } catch (error: any) {
        showModalError(error.message || "添加失败");
      } finally {
        hideLoading();
      }
      return;
    }
    try {
      showLoading();
      const params = {
        deviceCode: eboxInfo?.sn,
        lines: [
          {
            lineName: lineInfo.name,
            poles: [
              {
                controllers: formData.controllers,
                lampsDirectlyOnPole: [],
                poleInfo: {
                  direction: formData.direction,
                  poleCode: formData.poleCode,
                  poleName: formData.poleName,
                  poleType: formData.poleType,
                },
              },
            ],
          },
        ],
      };
      const res = await lightPole_batchAdd(params);
      console.log(res, 11111);

      if (res.code === 200) {
        showModalSuccess("添加成功");
        onSuccess();
      } else {
        showModalError("添加失败");
      }
    } catch (error: any) {
      showModalError(error.message as string);
    } finally {
      hideLoading();
    }
  }, [
    formData,
    showModalSuccess,
    showModalError,
    onSuccess,
    eboxInfo,
    showLoading,
    hideLoading,
    lineInfo,
    overrides,
  ]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {showScanner ? (
        <ScannerModal onClose={() => setShowScanner(false)} />
      ) : (
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            {/* 标题栏 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {lampId ? "编辑单灯" : "新增单灯"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loading && !lampId ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#409eff" />
              </View>
            ) : (
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                  {/* 基本信息 */}
                  <View className="mb-2">
                    <Text className="w-full text-base font-semibold text-gray-900 mb-3 flex justify-center">
                      基本信息
                    </Text>

                    <View className="mb-3 flex-row items-center ">
                      <Text className="w-1/4 text-sm text-gray-700">
                        灯杆名称 *
                      </Text>
                      <TextInput
                        className="w-3/4 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="请输入灯杆名称"
                        value={formData.poleName}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, poleName: text }))
                        }
                      />
                    </View>

                    <View className="mb-3 flex-row items-center ">
                      <Text className="w-1/4 text-sm text-gray-700">
                        灯杆编号 *
                      </Text>
                      <View className="w-3/4 flex-row items-center gap-2">
                        <TextInput
                          className="flex-1 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="请输入灯杆编号"
                          value={formData.poleCode}
                          onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, poleCode: text }))
                          }
                        />
                        <TouchableOpacity
                          onPress={() => {
                            setScanTarget({ type: "poleCode" });
                            setShowScanner(true);
                          }}
                        >
                          <Ionicons name="scan-outline" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="mb-3 flex-row items-center ">
                      <Text className="w-1/4 text-sm text-gray-700">
                        灯杆类型
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <View className="flex-row gap-1">
                          {POLE_TYPES.map((type) => (
                            <TouchableOpacity
                              key={type.value}
                              onPress={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  poleType: type.value,
                                }))
                              }
                              className={`px-2 py-2 rounded-md border ${formData.poleType === type.value
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white border-gray-300"
                                }`}
                            >
                              <Text
                                className={`text-sm ${formData.poleType === type.value
                                  ? "text-white"
                                  : "text-gray-700"
                                  }`}
                              >
                                {type.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View className="mb-3 flex-row items-center ">
                      <Text className="w-1/4 text-sm text-gray-700">
                        灯杆方向
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <View className="flex-row gap-2">
                          {DIRECTIONS.map((dir) => (
                            <TouchableOpacity
                              key={dir.value}
                              onPress={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  direction: dir.value,
                                }))
                              }
                              className={`px-4 py-2 rounded-md border ${formData.direction === dir.value
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white border-gray-300"
                                }`}
                            >
                              <Text
                                className={`text-sm ${formData.direction === dir.value
                                  ? "text-white"
                                  : "text-gray-700"
                                  }`}
                              >
                                {dir.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View className="mb-3 flex-row items-center ">
                      <Text className="w-1/4 text-sm text-gray-700">
                        地理位置
                      </Text>
                      <TextInput
                        className="w-2/4 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="请输入地址"
                        value={formData.addr || ""}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, addr: text }))
                        }
                      />
                      <TouchableOpacity
                        onPress={() => {
                          getCurrentLocation()
                        }}
                        className="w-1/4 ml-1 h-10 px-3 py-2 border bg-blue-500 border-gray-300 rounded-md text-sm"
                      >
                        <Text className="text-white">获取位置</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="mb-3 flex-row gap-2">
                      <View className="flex-1 flex-row items-center">
                        <Text className="w-1/4 text-sm text-gray-700">经度</Text>
                        <TextInput
                          className="w-3/4 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="请输入经度"
                          value={formData.lng?.toString()}
                          onChangeText={(text) => {
                            const num = parseFloat(text) || 0;
                            setFormData((prev) => ({ ...prev, lng: num }));
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                      <View className="flex-1 flex-row items-center">
                        <Text className="w-1/4 text-sm text-gray-700">纬度</Text>
                        <TextInput
                          className="w-3/4 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="请输入纬度"
                          value={formData.lat?.toString()}
                          onChangeText={(text) => {
                            const num = parseFloat(text) || 0;
                            setFormData((prev) => ({ ...prev, lat: num }));
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>

                  {/* 控制器列表 */}
                  <View className="mb-2">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-base font-semibold text-gray-900">
                        控制器列表
                      </Text>
                      <TouchableOpacity
                        onPress={handleAddController}
                        className="px-3 py-1 bg-blue-500 rounded-md"
                      >
                        <Text className="text-sm text-white">添加控制器</Text>
                      </TouchableOpacity>
                    </View>

                    {formData.controllers.length === 0 ? (
                      <View className="p-4 bg-gray-50 rounded-md items-center">
                        <Text className="text-sm text-gray-500">
                          暂无控制器，请添加
                        </Text>
                      </View>
                    ) : (
                      formData.controllers.map((controller, ctrlIndex) => (
                        <View
                          key={ctrlIndex}
                          className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50"
                        >
                          <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold text-gray-900">
                              控制器 {ctrlIndex + 1}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleRemoveController(ctrlIndex)}
                              className="px-2 py-1 bg-red-500 rounded-md"
                            >
                              <Text className="text-xs text-white">删除</Text>
                            </TouchableOpacity>
                          </View>

                          <View className="mb-2 flex-row items-center">
                            <Text className="w-1/4 text-sm text-gray-700">
                              控制器ID *
                            </Text>
                            <View className="w-3/4 flex-row items-center gap-2">
                              <TextInput
                                className="flex-1 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                                placeholder="请输入控制器ID"
                                value={controller.controllerId}
                                onChangeText={(text) =>
                                  handleUpdateController(
                                    ctrlIndex,
                                    "controllerId",
                                    text
                                  )
                                }
                              />
                              <TouchableOpacity
                                onPress={() => {
                                  setScanTarget({
                                    type: "controllerId",
                                    index: ctrlIndex,
                                  });
                                  setShowScanner(true);
                                }}
                              >
                                <Ionicons
                                  name="scan-outline"
                                  size={24}
                                  color="#666"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View className="mb-2 flex-row items-center">
                            <Text className="w-1/4 text-sm text-gray-700">
                              控制器类型
                            </Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            >
                              <View className="flex-row gap-1">
                                {CONTROLLER_TYPES.map((type) => (
                                  <TouchableOpacity
                                    key={type.value}
                                    onPress={() =>
                                      handleUpdateController(
                                        ctrlIndex,
                                        "controllerType",
                                        type.value
                                      )
                                    }
                                    className={`px-1 py-2 rounded-md border ${controller.controllerType === type.value
                                      ? "bg-blue-500 border-blue-500"
                                      : "bg-white border-gray-300"
                                      }`}
                                  >
                                    <Text
                                      className={`text-xs ${controller.controllerType === type.value
                                        ? "text-white"
                                        : "text-gray-700"
                                        }`}
                                    >
                                      {type.label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </ScrollView>
                          </View>

                          <View className="mb-4">
                            <View className="flex-row mb-2">
                              <Text className="w-1/5 text-sm font-medium text-gray-700">
                                所属组
                              </Text>
                              <View className="w-4/5">
                                {/* First row */}
                                <View className="flex-row mb-1">
                                  {Array.from({ length: 8 }, (_, i) => i + 1).map(
                                    (groupNum) => (
                                      <Pressable
                                        key={`save-${groupNum}`}
                                        onPress={() =>
                                          handleUpdateGroupIds(
                                            ctrlIndex,
                                            "save",
                                            groupNum
                                          )
                                        }
                                        className={`w-8 h-8 mx-1 rounded-md items-center justify-center ${isGroupSelected(
                                          controller.groupIds4Save,
                                          groupNum
                                        )
                                          ? "bg-blue-500"
                                          : "bg-gray-100 border border-gray-300"
                                          }`}
                                      >
                                        <Text
                                          className={`text-xs ${isGroupSelected(
                                            controller.groupIds4Save,
                                            groupNum
                                          )
                                            ? "text-white"
                                            : "text-gray-700"
                                            }`}
                                        >
                                          {String(groupNum).padStart(2, "0")}
                                        </Text>
                                      </Pressable>
                                    )
                                  )}
                                </View>
                                {/* Second row */}
                                <View className="flex-row">
                                  {Array.from({ length: 8 }, (_, i) => i + 9).map(
                                    (groupNum) => (
                                      <Pressable
                                        key={`save-${groupNum}`}
                                        onPress={() =>
                                          handleUpdateGroupIds(
                                            ctrlIndex,
                                            "save",
                                            groupNum
                                          )
                                        }
                                        className={`w-8 h-8 mx-1 rounded-md items-center justify-center ${isGroupSelected(
                                          controller.groupIds4Save,
                                          groupNum
                                        )
                                          ? "bg-blue-500"
                                          : "bg-gray-100 border border-gray-300"
                                          }`}
                                      >
                                        <Text
                                          className={`text-xs ${isGroupSelected(
                                            controller.groupIds4Save,
                                            groupNum
                                          )
                                            ? "text-white"
                                            : "text-gray-700"
                                            }`}
                                        >
                                          {String(groupNum).padStart(2, "0")}
                                        </Text>
                                      </Pressable>
                                    )
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                          {controller.lamps.length === 0 ? (
                            <View className="p-2 bg-white rounded-md items-center">
                              <Text className="text-xs text-gray-500">
                                暂无灯头，请添加
                              </Text>
                            </View>
                          ) : (
                            controller.lamps.map((lamp, lampIndex) => (
                              <View
                                key={lampIndex}
                                className="mb-2 p-2 border border-gray-200 rounded-md bg-white"
                              >
                                <View className="flex-row items-center justify-between mb-2">
                                  <Text className="w-1/4 text-xs font-semibold text-gray-900">
                                    灯头 {lampIndex + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      handleRemoveLamp(ctrlIndex, lampIndex)
                                    }
                                    className="px-2 py-1 bg-red-500 rounded-md"
                                  >
                                    <Text className="text-xs text-white">
                                      删除
                                    </Text>
                                  </TouchableOpacity>
                                </View>

                                <View className="mb-2 flex-row items-center">
                                  <Text className="w-1/4 text-xs text-gray-700 mb-1">
                                    照明控制
                                  </Text>
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                  >
                                    <View className="flex-row gap-2">
                                      {LIGHT_LOOPS.map((loop) => (
                                        <TouchableOpacity
                                          key={loop}
                                          onPress={() =>
                                            handleUpdateLamp(
                                              ctrlIndex,
                                              lampIndex,
                                              "lightLoop",
                                              loop
                                            )
                                          }
                                          className={`px-3 py-1 rounded-md border ${lamp.lightLoop === loop
                                            ? "bg-blue-500 border-blue-500"
                                            : "bg-white border-gray-300"
                                            }`}
                                        >
                                          <Text
                                            className={`text-xs ${lamp.lightLoop === loop
                                              ? "text-white"
                                              : "text-gray-700"
                                              }`}
                                          >
                                            {loop}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                  </ScrollView>
                                </View>

                                <View className="mb-2 flex-row items-center">
                                  <Text className="w-1/4 text-xs text-gray-700 mb-1">
                                    照明类型
                                  </Text>
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                  >
                                    <View className="flex-row gap-2">
                                      {LIGHTING_TYPES.map((type) => (
                                        <TouchableOpacity
                                          key={type.value}
                                          onPress={() =>
                                            handleUpdateLamp(
                                              ctrlIndex,
                                              lampIndex,
                                              "lightingType",
                                              type.value
                                            )
                                          }
                                          className={`px-3 py-1 rounded-md border ${lamp.lightingType === type.value
                                            ? "bg-blue-500 border-blue-500"
                                            : "bg-white border-gray-300"
                                            }`}
                                        >
                                          <Text
                                            className={`text-xs ${lamp.lightingType === type.value
                                              ? "text-white"
                                              : "text-gray-700"
                                              }`}
                                          >
                                            {type.label}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                  </ScrollView>
                                </View>

                                {/* 交流接触器选择 */}
                                <View className="mb-2 flex-row items-center">
                                  <Text className="w-1/4 text-xs text-gray-700 mb-1">
                                    交流接触器
                                  </Text>
                                  <View className="w-3/4">
                                    <CustomSelectPicker
                                      options={contactors.map((contactor) => ({
                                        label: contactor.cfgName,
                                        value: String(contactor.cfgId),
                                      }))}
                                      value={String(lamp.cfgId)}
                                      onChange={(value: string) => {
                                        handleUpdateLamp(
                                          ctrlIndex,
                                          lampIndex,
                                          "cfgId",
                                          value
                                        );
                                        const selected = contactors.find(
                                          (item) => String(item.cfgId) === value
                                        );
                                        handleUpdateLamp(
                                          ctrlIndex,
                                          lampIndex,
                                          "cfgName",
                                          selected?.cfgName || null
                                        );
                                      }}
                                      initialLabel="请选择交流接触器"
                                    />
                                  </View>
                                </View>

                                <View className="mb-2 flex-row items-center">
                                  <Text className="w-1/4 text-xs text-gray-700">
                                    相序 *
                                  </Text>
                                  <View className="flex-row gap-2">
                                    {["A", "B", "C"].map((phase) => (
                                      <Pressable
                                        key={phase}
                                        onPress={() =>
                                          handleUpdateLamp(
                                            ctrlIndex,
                                            lampIndex,
                                            "phase",
                                            phase
                                          )
                                        }
                                        className={`w-10 h-8 rounded-md items-center justify-center ${lamp.phase === phase
                                          ? "bg-blue-500"
                                          : "bg-gray-100 border border-gray-300"
                                          }`}
                                      >
                                        <Text
                                          className={`text-sm ${lamp.phase === phase
                                            ? "text-white"
                                            : "text-gray-700"
                                            }`}
                                        >
                                          {phase}
                                        </Text>
                                      </Pressable>
                                    ))}
                                  </View>
                                </View>
                                {controller.controllerType ===
                                  "SINGLE_HEAD_CAT1" ||
                                  controller.controllerType ===
                                  "DOBLE_HEAD_CAT1" ? (
                                  <>
                                    <View className="mb-1 flex-row items-center">
                                      <View className="flex-row items-center justify-between mb-2">
                                        <Text className="w-1/4 text-sm text-gray-700">
                                          产品ID *
                                        </Text>
                                        <TextInput
                                          className="w-3/4 h-10 px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                                          placeholder="请输入产品ID"
                                          value={controller.productId}
                                        />
                                      </View>
                                    </View>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </View>
                            ))
                          )}

                          {/* 灯头列表 */}
                          <View className="mt-1">
                            <View className="flex-row items-center justify-between mb-2">
                              <Text className="w-1/4 text-sm font-semibold text-gray-900">
                                灯头列表
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleAddLamp(ctrlIndex)}
                                className="px-2 py-1 bg-green-500 rounded-md"
                              >
                                <Text className="text-xs text-white">
                                  添加灯头
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* 底部按钮 */}
            <View className="flex-row justify-end gap-2 p-4 border-t border-gray-200">
              {lampId ? (
                <>
                  <TouchableOpacity
                    onPress={handleSubmitLightPole}
                    className="px-4 py-2 rounded-md bg-success-700"
                    disabled={loading}
                  >
                    <Text className="text-sm text-white">修改灯杆信息</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmitController}
                    className="px-4 py-2 rounded-md bg-success-700"
                    disabled={loading}
                  >
                    <Text className="text-sm text-white">修改控制器信息</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmitBatchAdd}
                  className="px-4 py-2 rounded-md bg-success-700"
                  disabled={loading}
                >
                  <Text className="text-sm text-white">确定</Text>
                </TouchableOpacity>
              )}
              {/*  <TouchableOpacity
              onPress={handleSubmitLightPole}
              className="px-4 py-2 rounded-md bg-success-700"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-sm text-white">提交灯杆信息</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitController}
              className="px-4 py-2 rounded-md bg-primary-500"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-sm text-white">提交控制器信息</Text>
              )}
            </TouchableOpacity> */}
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

export default SingleLampEditModal;
