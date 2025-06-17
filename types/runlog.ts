export interface AlarmMessage {
  id: string;
  type: 'alarm' | 'warning' | 'info';
  title: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  module: string;
  status: 'pending' | 'processing' | 'completed';
  sn: string;
  deviceName: string;
  data: {
    phase3Voltage: number[];
    phase3Electric: number[];
    power: number;
    dateTime: string;
    powerOff: string;
    powerOn: string;
    loops: boolean[];
    ios: boolean[];
    enabledWeekly: boolean;
    enabledAlways: boolean;
    enabledLocation: boolean;
    enabledMultiple: boolean;
    enabledLight: boolean;
    enabledWater: boolean;
    enabledOneByOne: boolean;
    mode: string;
    optTime: string;
    eventType: string;
    reportTime: string;
    description: string;
    warn: boolean;
  };
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