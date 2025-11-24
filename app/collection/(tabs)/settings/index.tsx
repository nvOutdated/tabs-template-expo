import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const currentTheme = useCurrentTheme();

    const handleLogout = () => {
        router.replace('/is-login');
    };

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.drawerBg, padding: 20 }}>
            <TouchableOpacity
                style={{
                    backgroundColor: '#ff4d4f',
                    padding: 15,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 20
                }}
                onPress={handleLogout}
            >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>退出登录</Text>
            </TouchableOpacity>
        </View>
    );
}
