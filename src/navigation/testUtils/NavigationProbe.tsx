import React, { useEffect } from 'react';
import { Text } from 'react-native';
import {
  useIsFocused,
  useNavigation,
  useRoute,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const probes = new Map<
  string,
  {
    route: RouteProp<ParamListBase>;
    navigation: NativeStackNavigationProp<ParamListBase>;
    focused: boolean;
  }
>();

// Replace screen content only: routing, focus, keys, stacks and tab UI stay real.
export function NavigationProbe() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const focused = useIsFocused();
  probes.set(route.key, { route, navigation, focused });
  useEffect(
    () => () => {
      probes.delete(route.key);
    },
    [route.key],
  );
  return <Text testID={`screen-${route.name}`}>{route.name}</Text>;
}

export function focusedProbe() {
  const focused = [...probes.values()].filter(probe => probe.focused);
  expect(focused).toHaveLength(1);
  return focused[0];
}
