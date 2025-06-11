import {
  MessageHandler,
  MessageQueue,
  MessageType,
  WebSocketState
} from "@/types/websocket";
import { WebSocketMessage, websocketManager } from "@/utils/websocket";
import { create } from "zustand";

// 添加节流函数
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// 添加防抖函数
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }
};

// 创建消息队列
const messageQueue: MessageQueue = {
  messages: [],
  isProcessing: false
};

// 创建消息处理器
const createMessageHandlers = (set: any): MessageHandler[] => [
  {
    type: MessageType.SINGLE_CONTROL_RESP,
    handle: (message: WebSocketMessage) => {
      set({ WS_SingleControlResp_Data: message.device_content });
    }
  },
  {
    type: MessageType.DATA_CHANGE,
    handle: (message: WebSocketMessage) => {
      set({ WS_SmartLight_Data: message.device_content });
    }
  },
  {
    type: MessageType.WARNING,
    handle: (message: WebSocketMessage) => {
      set({ WS_SmartLight_Data: message.device_content });
    }
  },
  {
    type: MessageType.ONLINE,
    handle: (message: WebSocketMessage) => {
      set({ WS_SmartLight_Data: message.device_content });
    }
  },
  {
    type: MessageType.OFFLINE,
    handle: (message: WebSocketMessage) => {
      set({ WS_SmartLight_Data: message.device_content });
    }
  }
];

// 处理消息队列的函数
const processMessageQueue = async (handlers: MessageHandler[]) => {
  if (messageQueue.isProcessing || messageQueue.messages.length === 0) return;
  messageQueue.isProcessing = true;
  try {
    while (messageQueue.messages.length > 0) {
      const message = messageQueue.messages.shift();
      const deviceContent = message?.device_content;
      
      if (message?.service_name === "smart-light" && 
          message?.message_type === "device" && 
          deviceContent && 
          typeof deviceContent === 'object' &&
          'type' in deviceContent) {
        const handler = handlers.find(h => h.type === deviceContent.type);
        if (handler) {
          handler.handle(message);
        }
      }
      // 添加小延迟，避免处理过快
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  } catch (error) {
    console.error('处理消息队列时出错:', error);
  } finally {
    messageQueue.isProcessing = false;
  }
};

export const useWebSocketStore = create<WebSocketState>((set) => {
  // 创建消息处理器
  const handlers = createMessageHandlers(set);
  
  // 使用节流包装消息处理函数
  const throttledProcessQueue = throttle(() => processMessageQueue(handlers), 100);

  return {
    isConnected: false,
    error: null,
    WS_SmartLight_Data: null,
    WS_SingleControlResp_Data: null,

    init: () => {
      websocketManager.reset();

      websocketManager.addStatusHandler((isConnected) => {
        set({ isConnected });
      });

      // 使用节流处理的消息处理器
      const messageHandler = (message: WebSocketMessage) => {
        messageQueue.messages.push(message);
        throttledProcessQueue();
      };
     
      websocketManager.addMessageHandler(messageHandler);
      websocketManager.init();
    },

    disconnect: () => {
      websocketManager.disconnect();
      websocketManager.reset();
      set({ isConnected: false, error: null, WS_SmartLight_Data: null });
      // 清空消息队列
      messageQueue.messages = [];
      messageQueue.isProcessing = false;
    },

    sendMessage: (message: string) => {
      websocketManager.send(message);
    },
  };
});
