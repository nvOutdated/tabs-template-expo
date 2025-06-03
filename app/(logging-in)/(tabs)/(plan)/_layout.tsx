import { CustomHeader } from '@/components/public/CustomHeader';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import PersonalCenterScreen from './index';

export default function CameraLayout() {
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Camera" />
      <View style={{ flex: 1 }}>
        <PersonalCenterScreen />
      </View>
    </View>
  );
}

