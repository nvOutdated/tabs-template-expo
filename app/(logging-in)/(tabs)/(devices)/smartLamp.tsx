import { get_smart_light_list } from "@/api/street/smartLightApi";
import AreaDrawer, { Area, Device } from "@/components/smartLight/AreaDrawer";
import DeviceDrawer from "@/components/smartLight/DeviceDrawer";
import NormalHeader from "@/components/smartLight/NormalHeader";
import OperationHeader from "@/components/smartLight/OperationHeader";
import SmartLightList from "@/components/smartLight/SmartLightList";
import SmartLightOperationList from "@/components/smartLight/SmartOperationList";
import { useAreaStore } from "@/store/areaStore";
import { useGlobalStore } from "@/store/globalStateStore";
import {
  DEVICE_STATUS,
  SmartLightItem,
  SmartLightOperation,
  useSmartLightStore,
} from "@/store/smartLightStore";
import { useWebSocketStore } from "@/store/websocketStore";
import { getUserInfo } from "@/utils/useStorageState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const { width } = Dimensions.get('window');

// 将常量移到组件外部
const centralControllerImage = require("@/assets/images/street/smartLight/smartLamp.png");

export default function SmartLampScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [userInfo, setUserInfo] = useState<string>("");
  const [isOperationMode, setIsOperationMode] = useState(false);
  const [smartLights, setSmartLights] = useState<SmartLightItem[]>([]);
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
    allSmartLights,
    updateDeviceStatus,
    operations,
    addOperation,
  } = useSmartLightStore();

  const { areaList, areaWithDevicesList } = useAreaStore();
  const currentServer = useGlobalStore(state => state.currentServer);

  const loadSmartLightList = useCallback(
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
        const res = await get_smart_light_list(params);
        if (res.code === 200) {
          const formattedSmartLightList = res.data || [];
          setSmartLights((prev) => {
            if (isRefresh) return formattedSmartLightList;
            const existingIds = new Set(
              prev.map((smartLight) => smartLight.id)
            );
            const uniqueNewSmartLights = formattedSmartLightList.filter(
              (smartLight: any) => !existingIds.has(smartLight.id)
            );
            return [...prev, ...uniqueNewSmartLights];
          });

          const hasMoreData = formattedSmartLightList.length >= pageSize;
          setHasMore(hasMoreData);
          endReachedRef.current = !hasMoreData;
          setCurrentPage(page);
        }
      } catch (error) {
        console.log("加载智能灯列表失败:", error);
        if (isRefresh) {
          setSmartLights([]);
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
    setSelectedArea({} as Area);
    setSearchText("");
    setCurrentPage(1);
    setHasMore(true);
    endReachedRef.current = false;
    loadSmartLightList(1, true);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info) {
        setUserInfo(info.name || "未登录用户");
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (WS_SmartLight_Data?.did && WS_SmartLight_Data?.deviceName) {
      if (
        WS_SmartLight_Data.type === "dataChange" ||
        WS_SmartLight_Data.type === "warning"
      ) {
        console.log("WebSocket数据更新:", WS_SmartLight_Data);
        // 更新设备状态
        updateDeviceStatus(WS_SmartLight_Data.did, WS_SmartLight_Data.data);
        // 获取设备状态
        const deviceInfo = {
          online: WS_SmartLight_Data.data?.online ?? true,
          open: WS_SmartLight_Data.data?.open ?? false,
          warn: WS_SmartLight_Data.data?.warn ?? false,
        };

        // 根据状态确定模块
        const deviceStatus =
          Object.values(DEVICE_STATUS).find((status) =>
            status.condition(deviceInfo)
          ) || DEVICE_STATUS.ONLINE;

        // 添加操作记录
        const newOperation: SmartLightOperation = {
          id: `${WS_SmartLight_Data.did}_${Date.now()}`,
          title: `${WS_SmartLight_Data.deviceName} - ${
            WS_SmartLight_Data.data?.eventType || "状态更新"
          }`,
          content: `设备状态: ${
            WS_SmartLight_Data.data?.description || "无描述"
          }\n操作模式: ${WS_SmartLight_Data.data?.mode || "未知"}\n操作时间: ${
            WS_SmartLight_Data.data?.optTime || "未知"
          }`,
          type: deviceInfo.warn ? "warning" : "info",
          module: deviceStatus.module,
          timestamp: WS_SmartLight_Data.data?.dateTimeMillis || Date.now(),
          status: "completed",
          sn: WS_SmartLight_Data.sn || "",
          deviceName: WS_SmartLight_Data.deviceName,
          data: {
            phase3Voltage: WS_SmartLight_Data.data?.phase3Voltage || [0, 0, 0],
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
            enabledLocation: WS_SmartLight_Data.data?.enabledLocation || false,
            enabledMultiple: WS_SmartLight_Data.data?.enabledMultiple || false,
            enabledLight: WS_SmartLight_Data.data?.enabledLight || false,
            enabledWater: WS_SmartLight_Data.data?.enabledWater || false,
            enabledOneByOne: WS_SmartLight_Data.data?.enabledOneByOne || false,
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
      if (WS_SmartLight_Data.type === "online") {
        updateDeviceStatus(WS_SmartLight_Data.did, WS_SmartLight_Data.data);
      }
      if (WS_SmartLight_Data.type === "offline") {
        updateDeviceStatus(WS_SmartLight_Data.did, WS_SmartLight_Data.data);
      }
    }
  }, [WS_SmartLight_Data, updateDeviceStatus, addOperation]);
  // 初始加载
  useEffect(() => {
    setCurrentPage(1);
    loadSmartLightList(1, true);
  }, []);

  // 监听搜索和区域变化
  useEffect(() => {
    if (currentPage === 0) return;
    setCurrentPage(1);
    loadSmartLightList(1, true);
  }, [searchText, selectedArea.area_id]);

  const onEndReached = useCallback(() => {
    if (!refreshing && hasMore && !loading && !endReachedRef.current) {
      loadSmartLightList(currentPage + 1);
    }
  }, [hasMore, refreshing, loading, currentPage, loadSmartLightList]);

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
    setShowDrawer(false);
  }, []);

  const handleSelectDevice = useCallback((device: Device) => {
    // 根据设备信息重新查询
    setSearchText(device.name);
    setSelectedArea({} as Area);
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
  }, [setSelectedDevices]);

  const handleOperationSelect = useCallback((operation: any) => {
    console.log("Selected operation:", operation);
  }, []);

  const handleDeviceSelect = useCallback(
    (deviceId: number) => {
      const device = allSmartLights.find((d) => d.id === deviceId);
      if (device) {
        toggleDeviceSelection(device);
      }
    },
    [allSmartLights, toggleDeviceSelection]
  );

  const handleAreaSelect = useCallback(
    (areaId: number) => {
      const areaDevices = allSmartLights.filter(
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
    [allSmartLights, selectedDevices, setSelectedDevices]
  );

  // 计算处理后的智能灯列表
  const processedSmartLights = useMemo(() => {
    return smartLights.map(item => {
      // 计算图片
      const attachments = item.smart_light_attachments || [];
      const images = attachments.length === 0 
        ? [centralControllerImage]
        : attachments.map(attachment => ({
            uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}` : ''
          }));

      // 计算设备状态
      const deviceStatus = Object.values(DEVICE_STATUS).find(status => 
        status.condition(item.device_info)
      ) || DEVICE_STATUS.OFFLINE; // 提供默认值

      return {
        ...item,
        computed: {
          thumbnailSource: images[0],
          deviceStatus
        }
      };
    });
  }, [smartLights, currentServer]);

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
            onToggleOperationMode={handleToggleOperationMode}
          />
        )}

        {isOperationMode ? (
          <SmartLightOperationList
            operations={operations}
            onOperationSelect={handleOperationSelect}
          />
        ) : (
          <SmartLightList
            smartLights={processedSmartLights}
            userInfo={userInfo}
            loading={loading}
            hasMore={hasMore}
            onEndReached={onEndReached}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
