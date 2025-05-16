import { getAccessAddress } from "@/utils/useStorageState";

export interface ServerAddress {
  name: string;
  ip: string;
  httpPort: string;
  wsPort: string;
}

export const SERVER_ADDRESSES: ServerAddress[] = [
  { name: "本地180", ip: "192.168.1.180", httpPort: "48099", wsPort: "38400" },
  { name: "本地197", ip: "192.168.1.197", httpPort: "38099", wsPort: "38400" },
  { name: "吉安", ip: "182.99.177.29", httpPort: "48099", wsPort: "38400" }
];

export const getBaseUrl = async (): Promise<string> => {
  const cachedAddress = await getAccessAddress();
  const server = SERVER_ADDRESSES.find(s => s.name === cachedAddress) || SERVER_ADDRESSES[0];
  return `http://${server.ip}:${server.httpPort}`;
};

export const getBaseWs = async (): Promise<string> => {
  const cachedAddress = await getAccessAddress();
  const server = SERVER_ADDRESSES.find(s => s.name === cachedAddress) || SERVER_ADDRESSES[0];
  return `ws://${server.ip}:${server.wsPort}`;
};

// 为了向后兼容，保留这些常量，但标记为已废弃
/** @deprecated 请使用 getBaseUrl() 替代 */
export const DEFAULT_BASE_URL: string = `http://${SERVER_ADDRESSES[0].ip}:${SERVER_ADDRESSES[0].httpPort}`;

/** @deprecated 请使用 getBaseWs() 替代 */
export const DEFAULT_BASE_WS: string = `ws://${SERVER_ADDRESSES[0].ip}:${SERVER_ADDRESSES[0].wsPort}`;

//http://192.168.1.197:38099  本地197
//http://192.168.1.180:48099 本地180
//'http://182.99.177.29:48099' 吉安
//