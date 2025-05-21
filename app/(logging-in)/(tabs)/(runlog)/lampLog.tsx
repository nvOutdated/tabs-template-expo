import { get_container_list } from "@/api/street/streetCommon";
import AlarmLog from '@/components/runlog/LampRunLog/AlarmLog';
import LampRunLog from '@/components/runlog/LampRunLog/LampRunLog';
import OnOfflineLog from '@/components/runlog/LampRunLog/OnOfflineLog';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LOG_TYPES = [
  { id: 'run', name: '运行日志' },
  { id: 'online', name: '上下线日志' },
  // { id: 'weather', name: '气象环境日志' },
  { id: 'alarm', name: '报警日志' },
  // { id: 'system', name: '系统操作日志' },
  // { id: 'plan', name: '预案操作日志' },
] as const;

interface Container {
  id: string;
  device_code: string;
  name: string;
  searchName: string;
  deviceId: number;
}

// 将 TabBar 组件提取出来并使用 memo 优化
const TabBar = memo(({ 
  activeTab, 
  onTabPress 
}: { 
  activeTab: typeof LOG_TYPES[number]['id'];
  onTabPress: (id: typeof LOG_TYPES[number]['id']) => void;
}) => (
  <View style={styles.tabBar} className="bg-background-100">
    <View style={styles.tabBarContent}>
      {LOG_TYPES.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => onTabPress(tab.id)}
            className={`flex-1 ${activeTab === tab.id ? 'bg-info-500' : 'bg-background-200'}`}
          >
            <Text
              className={`text-sm font-medium text-center ${activeTab === tab.id ? 'text-white' : 'text-tertiary-900'}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
          {index < LOG_TYPES.length - 1 && (
            <View style={styles.divider} className="bg-tertiary-200" />
          )}
        </React.Fragment>
      ))}
    </View>
  </View>
));

TabBar.displayName = "TabBar";

// 将占位组件提取出来并使用 memo 优化
const PlaceholderContent = memo(() => (
  <View style={styles.placeholder}>
    <Text className="text-tertiary-500">功能开发中...</Text>
  </View>
));

PlaceholderContent.displayName = "PlaceholderContent";

// 将内容渲染逻辑提取为独立组件
const ContentRenderer = memo(({ 
  activeTab,
  containerList,
  selectedDevice,
  setSelectedDevice,
}: { 
  activeTab: typeof LOG_TYPES[number]['id'];
  containerList: Container[];
  selectedDevice: number | null;
  setSelectedDevice: (device: number | null) => void;
}) => {
  switch (activeTab) {
    case 'run':
      return (
        <LampRunLog 
          containerList={containerList}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />
      );
    case 'online':
      return (
        <OnOfflineLog
          containerList={containerList}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />
      );
    case 'alarm':
      return (
        <AlarmLog
          containerList={containerList}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />
      );
    // case 'weather':
    // case 'system':
    // case 'plan':
    //   return <PlaceholderContent />;
    default:
      return null;
  }
});

ContentRenderer.displayName = "ContentRenderer";

export default function LogScreen() {
  const [activeTab, setActiveTab] = useState<typeof LOG_TYPES[number]['id']>('run');
  const [containerList, setContainerList] = useState<Container[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number|null>(null);

  // 获取集中器列表
  const fetchContainerList = async() => {
    try {
      const res = await get_container_list({});
      if(res.code === 200) {
        const convertedData = res.data.map((item: any) => ({
          id: item.id,
          device_code: item.device_code,
          name: item.name,
          searchName: `${item.device_code}(${item.name})`,
          deviceId: item.device_id
        }));
        setContainerList(convertedData);
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchContainerList();
  }, []);

  // 使用 useCallback 优化 tab 切换函数
  const handleTabPress = useCallback((id: typeof LOG_TYPES[number]['id']) => {
    setActiveTab(id);
  }, []);

  return (
    <View style={styles.container} className="bg-background-50">
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
      <ContentRenderer 
        activeTab={activeTab} 
        containerList={containerList}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 40,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  divider: {
    width: 1,
    height: '60%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});