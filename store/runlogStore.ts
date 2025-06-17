import { AlarmMessage, LogEntry, RunLogState } from '@/types/runlog';
import { create } from 'zustand';

const MAX_UNREAD_COUNT = 99;

// 生成唯一ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
export const useRunLogStore = create<RunLogState & {
  addAlarm: (alarm: Omit<AlarmMessage, 'id' | 'isRead' | 'timestamp'>) => void;
  markAlarmAsRead: (id: string) => void;
  markAllAlarmsAsRead: () => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
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
      const newAlarms = [ newAlarm,...state.alarms];
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
}));