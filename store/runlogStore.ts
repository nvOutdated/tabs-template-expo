import { AlarmMessage, LogEntry, RunLogState } from '@/types/runlog';
import { create } from 'zustand';

const MAX_UNREAD_COUNT = 99;

// 生成唯一ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 模拟报警数据
const mockAlarms = [
  {
    type: 'alarm' as const,
    title: '设备离线',
    content: '设备编号: DEV-001\n位置: 1号车间\n状态: 离线超过30分钟',
    module: '设备监控',
  },
  {
    type: 'warning' as const,
    title: '温度异常',
    content: '设备编号: DEV-002\n位置: 2号车间\n当前温度: 85°C\n阈值: 80°C',
    module: '环境监控',
  },
  {
    type: 'info' as const,
    title: '系统更新',
    content: '系统版本: v2.1.0\n更新内容: 性能优化\n更新时间: 2024-03-20',
    module: '系统管理',
  },
];

export const useRunLogStore = create<RunLogState & {
  addAlarm: (alarm: Omit<AlarmMessage, 'id' | 'isRead' | 'timestamp'>) => void;
  markAlarmAsRead: (id: string) => void;
  markAllAlarmsAsRead: () => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  addMockAlarm: () => void;
}>((set, get) => ({
  alarms: [],
  unreadCount: 0,
  logs: [],

  addAlarm: (alarm) => {
    const newAlarm: AlarmMessage = {
      ...alarm,
      id: generateId(),
      isRead: false,
      timestamp: Date.now(),
    };

    set((state) => {
      const newAlarms = [...state.alarms, newAlarm];
      const unreadCount = Math.min(
        newAlarms.filter((a) => !a.isRead).length,
        MAX_UNREAD_COUNT
      );
      return { alarms: newAlarms, unreadCount };
    });
  },

  markAlarmAsRead: (id) => {
    set((state) => {
      const newAlarms = state.alarms.filter((alarm) => alarm.id !== id);
      const unreadCount = Math.min(
        newAlarms.filter((a) => !a.isRead).length,
        MAX_UNREAD_COUNT
      );
      return { alarms: newAlarms, unreadCount };
    });
  },

  markAllAlarmsAsRead: () => {
    set((state) => ({
      alarms: [],
      unreadCount: 0,
    }));
  },

  addLog: (log) => {
    const newLog: LogEntry = {
      ...log,
      id: generateId(),
      timestamp: Date.now(),
    };

    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  addMockAlarm: () => {
    const randomAlarm = mockAlarms[Math.floor(Math.random() * mockAlarms.length)];
    get().addAlarm(randomAlarm);
  },
}));