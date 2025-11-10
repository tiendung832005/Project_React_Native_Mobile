import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabIconWithBadgeProps {
  name: string;
  focusedName?: string;
  color: string;
  size?: number;
  focused?: boolean;
  badgeCount?: number;
  showBadgeDot?: boolean;
}

export const TabIconWithBadge: React.FC<TabIconWithBadgeProps> = ({
  name,
  focusedName,
  color,
  size = 24,
  focused = false,
  badgeCount = 0,
  showBadgeDot = false,
}) => {
  const iconName = focused && focusedName ? focusedName : name;
  const showBadge = badgeCount > 0 || showBadgeDot;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName as any} size={size} color={color} />
      {showBadge && (
        <View style={styles.badgeContainer}>
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          ) : (
            <View style={styles.badgeDot} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  badge: {
    backgroundColor: '#FF3040',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3040',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});

