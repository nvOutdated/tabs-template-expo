import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const currentTheme = useCurrentTheme();

    const handleLogout = () => {
        router.replace('/is-login');
    };

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.drawerBg, padding: 20, alignItems: 'center' }}>
            <View className='flex-1 justify-center items-center'>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#ff4d4f',
                        padding: 15,
                        borderRadius: 8,
                        alignItems: 'center',

                    }}
                    onPress={handleLogout}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>退出信息采集系统</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
