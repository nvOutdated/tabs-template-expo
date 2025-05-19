import { useRunLogStore } from '@/store/runlogStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const AlarmBadge: React.FC = () => {
  const { unreadCount } = useRunLogStore();

  if (unreadCount === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -18,
    backgroundColor: '#ff4d4f',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
}); 