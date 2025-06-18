import { getEboxListApi } from "@/api/street/configuration";
import { get_version_list } from "@/api/street/streetCommon";
import { EboxFormData } from "@/components/addDevice/EboxForm";
import AreaDrawer, { Area, Device } from "@/components/ebox/AreaDrawer";
import DeviceDrawer from "@/components/ebox/DeviceDrawer";
import EboxList from "@/components/ebox/EboxList";
import EboxOperationList from "@/components/ebox/EboxOperationList";
import NormalHeader from "@/components/ebox/NormalHeader";
import OperationHeader from "@/components/ebox/OperationHeader";
import PublicEditModal from "@/components/public/publicModal/publicEditModal";
import { useAreaStore } from "@/store/areaStore";
import {
  DEVICE_STATUS,
  EboxOperation,
  ElectricItem,
  useEboxStore,
} from "@/store/eboxStore";
import { useGlobalStore } from "@/store/globalStateStore";
import { useWebSocketStore } from "@/store/websocketStore";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const { width } = Dimensions.get("window");

// 将常量移到组件外部
const centralControllerImage = require("@/assets/images/street/electricBox/centralController.png");

// 添加附件类型定义
type Attachment = {
  id: number;
  url: string;
  name: string;
  file_type: string;
};

// 扩展 ElectricItem 类型以包含 computed 属性
type ExtendedElectricItem = ElectricItem & {
  computed: {
    thumbnailSource: any;
    deviceStatus: any;
    attachments: {
      uri: string;
      id: number;
    }[];
  };
};

export default function EboxScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  // const [selectedEbox, setSelectedEbox] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<Area>({
    area_id: 0,
    name: "",
    children: [],
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
  const [isOperationMode, setIsOperationMode] = useState(false);
  const [electricBoxes, setElectricBoxes] = useState<ExtendedElectricItem[]>(
    []
  );
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const loadingRef = useRef(false);
  const endReachedRef = useRef(false);
  const { WS_SmartLight_Data } = useWebSocketStore();
  const {
    selectedDevices,
    setSelectedDevices,
    toggleDeviceSelection,
    allEboxes,
    updateDeviceStatus,
    operations,
    addOperation,
  } = useEboxStore();
  const [versionList, setVersionList] = useState<any>([]);
  const { areaList, areaWithDevicesList,allAreaList } = useAreaStore();
  const [allAreaListprops,setAllAreaListprops] = useState<any>([])
  const [editItem,setEditItem] =  useState<EboxFormData>()

  const [isAnyItemEditing, setIsAnyItemEditing] = useState(false);
  const currentServer = useGlobalStore((state) => state.currentServer);
  
  const isScreenFocused = useRef(true);
  
  useEffect(() => {
    get_version_list({}).then(res => {
      if (res.code === 200) {
        const setVersionListData = res.data.map((item:any)=>{
          return {
            key:item,
            value:item,
            label:item,
          }
        })
        setVersionList(setVersionListData)
      }
    })
    const setAllAreaListpropsData = allAreaList.map((item:any)=>{
      return {
        key:item.area_id,
        value:item.area_id,
        label:item.name,
      }
    })
    setAllAreaListprops(setAllAreaListpropsData)
  }, [])
   
  const onEditBox = (item:EboxFormData)=>{
    console.log("点击修改",item);
    
    setEditItem(item);
    setEditModalVisible(true);
  }

  const onRemoveBox = (item:any)=>{
    console.log(item,"点击删除");
  }
  
  const closeEditModal = ()=>{
    setEditModalVisible(false)
  }

  const saveEdit = ()=>{
    console.log("保存成功");
    
  }

  const handleSaveEdit = (data: any) => {
    handleUpdateEbox(data);
    setEditModalVisible(false);
  }

  // 添加页面焦点监听
  useFocusEffect(
    useCallback(() => {
      // 页面获得焦点
      isScreenFocused.current = true;
      console.log("集中器页面获得焦点");

      // 返回清理函数，在页面失去焦点时执行
      return () => {
        isScreenFocused.current = false;
        console.log("集中器页面失去焦点");
        // 清理状态
        setRefreshing(false);
        setLoading(false);
        setShowDrawer(false);
        setShowDeviceDrawer(false);
      };
    }, [])
  );

  const loadEleBoxList = useCallback(
    async (page: number, isRefresh: boolean = false) => {
      if (loadingRef.current) return;
      try {
        loadingRef.current = true;
        setLoading(true);
        const params = {
          page_size: pageSize,
          current: page,
          area_id: selectedArea.area_id || null,
          name: searchText || null,
        };
        const res = await getEboxListApi(params);
        if (res.code === 200) {
          const formattedEleBoxList = res.data || [];
          setElectricBoxes((prev) => {
            if (isRefresh) return formattedEleBoxList;
            const existingIds = new Set(prev.map((eleBox) => eleBox.id));
            const uniqueNewEleBoxes = formattedEleBoxList.filter(
              (eleBox: any) => !existingIds.has(eleBox.id)
            );
            return [...prev, ...uniqueNewEleBoxes];
          });

          const hasMoreData = formattedEleBoxList.length >= pageSize;
          setHasMore(hasMoreData);
          endReachedRef.current = !hasMoreData;
          setCurrentPage(page);
        }
      } catch (error) {
        console.log("加载电箱列表失败:", error);
        if (isRefresh) {
          setElectricBoxes([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [selectedArea.area_id, searchText, pageSize]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // 重置所有相关状态
    setSelectedArea({
      area_id: 0,
      name: "",
      children: [],
    });
    setSelectedDevice(undefined); // 清除设备选中状态
    setSearchText("");
    setCurrentPage(1);
    setHasMore(true);
    endReachedRef.current = false;
    loadEleBoxList(1, true);
    setIsAnyItemEditing(false)
  }, []);

  useEffect(() => {
    if (
      WS_SmartLight_Data?.did &&
      WS_SmartLight_Data?.deviceName &&
      isScreenFocused.current
    ) {
      const findEboxItems = allEboxes.find(i=>i.device_info.id===WS_SmartLight_Data.did)
      // 只在页面获得焦点时处理数据
      if (
        WS_SmartLight_Data.type === "dataChange" ||
        WS_SmartLight_Data.type === "warning"
      ) {
        // 检查数据是否真的发生变化
        const currentDevice = allEboxes.find(
          (device) => device.device_info.id === WS_SmartLight_Data.did
        );
        if (currentDevice) {
          const deviceInfo = {
            online: WS_SmartLight_Data.data?.online ?? true,
            open: WS_SmartLight_Data.data?.open ?? false,
            warn: WS_SmartLight_Data.data?.warn ?? false,
            loops:
              WS_SmartLight_Data.data?.loops || currentDevice.device_info.loops,
          };
          // 只有当状态真正发生变化时才更新设备状态
          if (
            currentDevice.device_info.online !== deviceInfo.online ||
            currentDevice.device_info.open !== deviceInfo.open ||
            currentDevice.device_info.warn !== deviceInfo.warn ||
            JSON.stringify(currentDevice.device_info.loops) !==
              JSON.stringify(deviceInfo.loops)
          ) {
            // 更新设备状态
            updateDeviceStatus(WS_SmartLight_Data.did, deviceInfo);
          }
          if (findEboxItems&&
            (findEboxItems.device_info.online !== deviceInfo.online ||
              findEboxItems.device_info.open !== deviceInfo.open ||
              findEboxItems.device_info.warn !== deviceInfo.warn ||
              JSON.stringify(findEboxItems.device_info.loops) !==
              JSON.stringify(deviceInfo.loops))
          ) {
            // 更新设备状态
            // findEboxItems.
            setElectricBoxes((pre)=>{
              const index = pre.findIndex(i=>i.device_info.id===WS_SmartLight_Data.did)
              if(index!==-1){
                pre[index].device_info = {
                  ...pre[index].device_info,
                  ...deviceInfo
                }
              }
              return [...pre]
            })
          }

          if (isOperationMode) {
            // 根据状态确定模块
            const deviceStatus =
              Object.values(DEVICE_STATUS).find((status) =>
                status.condition(deviceInfo)
              ) || DEVICE_STATUS.ONLINE;

            // 添加操作记录（不需要判断状态变化）
            const newOperation: EboxOperation = {
              id: `${WS_SmartLight_Data.did}_${Date.now()}`,
              title: `${WS_SmartLight_Data.deviceName} - ${
                WS_SmartLight_Data.data?.eventType || "状态更新"
              }`,
              content: `设备状态: ${
                WS_SmartLight_Data.data?.description || "无描述"
              }\n操作模式: ${
                WS_SmartLight_Data.data?.mode || "未知"
              }\n操作时间: ${WS_SmartLight_Data.data?.optTime || "未知"}`,
              type: deviceInfo.warn ? "warning" : "info",
              module: deviceStatus.module,
              timestamp: WS_SmartLight_Data.data?.dateTimeMillis || Date.now(),
              status: "completed",
              sn: WS_SmartLight_Data.sn || "",
              deviceName: WS_SmartLight_Data.deviceName,
              data: {
                phase3Voltage: WS_SmartLight_Data.data?.phase3Voltage || [
                  0, 0, 0,
                ],
                phase3Electric: WS_SmartLight_Data.data?.phase3Electric || [
                  0, 0, 0,
                ],
                power: WS_SmartLight_Data.data?.power || 0,
                dateTime: WS_SmartLight_Data.data?.dateTime || "",
                powerOff: WS_SmartLight_Data.data?.powerOff || "",
                powerOn: WS_SmartLight_Data.data?.powerOn || "",
                loops: WS_SmartLight_Data.data?.loops || Array(8).fill(false),
                ios: WS_SmartLight_Data.data?.ios || Array(8).fill(false),
                enabledWeekly: WS_SmartLight_Data.data?.enabledWeekly || false,
                enabledAlways: WS_SmartLight_Data.data?.enabledAlways || false,
                enabledLocation:
                  WS_SmartLight_Data.data?.enabledLocation || false,
                enabledMultiple:
                  WS_SmartLight_Data.data?.enabledMultiple || false,
                enabledLight: WS_SmartLight_Data.data?.enabledLight || false,
                enabledWater: WS_SmartLight_Data.data?.enabledWater || false,
                enabledOneByOne:
                  WS_SmartLight_Data.data?.enabledOneByOne || false,
                mode: WS_SmartLight_Data.data?.mode || "未知",
                optTime: WS_SmartLight_Data.data?.optTime || "未知",
                eventType: WS_SmartLight_Data.data?.eventType || "状态更新",
                reportTime: WS_SmartLight_Data.data?.reportTime || "",
                description: WS_SmartLight_Data.data?.description || "无描述",
                warn: deviceInfo.warn,
              },
            };
            addOperation(newOperation);
          }
        }
      }
      if (WS_SmartLight_Data.type === "online" && isScreenFocused.current) {
        const deviceInfo = {
          online: true,
          open: false,
          warn: false,
          loops: Array(8).fill(false),
        };
        setElectricBoxes((pre)=>{
          const index = pre.findIndex(i=>i.device_info.id===WS_SmartLight_Data.did)
          if(index!==-1){
            pre[index].device_info = {
              ...pre[index].device_info,
              ...deviceInfo
            }
          }
          return [...pre]
        })
        updateDeviceStatus(WS_SmartLight_Data.did, deviceInfo);
      }
      if (WS_SmartLight_Data.type === "offline" && isScreenFocused.current) {
        const deviceInfo = {
          online: false,
          open: false,
          warn: false,
          loops: Array(8).fill(false),
        };
        setElectricBoxes((pre)=>{
          const index = pre.findIndex(i=>i.device_info.id===WS_SmartLight_Data.did)
          if(index!==-1){
            pre[index].device_info = {
              ...pre[index].device_info,
              ...deviceInfo
            }
          }
          return [...pre]
        })
        updateDeviceStatus(WS_SmartLight_Data.did, deviceInfo);
      }
    }
  }, [WS_SmartLight_Data, updateDeviceStatus, addOperation, allEboxes]);
  // 初始加载
  useEffect(() => {
    setCurrentPage(1);
    loadEleBoxList(1, true);
  }, []);

  // 监听搜索和区域变化
  useEffect(() => {
    if (currentPage === 0) return;
    setCurrentPage(1);
    loadEleBoxList(1, true);
  }, [searchText, selectedArea.area_id]);

  const onEndReached = useCallback(() => {
    if (!refreshing && hasMore && !loading && !endReachedRef.current) {
      loadEleBoxList(currentPage + 1);
    }
  }, [hasMore, refreshing, loading, currentPage, loadEleBoxList]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // 当搜索栏有内容时，清空已选择的区域
    if (text) {
      setSelectedArea({} as Area);
    }
  }, []);

  const handleSelectArea = useCallback((area: Area) => {
    setSelectedArea(area);
    setSearchText("");
    setSelectedDevice(undefined); // 清除设备选中状态
    setShowDrawer(false);
  }, []);

  const handleSelectDevice = useCallback((device: Device) => {
    // 根据设备信息重新查询
    setSearchText(device.name);
    setSelectedArea({} as Area);
    setSelectedDevice(device);
    setShowDrawer(false);
  }, []);

  const handleSetShowDrawer = useCallback(() => {
    if (isOperationMode) {
      setShowDeviceDrawer(true);
    } else {
      setShowDrawer(true);
    }
  }, [isOperationMode]);

  const handleToggleOperationMode = useCallback(() => {
    setIsOperationMode((prev) => !prev);
    setSelectedDevices(new Map());
    setSelectedDevice(undefined); // 清除设备选中状态
  }, [setSelectedDevices]);

  const handleOperationSelect = useCallback((operation: any) => {
    console.log("Selected operation:", operation);
  }, []);

  const handleDeviceSelect = useCallback(
    (deviceId: number) => {
      const device = allEboxes.find((d) => d.id === deviceId);
      if (device) {
        toggleDeviceSelection(device);
      }
    },
    [allEboxes, toggleDeviceSelection]
  );

  const handleAreaSelect = useCallback(
    (areaId: number) => {
      const areaDevices = allEboxes.filter(
        (device) => device.area_id === areaId
      );
      const allSelected = areaDevices.every((device) =>
        selectedDevices.has(device.id)
      );

      const newSelectedDevices = new Map(selectedDevices);
      areaDevices.forEach((device) => {
        if (allSelected) {
          newSelectedDevices.delete(device.id);
        } else {
          newSelectedDevices.set(device.id, device);
        }
      });

      setSelectedDevices(newSelectedDevices);
    },
    [allEboxes, selectedDevices, setSelectedDevices]
  );

  // 计算处理后的电箱列表
  const processedElectricBoxes = useMemo(() => {
    return electricBoxes.map((item) => {
      // 计算图片
      const attachments = item.ebox_attachments || [];
      const thumbnailSource =
        attachments.length > 0
          ? {
              uri: currentServer
                ? `http://${currentServer.ip}:${currentServer.filePort}${attachments[0].url}`
                : "",
              id: attachments[0].id,
            }
          : centralControllerImage;

      // 计算设备状态
      const deviceStatus =
        Object.values(DEVICE_STATUS).find((status) =>
          status.condition(item.device_info)
        ) || DEVICE_STATUS.OFFLINE;

      return {
        ...item,
        computed: {
          thumbnailSource,
          deviceStatus,
          attachments: attachments.map((attachment) => ({
            uri: currentServer
              ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}`
              : "",
            id: attachment.id,
          })),
        },
      };
    });
  }, [electricBoxes, currentServer]);

  const handleUpdateEbox = useCallback(
    (updatedEbox: any) => {
      setElectricBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          if (box.id === updatedEbox.id) {
            // 更新图片数据
            const attachments = updatedEbox.ebox_attachments || [];
            const thumbnailSource =
              attachments.length > 0
                ? {
                    uri: currentServer
                      ? `http://${currentServer.ip}:${currentServer.filePort}${attachments[0].url}`
                      : "",
                    id: attachments[0].id,
                  }
                : centralControllerImage;

            // 计算设备状态
            const deviceStatus =
              Object.values(DEVICE_STATUS).find((status) =>
                status.condition(updatedEbox.device_info)
              ) || DEVICE_STATUS.OFFLINE;

            return {
              ...box,
              ...updatedEbox,
              computed: {
                ...box.computed,
                thumbnailSource,
                deviceStatus,
                attachments: attachments.map((attachment: Attachment) => ({
                  uri: currentServer
                    ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}`
                    : "",
                  id: attachment.id,
                })),
              },
            };
          }
          return box;
        });
      });

      // 触发刷新
      setRefreshing(true);
      loadEleBoxList(1, true);
    },
    [currentServer, loadEleBoxList]
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        {isOperationMode ? (
          <OperationHeader
            handleSetShowDrawer={handleSetShowDrawer}
            onToggleOperationMode={handleToggleOperationMode}
            selectedDevicesCount={selectedDevices.size}
          />
        ) : (
          <NormalHeader
            onSearch={handleSearch}
            handleSetShowDrawer={handleSetShowDrawer}
            selectedArea={selectedArea}
            selectedDevice={selectedDevice}
            onToggleOperationMode={handleToggleOperationMode}
          />
        )}

        {isOperationMode ? (
          <EboxOperationList
            operations={operations}
            onOperationSelect={handleOperationSelect}
          />
        ) : (
          <EboxList
            electricBoxes={processedElectricBoxes}
            loading={loading}
            hasMore={hasMore}
            onEndReached={onEndReached}
            onUpdateEbox={handleUpdateEbox}
            onEditEbox={onEditBox}
            onDeleteEbox={onRemoveBox}
            setIsAnyItemEditing={setIsAnyItemEditing}
            isAnyItemEditing={isAnyItemEditing}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* 始终渲染抽屉组件，使用 display 控制显示 */}
      <AreaDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        areas={areaList}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
        onSelectDevice={handleSelectDevice}
      />

      <DeviceDrawer
        visible={showDeviceDrawer}
        onClose={() => setShowDeviceDrawer(false)}
        areas={areaWithDevicesList}
        selectedDevices={selectedDevices}
        onDeviceSelect={handleDeviceSelect}
        onAreaSelect={handleAreaSelect}
      />

      <PublicEditModal
       visible={editModalVisible}
       onClose={closeEditModal}
       onSave={saveEdit}
       initialData={editItem || {} as EboxFormData}
       versionList={versionList}
       allAreaList={allAreaListprops}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
