import { SERVER_ADDRESSES } from "@/constants/defaultConfig"
import { useGlobalStore } from "@/store/globalStateStore"
import { saveAccessAddress, saveToken, saveUserInfo, useAccessAddressState } from "@/utils/useStorageState"
import { useRouter } from "expo-router"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

export default function ChangeIp() {
    const [currentAddress, setCurrentAddress] = useAccessAddressState()
    const router = useRouter()
    const setCurrentServer = useGlobalStore(state => state.setCurrentServer)

    const handleChangeIp = async (address: string) => {
        const newServer = SERVER_ADDRESSES.find(s => s.name === address) || SERVER_ADDRESSES[2]
        await saveAccessAddress(address)
        setCurrentServer(newServer)
        // 清除token和用户信息
        await saveToken(null)
        await saveUserInfo(null)
        // 返回登录页
        router.replace("/is-login")
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-lg font-bold mb-4">选择服务器地址</Text>
                {SERVER_ADDRESSES.map((server) => (
                    <TouchableOpacity
                        key={server.name}
                        className={`p-4 mb-2 rounded-lg border ${
                            currentAddress[1] === server.name
                                ? "bg-blue-100 border-blue-500"
                                : "bg-gray-50 border-gray-200"
                        }`}
                        onPress={() => handleChangeIp(server.name)}
                    >
                        <Text className="font-medium">{server.name}</Text>
                        <Text className="text-gray-600">IP: {server.ip}</Text>
                        <Text className="text-gray-600">HTTP端口: {server.httpPort}</Text>
                        <Text className="text-gray-600">WS端口: {server.wsPort}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    )
}