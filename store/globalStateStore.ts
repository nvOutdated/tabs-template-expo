import { SERVER_ADDRESSES } from '@/constants/defaultConfig'
import { getAccessAddress } from '@/utils/useStorageState'
import { create } from 'zustand'

interface GlobalState {
    currentServer: typeof SERVER_ADDRESSES[0] | null
    setCurrentServer: (server: typeof SERVER_ADDRESSES[0]) => void
    initializeServer: () => Promise<void>
}

export const useGlobalStore = create<GlobalState>((set) => ({
    currentServer: null,
    setCurrentServer: (server) => set({ currentServer: server }),
    initializeServer: async () => {
        const cachedAddress = await getAccessAddress()
        const server = SERVER_ADDRESSES.find(s => s.name === cachedAddress) || SERVER_ADDRESSES[2]
        set({ currentServer: server })
    }
}))

// 导出一个同步获取当前服务器地址的函数
export const getCurrentServer = () => {
    const store = useGlobalStore.getState()
    return store.currentServer || SERVER_ADDRESSES[2]
}

// 导出一个同步获取当前服务器URL的函数
export const getCurrentBaseUrl = () => {
    const server = getCurrentServer()
    return `http://${server.ip}:${server.httpPort}`
}

// 导出一个同步获取当前服务器WebSocket URL的函数
export const getCurrentBaseWs = () => {
    const server = getCurrentServer()
    return `ws://${server.ip}:${server.wsPort}`
} 