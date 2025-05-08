import { useWebSocketStore } from "@/store/websocketStore";
import { useEffect } from "react";
import { Button, Text, View } from "react-native";

export default function WebSocketExample() {
  // 从store中获取WebSocket状态和方法
  const { 
    isConnected, 
    smartLight, 
    init, 
    disconnect, 
    sendMessage 
  } = useWebSocketStore();

  // 组件挂载时初始化WebSocket连接
  useEffect(() => {
    // 初始化WebSocket连接
    init();

    // 组件卸载时断开连接
    return () => {
      disconnect();
    };
  }, []);

  // 发送心跳消息的示例
  const handleSendHeartbeat = () => {
    sendMessage("KEEPALIVE");
  };

  return (
    <View className="p-4">
      {/* 显示连接状态 */}
      <View className="mb-4">
        <Text className="text-lg">
          连接状态: {isConnected ? "已连接" : "未连接"}
        </Text>
      </View>

      {/* 显示接收到的数据 */}
      <View className="mb-4">
        <Text className="text-lg">接收到的数据:</Text>
        <Text className="mt-2">
          {JSON.stringify(smartLight, null, 2)}
        </Text>
      </View>

      {/* 操作按钮 */}
      <View className="flex-row space-x-4">
        <Button 
          title="发送心跳" 
          onPress={handleSendHeartbeat}
          disabled={!isConnected}
        />
        <Button 
          title={isConnected ? "断开连接" : "重新连接"} 
          onPress={isConnected ? disconnect : init}
        />
      </View>
    </View>
  );
} 