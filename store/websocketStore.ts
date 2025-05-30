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
            console.log(message.device_content,"消息推送");
            if(message.device_content){
              // 直接设置新的状态，不需要保留之前的状态
              set({ WS_SmartLight_Data: message.device_content });   
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
