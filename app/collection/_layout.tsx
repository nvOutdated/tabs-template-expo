import { useCurrentTheme } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CollectionLayout() {
  const currentTheme = useCurrentTheme();
  const insets = useSafeAreaInsets();

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          contentStyle: { paddingBottom: insets.bottom }
        }}
      />
      <Stack.Screen
        name="(modal)"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}
