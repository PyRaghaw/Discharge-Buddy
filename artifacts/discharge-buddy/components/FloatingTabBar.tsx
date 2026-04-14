import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const isWeb = Platform.OS === "web";
const theme = colors.light;

const PINK = theme.primary;
const FAB_COLOR = "#fb2c67";

const webShadow = (color: string, blur: number, y: number, opacity: number) =>
  isWeb
    ? { boxShadow: `0px ${y}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }
    : {
        shadowColor: color,
        shadowOffset: { width: 0, height: y },
        shadowOpacity: opacity,
        shadowRadius: blur,
        elevation: blur,
      };

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface TabRoute {
  name: string;
  title: string;
  icon: FeatherIconName;
}

interface FabAction {
  icon: FeatherIconName;
  label: string;
  route: string;
  color: string;
}

const FAB_ACTIONS: FabAction[] = [
  { icon: "camera", label: "Scan Rx", route: "/scan", color: "#fb2c67" },
  { icon: "book-open", label: "Journal", route: "/journal", color: "#ec4899" },
  { icon: "heart", label: "Emergency", route: "/emergency-card", color: "#e11d48" },
];

interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const bottomPad = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 8);

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(fabAnim, {
        toValue,
        useNativeDriver: !isWeb,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(overlayAnim, {
        toValue,
        duration: 200,
        useNativeDriver: !isWeb,
      }),
    ]).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    Animated.parallel([
      Animated.spring(fabAnim, { toValue: 0, useNativeDriver: !isWeb }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 150, useNativeDriver: !isWeb }),
    ]).start();
    setFabOpen(false);
  };

  const handleFabAction = (route: string) => {
    closeFab();
    setTimeout(() => router.push(route as any), 100);
  };

  const fabRotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const visibleRoutes = state.routes
    .map((route: any, index: number) => ({ route, index }))
    .filter((item: any) => descriptors[item.route.key].options.tabBarIcon !== undefined);

  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const renderTab = (item: { route: any; index: number }) => {
    const { route, index: actualIndex } = item;
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const isFocused = state.index === actualIndex;
    const color = isFocused ? PINK : "#94a3b8";

    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
          {options.tabBarIcon?.({ color, size: 22 })}
        </View>
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Dim overlay when FAB is open */}
      {fabOpen && (
        <Pressable onPress={closeFab} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayAnim }]}
            pointerEvents={fabOpen ? "auto" : "none"}
          />
        </Pressable>
      )}

      {/* FAB action buttons */}
      {FAB_ACTIONS.map((action, i) => {
        const angle = -90 + (i - 1) * 50;
        const rad = (angle * Math.PI) / 180;
        const dist = 90;
        const tx = fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(rad) * dist],
        });
        const ty = fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(rad) * dist],
        });
        const scale = fabAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
        });
        const opacity = fabAnim.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View
            key={action.label}
            style={[
              styles.fabAction,
              {
                bottom: bottomPad + 52,
                transform: [{ translateX: tx }, { translateY: ty }, { scale }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleFabAction(action.route)}
              style={[styles.fabActionBtn, { backgroundColor: action.color }, webShadow("#000", 8, 4, 0.2)]}
              activeOpacity={0.85}
            >
              <Feather name={action.icon} size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fabActionLabel}>{action.label}</Text>
          </Animated.View>
        );
      })}

      {/* Tab bar */}
      <View style={[styles.container, { paddingBottom: bottomPad }]}>
        <View style={[styles.pill, webShadow("#000", 24, 8, 0.12)]}>
          {/* Left tabs */}
          <View style={styles.tabGroup}>
            {leftRoutes.map((item: any) => renderTab(item))}
          </View>

          {/* Center FAB */}
          <View style={styles.fabWrap}>
            <TouchableOpacity onPress={toggleFab} activeOpacity={0.9} style={[styles.fab, webShadow(FAB_COLOR, 12, 6, 0.45)]}>
              <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                <Feather name="plus" size={26} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Right tabs */}
          <View style={styles.tabGroup}>
            {rightRoutes.map((item: any) => renderTab(item))}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: "100%",
    maxWidth: 400,
  },
  tabGroup: {
    flex: 1,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 3,
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: `${PINK}15`,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  fabWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FAB_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  fabAction: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    left: "50%",
    marginLeft: -24,
  },
  fabActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fabActionLabel: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
