export interface AlarmMessage {
  id: string;
  type: 'alarm' | 'warning' | 'info';
  title: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  module: string;
}

export interface LogEntry {
  id: string;
  type: 'error' | 'warning' | 'info' | 'debug';
  module: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface RunLogState {
  alarms: AlarmMessage[];
  unreadCount: number;
  logs: LogEntry[];
} 