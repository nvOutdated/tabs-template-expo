import { WebSocketMessage, websocketManager } from "@/utils/websocket";
import { create } from "zustand";

interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  WS_SmartLight_Data: {
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
  } | null;
  init: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

// 比较两个对象是否相同（忽略 dateTime, dateTimeMillis 和 reportTime）
const isDataEqual = (oldData: any, newData: any): boolean => {
  if (!oldData || !newData) return false;
  
  // 比较基本属性
  if (oldData.type !== newData.type ||
      oldData.did !== newData.did ||
      oldData.sn !== newData.sn ||
      oldData.deviceName !== newData.deviceName) {
    return false;
  }

  // 比较 data 对象中的属性（忽略 dateTime, dateTimeMillis 和 reportTime）
  const oldDataObj = oldData.data || {};
  const newDataObj = newData.data || {};

  // 比较数组类型的属性
  if (!arraysEqual(oldDataObj.phase3Voltage, newDataObj.phase3Voltage) ||
      !arraysEqual(oldDataObj.phase3Electric, newDataObj.phase3Electric) ||
      !arraysEqual(oldDataObj.loops, newDataObj.loops) ||
      !arraysEqual(oldDataObj.ios, newDataObj.ios)) {
    return false;
  }

  // 比较布尔值类型的属性
  if (oldDataObj.enabledWeekly !== newDataObj.enabledWeekly ||
      oldDataObj.enabledAlways !== newDataObj.enabledAlways ||
      oldDataObj.enabledLocation !== newDataObj.enabledLocation ||
      oldDataObj.enabledMultiple !== newDataObj.enabledMultiple ||
      oldDataObj.enabledLight !== newDataObj.enabledLight ||
      oldDataObj.enabledWater !== newDataObj.enabledWater ||
      oldDataObj.enabledOneByOne !== newDataObj.enabledOneByOne ||
      oldDataObj.warn !== newDataObj.warn) {
    return false;
  }

  // 比较字符串类型的属性（忽略 reportTime）
  if (oldDataObj.powerOff !== newDataObj.powerOff ||
      oldDataObj.powerOn !== newDataObj.powerOn ||
      oldDataObj.mode !== newDataObj.mode ||
      oldDataObj.optTime !== newDataObj.optTime ||
      oldDataObj.eventType !== newDataObj.eventType ||
      oldDataObj.description !== newDataObj.description) {
    return false;
  }

  // 比较数值类型的属性（忽略 dateTimeMillis）
  if (oldDataObj.power !== newDataObj.power) {
    return false;
  }

  return true;
};

// 辅助函数：比较两个数组是否相同
const arraysEqual = (a: any[] | undefined, b: any[] | undefined): boolean => {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

export const useWebSocketStore = create<WebSocketState>((set) => ({
  isConnected: false,
  error: null,
  WS_SmartLight_Data: null,
  
  // 初始化WebSocket连接
  init: () => {
    // 先重置之前的连接
    websocketManager.reset();
    
    // 添加状态变化处理器
    websocketManager.addStatusHandler((isConnected) => {
      set({ isConnected });
    });

    // 添加消息处理器
    websocketManager.addMessageHandler((message: WebSocketMessage) => {
      // console.log(message,"消息推送");
      
      switch (message.service_name) {
        case "smart-light":
          if(message.message_type==='device'){
            // console.log(message.device_content,"消息推送");
            if(message.device_content){
              // 获取当前状态
              const currentState = useWebSocketStore.getState();
              const currentData = currentState.WS_SmartLight_Data;
              
              // 只有当数据真正发生变化时才更新状态
              if (!isDataEqual(currentData, message.device_content)) {
                console.log("值发生变化");
                
                set({ WS_SmartLight_Data: message.device_content });
              }
            }
            
            // console.log(message);

          }
          break;
        default:
          break;
      }
    });

    // 初始化新的连接
    websocketManager.init();
  },

  // 断开连接
  disconnect: () => {
    websocketManager.disconnect();
    websocketManager.reset();
    set({ isConnected: false, error: null, WS_SmartLight_Data: null });
  },

  // 发送消息
  sendMessage: (message: string) => {
    websocketManager.send(message);
  },
}));
