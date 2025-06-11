import { WebSocketMessage } from "@/utils/websocket";

// WebSocket 消息类型枚举
export enum MessageType {
  SINGLE_CONTROL_RESP = "singleControlResp",
  DATA_CHANGE = "dataChange",
  WARNING = "warning",
  ONLINE = "online",
  OFFLINE = "offline"
}

// 消息处理器接口
export interface MessageHandler {
  type: MessageType;
  handle: (message: WebSocketMessage) => void;
}

// 消息队列接口
export interface MessageQueue {
  messages: WebSocketMessage[];
  isProcessing: boolean;
}

// WebSocket 状态接口
export interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  WS_SmartLight_Data: SmartLightData | null;
  WS_SingleControlResp_Data: SingleControlRespData | null;
  init: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

// 智能灯数据接口
export interface SmartLightData {
  type?: string;
  did?: number;
  sn?: string;
  deviceName?: string;
  data?: {
    phase3Voltage?: number[];
    phase3Electric?: number[];
    power?: number;
    dateTime?: string;
    powerOff?: string;
    powerOn?: string;
    loops?: boolean[];
    ios?: boolean[];
    enabledWeekly?: boolean;
    enabledAlways?: boolean;
    enabledLocation?: boolean;
    enabledMultiple?: boolean;
    enabledLight?: boolean;
    enabledWater?: boolean;
    enabledOneByOne?: boolean;
    mode?: string;
    optTime?: string;
    eventType?: string;
    reportTime?: string;
    description?: string;
    warn?: boolean;
    dateTimeMillis?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// 单控响应数据接口
export interface SingleControlRespData {
  data?: {
    comm?: "COMM_NORMAL" | "COMM_GROUP" | "COMM_BROADCAST";
    dimming?: number;
    enabledA?: boolean;
    enabledB?: boolean;
    group?: number;
    id?: string;
    method?: "MD_ON" | "MD_OFF" | "MD_DIM" | "MD_DETECT";
    stateA?: "SINGLE_STATE_OFF" | "SINGLE_STATE_ON" | "SINGLE_STATE_WAIT" | 'SINGLE_STATE_ERR';
    stateB?: "SINGLE_STATE_OFF" | "SINGLE_STATE_ON" | "SINGLE_STATE_WAIT" | 'SINGLE_STATE_ERR';
  };
  description?: string | null;
  deviceName?: string;
  did?: number;
  productID?: string;
  sn?: string;
} 