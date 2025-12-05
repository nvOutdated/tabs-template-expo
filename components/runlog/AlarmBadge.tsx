import { useRunLogStore } from '@/store/runlogStore';
import React from 'react';
import { Text, View } from 'react-native';

export const AlarmBadge: React.FC = () => {
  const { unreadCount } = useRunLogStore();

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-[18px] bg-error-500 rounded-full min-w-[18px] h-[18px] justify-center items-center px-1">
      <Text className="text-white text-xs font-medium">
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};