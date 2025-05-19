import LampRunLog from '@/components/runlog/LampRunLog/LampRunLog';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LOG_TYPES = [
  { id: 'run', name: '运行日志' },
  { id: 'online', name: '上下线日志' },
  { id: 'weather', name: '气象环境日志' },
  { id: 'alarm', name: '报警日志' },
  { id: 'system', name: '系统操作日志' },
  { id: 'plan', name: '预案操作日志' },
] as const;

export default function LogScreen() {
  const [activeTab, setActiveTab] = useState<typeof LOG_TYPES[number]['id']>('run');

  const renderContent = () => {
    switch (activeTab) {
      case 'run':
      case 'online':
      case 'weather':
        return <LampRunLog />;
      case 'alarm':
      case 'system':
      case 'plan':
        return (
          <View style={styles.placeholder}>
            <Text className="text-tertiary-500">功能开发中...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container} className="bg-background-50">
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
              onPress={() => setActiveTab(tab.id)}
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
      {renderContent()}
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