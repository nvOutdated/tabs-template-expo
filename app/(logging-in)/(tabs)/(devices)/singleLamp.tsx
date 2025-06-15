// singleLamp.tsx - 优化后的完整代码
import { lightPole_query_list, ordinaryLamp_query_list, query_eleBox_line } from "@/api/street/singleLampApi";
import BatchControlModal, { BatchControlFormData } from "@/components/singleLamp/BatchControlModal";
import ControllerInfoCard from "@/components/singleLamp/ControllerInfoCard";
import DeviceSelector from "@/components/singleLamp/DeviceSelector";
import LineSelector from "@/components/singleLamp/LineSelector";
import MessagePanel from "@/components/singleLamp/MessagePanel";
import SingleLampDrawer, { Area, Device } from "@/components/singleLamp/SingleLampDrawer";
import SingleLampList from "@/components/singleLamp/SingleLampList";
import { useAreaStore } from "@/store/areaStore";
import { ElectricItem, useEboxStore } from "@/store/eboxStore";
import { useGlobalStore } from '@/store/globalStateStore';
import { useWebSocketStore } from "@/store/websocketStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface Line {
  id: number;
  name: string;
}

interface Attachment {
  id: number;
  url: string;
  name: string;
  file_type: string;
}

interface Controller {
  id: number;
  controllerId: string;
  controllerType: string;
  groupIds4Save: number[];
  groupIds4Detect: number[];
  lamps: {
    id: number;
    lightLoop: string;
    lightingType: number;
    cfgId: number;
    cfgName: string | null;
    cfgMatched: boolean;
    phase: string;
    phaseMatched: boolean;
  }[];
  domain: string | null;
  stateA: string | null;
  stateB: string | null;
  powerOnA: boolean | null;
  powerOnB: boolean | null;
}

interface OrdinaryLamp {
  id: number;
  lamp_attachments?: Attachment[];
}

interface SingleLamp {
  id: number;
  poleName: string;
  poleCode: string;
  poleType: string;
  installTime: string | null;
  lng: number;
  lat: number;
  addr: string | null;
  direction: number;
  controllers: Controller[];
  lamp_attachments?: Attachment[];
  container_id: string;
}

export default function SingleLampScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerInitialized, setDrawerInitialized] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>({} as Area);
  const [selectedDevice, setSelectedDevice] = useState<ElectricItem | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [singleLamps, setSingleLamps] = useState<SingleLamp[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentOperation, setCurrentOperation] = useState<'all' | 'controller'>('all');
  const [controllers, setControllers] = useState<Controller[]>([]);
  const loadingRef = useRef(false);
  const insets = useSafeAreaInsets();
  const [selectedControllers, setSelectedControllers] = useState<{ lampId: number; controllerId: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSingleLamps, setFilteredSingleLamps] = useState<SingleLamp[]>([]);
  const [showBatchControlModal, setShowBatchControlModal] = useState(false);
  const currentServer = useGlobalStore(state => state.currentServer);
  const singleLampOffline = require('@/assets/images/street/singleLamp/singleLampOfflin.png');
  const [messages, setMessages] = useState<{ id: string; content: string; timestamp: number }[]>([]);
  const getStateMessage = (state?: string): string => {
    const stateMap: Record<string, string> = {
      'SINGLE_STATE_ERR': '故障',
      'SINGLE_STATE_ON': '开启',
      'SINGLE_STATE_OFF': '关闭',
      'SINGLE_STATE_WAIT': '检测中'
    };
    return state ? stateMap[state] || '' : '';
  };
  const { areaList } = useAreaStore();
  const { allEboxes } = useEboxStore();
  const {WS_SingleControlResp_Data,
    WS_CentralParamsResp_Data,
    WS_SingleDatetimeResp_Data,
    WS_SwitchAutoResp_Data,
    WS_DetectDatetimeParamsResp_Data} = useWebSocketStore()
  // 初始化时选择第一个可用的集中器
  useEffect(() => {
    if (allEboxes.length > 0 && !selectedDevice) {
      const firstDevice = allEboxes[0];
      setSelectedDevice(firstDevice);
      setSearchText(firstDevice.name);
      loadLines(firstDevice.id);
    }
  }, [allEboxes]);
  useEffect(()=>{
     if(WS_CentralParamsResp_Data&&currentOperation === 'controller'){
        const {data,deviceName,sn} = WS_CentralParamsResp_Data;
        if(data&&deviceName&&sn){
          const messageContent = ` ${deviceName}(${sn})  循环次数：${data.lamp_circle_no},接收超时：${data.lamp_timeout},重试次数：${data.lamp_retry},手自动状态：${data.auto}`;
          const newMessage = {
            id: Date.now().toString(),
            content: messageContent,
            timestamp: Date.now()
          };
          setMessages(prev => [newMessage, ...prev]);
        }
     }
  },[WS_CentralParamsResp_Data])
  useEffect(()=>{
    if(WS_SingleDatetimeResp_Data&&currentOperation === 'controller'){
      const {data,deviceName,sn} = WS_SingleDatetimeResp_Data;
      if(data&&deviceName&&sn){
        const messageContent = ` ${deviceName}(${sn})  设备时钟：${data.dateTime}`;
        const newMessage = {
          id: Date.now().toString(),
          content: messageContent,
          timestamp: Date.now()
        };
        setMessages(prev => [newMessage, ...prev]);
      }
    }
  },[WS_SingleDatetimeResp_Data]) 
  useEffect(()=>{
    if(WS_SwitchAutoResp_Data&&currentOperation === 'controller'){
      const {data,deviceName,sn} = WS_SwitchAutoResp_Data;
      if(data&&deviceName&&sn){
        const messageContent = ` ${deviceName}(${sn})  手自动状态：${data.auto}`;
        const newMessage = {
          id: Date.now().toString(),
          content: messageContent,
          timestamp: Date.now()
        };
        setMessages(prev => [newMessage, ...prev]);
      }
    }
  },[WS_SwitchAutoResp_Data]) 
  useEffect(()=>{
    if(WS_DetectDatetimeParamsResp_Data&&currentOperation === 'controller'){
      const {data,deviceName,sn} = WS_DetectDatetimeParamsResp_Data;
      if(data&&deviceName&&sn){
        const messageContent = ` ${deviceName}(${sn})  设备时钟：${data.dateTime}`;
        const newMessage = {
          id: Date.now().toString(),
          content: messageContent,
          timestamp: Date.now()
        };
        setMessages(prev => [newMessage, ...prev]);
      }
    }
  },[WS_DetectDatetimeParamsResp_Data])  
  useEffect(() => {
    if (WS_SingleControlResp_Data&&currentOperation === 'controller') {
      const { data, deviceName } = WS_SingleControlResp_Data;
      if (data) {
        // 处理消息面板数据
        let stateAMessage = '';
        let stateBMessage = '';
        // 使用映射函数处理状态
        stateAMessage = getStateMessage(data.stateA);
        stateBMessage = getStateMessage(data.stateB);
        // 构建消息内容
        const messageContent = `${data.id} A灯状态：${stateAMessage},B灯状态：${stateBMessage},调光值：${data.dimming}`;
        // 添加新消息到列表
        const newMessage = {
          id: Date.now().toString(),
          content: messageContent,
          timestamp: Date.now()
        };
        setMessages(prev => [newMessage, ...prev]);

        // 更新控制器状态
        setSingleLamps(prevLamps => {
          return prevLamps.map(lamp => {
            const updatedControllers = lamp.controllers.map(controller => {
              if (controller.controllerId === data.id) {
                return {
                  ...controller,
                  stateA: data.stateA,
                  stateB: data.stateB,
                  powerOnA: data.enabledA,
                  powerOnB: data.enabledB,
                } as Controller;
              }
              return controller;
            });

            return {
              ...lamp,
              controllers: updatedControllers
            };
          });
        });

        // // 更新 filteredSingleLamps（如果当前在控制器视图）
        if (currentOperation === 'controller') {
          setFilteredSingleLamps(prevLamps => {
            return prevLamps.map(lamp => {
              const updatedControllers = lamp.controllers.map(controller => {
                if (controller.controllerId === data.id) {
                  return {
                    ...controller,
                    stateA: data.stateA,
                    stateB: data.stateB,
                    powerOnA:data.enabledA,
                    powerOnB:data.enabledB
                  } as Controller;
                }
                return controller;
              });

              return {
                ...lamp,
                controllers: updatedControllers
              };
            });
          });
        }
      }
    }
  }, [WS_SingleControlResp_Data, currentOperation]);




  // 处理搜索
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredSingleLamps(singleLamps);
      return;
    }

    const filtered = singleLamps.filter(lamp => {
      return lamp.controllers.some((controller: Controller) => 
        controller.controllerId.toLowerCase().includes(text.toLowerCase())
      );
    });
    setFilteredSingleLamps(filtered);
  }, [singleLamps]);

  // 当 singleLamps 更新时，同步更新 filteredSingleLamps
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      setFilteredSingleLamps(singleLamps);
    }
  }, [singleLamps, searchQuery, handleSearch]);

  const loadLines = useCallback(async (deviceId: number) => {
    try {
      setLoading(true);
      const res = await query_eleBox_line({ ebox_id: deviceId });
      if (res.code === 200) {
        const lineList = res.data || [];
        setLines(lineList);
        if (lineList.length > 0) {
          setSelectedLine(lineList[0]);
          loadSingleLamps(deviceId, lineList[0].id);
        } else {
          setSingleLamps([]);
          setSelectedLine(null);
        }
      }
    } catch (error) {
      console.log('加载线路列表失败:', error);
      setLines([]);
      setSelectedLine(null);
      setSingleLamps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSingleLamps = useCallback(async (deviceId: number, lineId: number) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const params = {
        deviceId,
        lineId,
      };
      // 获取普通灯列表（包含图片信息）
      const res1 = await ordinaryLamp_query_list({line_id:lineId});
      const ordinaryLamps = res1?.data || [];
      
      // 获取单灯列表
      const res = await lightPole_query_list(params);
      if (res.code === 200) {
        const lampList = res.data || [];
        
        // 合并图片信息
        const mergedLampList = lampList.map((lamp: SingleLamp) => {
          // 查找对应的普通灯数据
          const matchingOrdinaryLamp = ordinaryLamps.find((ordinary: OrdinaryLamp) => ordinary.id === lamp.id);
          if (matchingOrdinaryLamp) {
            return {
              ...lamp,
              container_id:matchingOrdinaryLamp.container_id,
              lamp_attachments: matchingOrdinaryLamp.lamp_attachments || []
            };
          }
          return lamp;
        });
        
        setSingleLamps(mergedLampList);
        // 提取所有控制器并展平数组
        const controllerList = mergedLampList.reduce((acc: Controller[], lamp: SingleLamp) => {
          if (lamp.controllers && Array.isArray(lamp.controllers)) {
            return [...acc, ...lamp.controllers];
          }
          return acc;
        }, []);
        setControllers(controllerList);
      }
    } catch (error) {
      console.log('加载单灯列表失败:', error);
      setSingleLamps([]);
      setControllers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedDevice && selectedLine) {
      loadSingleLamps(selectedDevice.device_info.id, selectedLine.id);
    }
  }, [selectedDevice, selectedLine, loadSingleLamps]);

  const handleEdit = useCallback(() => {
    // if (selectedControllers.length > 0) {
    //   setShowBatchControlModal(true);
    // }
    setShowBatchControlModal(true);
  }, [selectedControllers]);

  const handleBatchControlConfirm = useCallback((formData: BatchControlFormData) => {
    // TODO: Implement batch control logic
    console.log('Batch control form data:', formData);
    console.log('Selected controllers:', selectedControllers);
  }, [selectedControllers]);

  const handleSelectionChange = useCallback((selected: { lampId: number; controllerId: number }[]) => {
    setSelectedControllers(selected);
  }, []);

  // 计算总控制器数量
  const totalControllerCount = useCallback(() => {
    return singleLamps.reduce((count, lamp) => {
      return count + (lamp.controllers?.length || 0);
    }, 0);
  }, [singleLamps]);

  const handleSelectDevice = useCallback((device: Device) => {
    const eboxDevice = allEboxes.find(ebox => ebox.id === device.id);
    if (eboxDevice) {
      setSelectedDevice(eboxDevice);
      setSearchText(device.name);
      setShowDrawer(false);
      loadLines(eboxDevice.id);
    }
  }, [loadLines, allEboxes]);

  const handleSelectLine = useCallback((line: Line) => {
    setSelectedLine(line);
    if (selectedDevice) {
      loadSingleLamps(selectedDevice.device_info.id, line.id);
    }
  }, [selectedDevice, loadSingleLamps]);

  // 修改 drawer 打开逻辑
  const handleOpenDrawer = useCallback(() => {
    // 使用 requestAnimationFrame 来优化状态更新
    requestAnimationFrame(() => {
      setShowDrawer(true);
      if (!drawerInitialized) {
        setDrawerInitialized(true);
      }
    });
  }, [drawerInitialized]);

  const handleCloseDrawer = useCallback(() => {
    requestAnimationFrame(() => {
      setShowDrawer(false);
    });
  }, []);

  const handleOperationChange = useCallback((operation: 'all' | 'controller') => {
    setCurrentOperation(operation);
  }, []);

  const handleUpdateSingleLamp = useCallback((updatedSingleLamp: SingleLamp) => {
    setSingleLamps(prevLamps => {
      return prevLamps.map(lamp => {
        if (lamp.id === updatedSingleLamp.id) {
          // 更新图片数据
          const attachments = updatedSingleLamp.lamp_attachments || [];
          const thumbnailSource = attachments.length > 0 
            ? {
                uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachments[0].url}` : '',
                id: attachments[0].id
              }
            : singleLampOffline;

          return {
            ...lamp,
            ...updatedSingleLamp,
            computed: {
              thumbnailSource,
              attachments: attachments.map(attachment => ({
                uri: currentServer ? `http://${currentServer.ip}:${currentServer.filePort}${attachment.url}` : '',
                id: attachment.id
              }))
            }
          };
        }
        return lamp;
      });
    });

    // 触发刷新
    setRefreshing(true);
    if (selectedDevice && selectedLine) {
      loadSingleLamps(selectedDevice.device_info.id, selectedLine.id);
    }
  }, [selectedDevice, selectedLine, loadSingleLamps, currentServer]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
  }, []);



  const renderEmptyState = () => {
    if (!selectedDevice) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500">请先选择一个集中器</Text>
        </View>
      );
    }
    if (lines.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500">该集中器下暂无线路数据</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-gray-500">暂无单灯数据</Text>
      </View>
    );
  };
  
  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        <DeviceSelector
          selectedDevice={selectedDevice}
          onSelectDevice={handleOpenDrawer}
          onSearch={handleSearch}
          onEdit={handleEdit}
          onOperationChange={handleOperationChange}
          currentOperation={currentOperation}
        />

        {selectedDevice && (
          <LineSelector
            lines={lines}
            selectedLine={selectedLine}
            onSelectLine={handleSelectLine}
            onSearch={handleSearch}
            onEdit={handleEdit}
            selectedCount={selectedControllers.length}
            totalCount={totalControllerCount()}
            currentOperation={currentOperation}
          />
        )}

        {currentOperation === 'all' ? (
          <SingleLampList
            singleLamps={singleLamps}
            loading={loading}
            hasMore={false}
            onEndReached={() => {}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            ListEmptyComponent={renderEmptyState()}
            onUpdateSuccess={handleUpdateSingleLamp}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <ControllerInfoCard 
              singleLamps={filteredSingleLamps} 
              onSelectionChange={handleSelectionChange}
              selectedControllers={selectedControllers}
            />
            <MessagePanel
              messages={messages}
              onClearMessages={handleClearMessages}
            />
          </View>
        )}
      </View>
     
      <SingleLampDrawer
        visible={showDrawer}
        onClose={handleCloseDrawer}
        areas={areaList}
        selectedDevice={selectedDevice}
        onSelectDevice={handleSelectDevice}
      />

      <BatchControlModal
        visible={showBatchControlModal}
        onClose={() => setShowBatchControlModal(false)}
        onConfirm={handleBatchControlConfirm}
        eboxId={selectedDevice?.device_info.id}
        lineId={selectedLine?.id?.toString()}
        deviceInfo={selectedDevice ? {
          sn: selectedDevice.name,
          device_info: {
            id: selectedDevice.device_info.id
          }
        } : undefined}
        controllerId={selectedControllers[0]?.controllerId?.toString()}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  controllerList: {
    flex: 1,
    padding: 8,
  },
});