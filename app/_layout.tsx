import { ThemeProvider } from '@/components/ui/gluestack-ui-provider/ThemeProvider';
import "@/global.css";
import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    // <GluestackUIProvider mode="light">
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
      >
        <Stack.Screen name="is-login" options={{ headerShown: false }} />
        <Stack.Screen name="(logging-in)" options={{ headerShown: false }} />
      </Stack>
      </ThemeProvider>
    // </GluestackUIProvider>
  );
}
