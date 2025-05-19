import AlarmList from '@/components/runlog/AlarmList';
import { View } from 'react-native';

export default function AlarmScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AlarmList />
    </View>
  );
}