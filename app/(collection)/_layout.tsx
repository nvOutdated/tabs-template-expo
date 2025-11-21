import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Stack } from 'expo-router';

export default function CollectionLayout() {
  const currentTheme = useCurrentTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.drawerBg,
        },
        headerTintColor: currentTheme.activeTint,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: currentTheme.drawerBg,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '采集系统',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          title: '设备详情',
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
