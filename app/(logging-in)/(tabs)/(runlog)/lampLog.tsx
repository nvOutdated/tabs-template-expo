import LampRunLog from '@/components/runlog/LampRunLog/LampRunLog';
import React, { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LOG_TYPES = [
  { id: 'run', name: '运行日志' },
  { id: 'online', name: '上下线日志' },
  { id: 'weather', name: '气象环境日志' },
  { id: 'alarm', name: '报警日志' },
  { id: 'system', name: '系统操作日志' },
  { id: 'plan', name: '预案操作日志' },
] as const;

// 将 TabBar 组件提取出来并使用 memo 优化
const TabBar = memo(({ 
  activeTab, 
  onTabPress 
}: { 
  activeTab: typeof LOG_TYPES[number]['id'];
  onTabPress: (id: typeof LOG_TYPES[number]['id']) => void;
}) => (
  <View style={styles.tabBar} className="bg-background-100 border-b border-tertiary-100">
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBarContent}
    >
      {LOG_TYPES.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
            className={activeTab === tab.id ? 'text-info-500' : 'text-tertiary-900'}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
const ContentRenderer = memo(({ activeTab }: { activeTab: typeof LOG_TYPES[number]['id'] }) => {
  switch (activeTab) {
    case 'run':
      return <LampRunLog />;
    case 'online':
    case 'weather':
    case 'alarm':
    case 'system':
    case 'plan':
      return <PlaceholderContent />;
    default:
      return null;
  }
});

ContentRenderer.displayName = "ContentRenderer";

export default function LogScreen() {
  const [activeTab, setActiveTab] = useState<typeof LOG_TYPES[number]['id']>('run');

  // 使用 useCallback 优化 tab 切换函数
  const handleTabPress = useCallback((id: typeof LOG_TYPES[number]['id']) => {
    setActiveTab(id);
  }, []);

  return (
    <View style={styles.container} className="bg-background-50">
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
      <ContentRenderer activeTab={activeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 50,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tab: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#409EFF',
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});