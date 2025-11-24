import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Text, View } from 'react-native';

export default function AreaScreen() {
    const currentTheme = useCurrentTheme();

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.drawerBg, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: currentTheme.textColor }}>区域管理 (开发中)</Text>
        </View>
    );
}
