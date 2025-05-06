import { getToken } from '@/utils/useStorageState';
import { create } from 'zustand';

interface WebSocketMessage {
  service_name: string;
  device_content:object|null;
  level:string;
  message_type:string;
  system_content: object|null;
}

interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  socket: WebSocket | null;
  // 按 type 分类的消息状态
  // notify: any[];
  // alarm: any[];
  // update: any[];
  smartLight:object;
  // ...可扩展更多类型
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

const WEBSOCKET_URL = 'ws://182.99.177.29:38400/cvgWs';
const RECONNECT_INTERVAL = 5000; // 5秒重连一次
const HEARTBEAT_INTERVAL = 15000; // 15秒发一次心跳
const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数

let reconnectTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  error: null,
  socket: null,
  // notify: [],
  // alarm: [],
  // update: [],
  smartLight:{},
  // ...可扩展更多类型

  connect: async () => {
    const token = await getToken();
    if (!token) {
      set({ error: new Error('未登录，无法建立WebSocket连接') });
      console.log('[WebSocket] 未登录，无法建立连接');
      return;
    }
    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}`); // 不在URL上传token
      console.log('[WebSocket] 尝试建立连接...');

      ws.onopen = () => {
        set({ isConnected: true, socket: ws, error: null });
        reconnectAttempts = 0; // 连接成功重置重连次数
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        // 连接建立后立即发送token
        console.log(token);
        
        ws.send(token);
        console.log('[WebSocket] 连接已建立，已发送token');
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          get().sendMessage('KEEPALIVE');
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        switch (message.service_name) {
          // case 'notify':
          //   set((state) => ({ notify: [...state.notify, message.data] }));
          //   break;
          // case 'alarm':
          //   set((state) => ({ alarm: [...state.alarm, message.data] }));
          //   break;
          // case 'update':
          //   set((state) => ({ update: [...state.update, message.data] }));
          //   break;
          case 'smart-light':
            // console.log(message.system_content);
            set({smartLight:message.system_content || {}})
            break;
          default:
            break;
        }
      };

      ws.onerror = (e) => {
        set({ error: new Error('WebSocket连接错误') });
        console.log('[WebSocket] 连接错误', e);
      };

      ws.onclose = () => {
        set({ isConnected: false, socket: null });
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        console.log('[WebSocket] 连接已断开');
        // 自动重连，限制最大次数
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              console.log(`[WebSocket] 第${reconnectAttempts}次重连...`);
              get().connect();
            }, RECONNECT_INTERVAL);
          }
        } else {
          set({ error: new Error('WebSocket重连超过最大次数，已停止重连') });
          console.log('[WebSocket] 重连超过最大次数，已停止重连');
        }
      };
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('连接失败') });
      console.log('[WebSocket] 连接异常', error);
      // 连接失败也尝试重连，限制最大次数
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log(`[WebSocket] 第${reconnectAttempts}次重连...`);
            get().connect();
          }, RECONNECT_INTERVAL);
        }
      } else {
        set({ error: new Error('WebSocket重连超过最大次数，已停止重连') });
        console.log('[WebSocket] 重连超过最大次数，已停止重连');
      }
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ isConnected: false, socket: null, error: null });
      console.log('[WebSocket] 主动断开连接');
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    reconnectAttempts = 0;
  },

  sendMessage: (message: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      set({ error: new Error('WebSocket未连接') });
      console.log('[WebSocket] 发送消息失败，未连接');
    }
  },
}));