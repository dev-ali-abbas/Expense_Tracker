import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Car,
  Fuel,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Home,
  Smartphone,
  User,
  MoreHorizontal,
  LucideIcon,
  Tag,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Car,
  Fuel,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Home,
  Smartphone,
  User,
  MoreHorizontal,
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  containerSize?: number;
  backgroundColor?: string;
}

export function CategoryIcon({
  icon,
  color,
  size = 20,
  containerSize = 40,
  backgroundColor,
}: CategoryIconProps) {
  const IconComponent = ICON_MAP[icon] || Tag;
  const bg = backgroundColor || `${color}1A`; // 10% opacity

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <IconComponent size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
