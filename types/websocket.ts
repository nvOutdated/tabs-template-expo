import { WebSocketMessage } from "@/utils/websocket";

// WebSocket 消息类型枚举
export enum MessageType {
  SINGLE_CONTROL_RESP = "singleControlResp",
  DATA_CHANGE = "dataChange",
  WARNING = "warning",
  ONLINE = "online",
  OFFLINE = "offline",
  CENTRAL_PARAMS_RESP='centralParamsResp',
  SINGLE_DATETIME_RESP='singleDatetimeResp',
  SWITCH_AUTO_RESP='switchAutoResp',
  DETECT_DATETIME_PARAMS_RESP='detectDatetimeParamsResp',
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
  WS_CentralParamsResp_Data: CentralParamsRespData | null;
  WS_SingleDatetimeResp_Data: SingleDatetimeRespData | null;
  WS_SwitchAutoResp_Data: SwitchAutoRespData | null;
  WS_DetectDatetimeParamsResp_Data: DetectDatetimeParamsRespData | null;
  init: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

// 集中器数据接口
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

//检测集中器参数
export interface CentralParamsRespData{
  data?:{
    auto?:boolean,
    lamp_timeout?:number,
    lamp_retry?:number,
    lamp_circle_no?:number,
  },
  description?:string,
  deviceName?:string,
  did?:number,
  type?:string,
  productID?:string,
  sn?:string
}

//集中器时间
export interface SingleDatetimeRespData{
  data?:{
    dateTime?:string, 
  },
  description?:string,
  deviceName?:string,
  did?:number,
  type?:string,
  productID?:string,
  sn?:string
}

//手自动切换
export interface SwitchAutoRespData{
  data?:{
    auto?:boolean,
  },
  description?:string,
  deviceName?:string,
  did?:number,
  type?:string,
  productID?:string,
  sn?:string
}

//校时
export interface DetectDatetimeParamsRespData{
  data?:{
    dateTime?:string,
    enabledAlways?:boolean,
    enabledWeekly?:boolean,
    enabledLocation?:boolean,
    enabledMultiple?:boolean,
    enabledOneByOne?:boolean,
  },
  description?:string,
  deviceName?:string,
  did?:number,
  type?:string,
  productID?:string,
  sn?:string
}


