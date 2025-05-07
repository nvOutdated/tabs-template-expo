import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { config } from './config';

export type ModeType = 'light' | 'dark' | 'blue' | 'yellow' | 'pink' | 'green';

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  // useEffect(() => {
  //   if (mode !== 'system') {
  //     setColorScheme(mode);
  //     console.log(mode,colorScheme,"当前主题");
      
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mode]);

  return (
    <View
      style={[
        config[mode],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
