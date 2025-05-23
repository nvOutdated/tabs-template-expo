import { getBaseWs } from "@/constants/defaultConfig";
import { getCurrentBaseWs } from "@/store/globalStateStore";
import { getToken } from "@/utils/useStorageState";
// const DEFAULT_BASE_WS = getBaseWs()
export interface WebSocketMessage {
  code: number;
  service_name: string;
  device_content: {
    type:string;
    did:number;
    sn:string;
  }|null;
  level: string;
  message_type: string;
  system_content: object | null;

}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private retries = 0;
  private maxRetries = 5;
  private timer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly RECONNECT_INTERVAL = 3000;
  private readonly HEARTBEAT_INTERVAL = 10000;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private statusHandlers: ((isConnected: boolean) => void)[] = [];

  public init() {
    this.initWebSocket();
  }
  
  private async getWebSocketUrl(): Promise<string> {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return await getBaseWs();
  }

  private async initWebSocket() {
    try {
      const token = await getToken();
      if (!token) {
        console.log("[WebSocket] 未登录，无法建立连接");
        return;
      }
      console.log("实例化websocket");
      this.ws = new WebSocket(getCurrentBaseWs());
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.log("[WebSocket] 初始化连接失败:", error);
      this.handleError(error);
    }
  }

  private async handleOpen() {
    console.log("[WebSocket] 连接已建立,等待token验证...");
    if (this.ws) {
      const token = await getToken();
      if (token) {
        this.ws.send(token);
      }
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      // console.log("[WebSocket] 收到消息:", message);

      if (message.code === 200) {
        this.retries = 0;
        this.startHeartbeat();
        this.notifyStatusChange(true);
      }

      // 通知所有消息处理器
      this.messageHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.log("[WebSocket] 消息处理错误:", error);
    }
  }

  private handleError(error: any) {
    console.log("[WebSocket] 连接错误:", error);
    this.notifyStatusChange(false);
    
    if (this.retries < this.maxRetries) {
      this.retries++;
      this.reconnectTimer = setTimeout(() => {
        console.log(`[WebSocket] 第${this.retries}次重连...`);
        this.initWebSocket();
      }, this.RECONNECT_INTERVAL) as unknown as NodeJS.Timeout;
    } else {
      console.log("[WebSocket] 重连超过最大次数，已停止重连");
      this.cleanup();
    }
  }

  private handleClose(event: CloseEvent) {
    console.log("[WebSocket] 连接已断开:", event);
    this.notifyStatusChange(false);
    this.cleanup();
  }

  private startHeartbeat() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.send("KEEPALIVE");
    }, this.HEARTBEAT_INTERVAL) as unknown as NodeJS.Timeout;
  }

  private cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.log("[WebSocket] 发送消息失败，未连接");
    }
  }

  public addMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public addStatusHandler(handler: (isConnected: boolean) => void) {
    this.statusHandlers.push(handler);
  }

  public removeStatusHandler(handler: (isConnected: boolean) => void) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
  }

  private notifyStatusChange(isConnected: boolean) {
    this.statusHandlers.forEach(handler => handler(isConnected));
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.cleanup();
  }

  public reset() {
    // 清理所有状态
    this.cleanup();
    this.retries = 0;
    this.messageHandlers = [];
    this.statusHandlers = [];
  }
}

// 创建单例实例
export const websocketManager = new WebSocketManager();
