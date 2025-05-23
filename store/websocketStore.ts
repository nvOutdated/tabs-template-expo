import { WebSocketMessage, websocketManager } from "@/utils/websocket";
import { create } from "zustand";

interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  smartLight: {
    did?:number|null;
    [key: string]: any;
  };
  init: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  isConnected: false,
  error: null,
  smartLight: {did:null},
  
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
            if(message.device_content?.type==='dataChange'){
              set({ smartLight: message.device_content || {} });   
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
    set({ isConnected: false, error: null, smartLight: {} });
  },

  // 发送消息
  sendMessage: (message: string) => {
    websocketManager.send(message);
  },
}));
