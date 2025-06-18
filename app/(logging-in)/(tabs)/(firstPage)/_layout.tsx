import FirstPageComponent from '@/components/firstPage/FirstPageComponent';
import { CustomHeader } from '@/components/public/CustomHeader';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function CameraLayout() {
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="First Page" />
      <View style={{ flex: 1 }}>
        <FirstPageComponent />
      </View>
    </View>
  );
}

