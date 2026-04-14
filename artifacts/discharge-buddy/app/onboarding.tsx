import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

const RADIUS = 110;
const RADIUS_DIAM = RADIUS * 2 + 52;

const TEAL = "#0891b2";
const TEAL_LIGHT = "#e0f2fe";
const TEAL_DARK = "#0e7490";
const WHITE = "#ffffff";

const SLIDES = [
  {
    id: "1",
    accentColor: "#0891b2",
    bgColor: "#0c4a6e",
    title: "Your Recovery,\nSimplified",
    subtitle:
      "DischargeBuddy turns complex hospital discharge papers into a clear, manageable daily plan tailored just for you.",
  },
  {
    id: "2",
    accentColor: "#0891b2",
    bgColor: "#164e63",
    title: "Never Miss\nA Dose",
    subtitle:
      "Smart reminders at exactly the right time. Scan your prescription and we build your medicine schedule automatically.",
  },
  {
    id: "3",
    accentColor: "#0891b2",
    bgColor: "#0f3460",
    title: "Caregiver\nSupport",
    subtitle:
      "Family members can monitor your recovery, get instant alerts on missed doses, and respond to emergencies remotely.",
  },
];

// ─── Floating Pill ─────────────────────────────────────────────────────────
function FloatingPill({
  x,
  y,
  label,
  color,
  delay = 0,
  size = 42,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  delay?: number;
  size?: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: "absolute",
    left: x,
    top: y,
  }));

  return (
    <Animated.View style={style}>
      <View style={[styles.pillChip, { backgroundColor: `${color}25`, borderColor: `${color}60` }]}>
        <View style={[styles.pillDot, { backgroundColor: color }]} />
        <Text style={[styles.pillLabel, { color: WHITE }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Slide 1 Visual ─────────────────────────────────────────────────────────
function Slide1Visual() {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 18000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.visualContainer}>
      {/* Orbit ring */}
      <Animated.View style={[styles.orbitRing, orbitStyle]}>
        <View style={[styles.orbitDot, { backgroundColor: "#22d3ee", top: -8, left: "50%" }]} />
        <View style={[styles.orbitDot, { backgroundColor: "#67e8f9", bottom: -8, left: "50%" }]} />
        <View style={[styles.orbitDot, { backgroundColor: "#a5f3fc", left: -8, top: "50%" }]} />
        <View style={[styles.orbitDot, { backgroundColor: "#cffafe", right: -8, top: "50%" }]} />
      </Animated.View>

      {/* Central icon */}
      <View style={styles.centralIconOuter}>
        <View style={styles.centralIconInner}>
          <Animated.View style={heartStyle}>
            <Feather name="heart" size={56} color={WHITE} />
          </Animated.View>
        </View>
      </View>

      {/* Floating pills */}
      <FloatingPill x={20} y={60} label="Metformin 500mg" color="#22d3ee" delay={200} />
      <FloatingPill x={width * 0.52} y={50} label="Lisinopril 10mg" color="#67e8f9" delay={500} />
      <FloatingPill x={30} y={height * 0.27} label="Aspirin 81mg" color="#a5f3fc" delay={800} />
      <FloatingPill x={width * 0.5} y={height * 0.28} label="8:00 AM" color="#22d3ee" delay={1100} />

      {/* Stats card */}
      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={[styles.statsCard, { left: width * 0.1, bottom: 40 }]}
      >
        <View style={styles.statsCardRow}>
          <Feather name="check-circle" size={16} color="#10b981" />
          <Text style={styles.statsCardText}>4 doses tracked today</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2 Visual ─────────────────────────────────────────────────────────
function Slide2Visual() {
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const bellBounce = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1200 }), withTiming(1, { duration: 0 })),
      -1,
      false
    );
    ring2.value = withDelay(
      400,
      withRepeat(
        withSequence(withTiming(1.9, { duration: 1200 }), withTiming(1, { duration: 0 })),
        -1,
        false
      )
    );
    bellBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(8, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(-5, { duration: 150 }),
        withTiming(5, { duration: 150 }),
        withTiming(0, { duration: 100 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: interpolate(ring1.value, [1, 1.6], [0.6, 0]),
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: interpolate(ring2.value, [1, 1.9], [0.4, 0]),
  }));
  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${bellBounce.value}deg` }],
  }));

  const SCHEDULE = [
    { time: "8:00 AM", med: "Metformin", done: true },
    { time: "12:00 PM", med: "Aspirin", done: true },
    { time: "8:00 PM", med: "Atorvastatin", done: false },
    { time: "9:00 PM", med: "Lisinopril", done: false },
  ];

  return (
    <View style={styles.visualContainer}>
      {/* Pulse rings */}
      <View style={styles.bellPulseContainer}>
        <Animated.View style={[styles.pulseRing, { borderColor: "#67e8f9" }, ring2Style]} />
        <Animated.View style={[styles.pulseRing, { borderColor: "#22d3ee" }, ring1Style]} />
        <View style={styles.bellCircle}>
          <Animated.View style={bellStyle}>
            <Feather name="bell" size={44} color={WHITE} />
          </Animated.View>
        </View>
      </View>

      {/* Schedule list */}
      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.scheduleCard}>
        {SCHEDULE.map((item, i) => (
          <View key={i} style={[styles.scheduleRow, i < SCHEDULE.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#e0f2fe" }]}>
            <View style={[styles.scheduleCheck, { backgroundColor: item.done ? "#10b981" : "transparent", borderColor: item.done ? "#10b981" : "#cbd5e1" }]}>
              {item.done && <Feather name="check" size={12} color={WHITE} />}
            </View>
            <Text style={[styles.scheduleTime, { color: item.done ? "#94a3b8" : "#0f172a" }]}>{item.time}</Text>
            <Text style={[styles.scheduleMed, { color: item.done ? "#94a3b8" : "#0f172a", textDecorationLine: item.done ? "line-through" : "none" }]}>{item.med}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Slide 3 Visual ─────────────────────────────────────────────────────────
function Slide3Visual() {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.2)) });
    rotate.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const NODES = [
    { icon: "user", label: "Patient", color: "#22d3ee", angle: 0 },
    { icon: "users", label: "Family", color: "#67e8f9", angle: 72 },
    { icon: "activity", label: "Doctor", color: "#a5f3fc", angle: 144 },
    { icon: "shield", label: "Nurse", color: "#cffafe", angle: 216 },
    { icon: "phone", label: "Emergency", color: "#22d3ee", angle: 288 },
  ];

  const RADIUS = 110;

  return (
    <View style={styles.visualContainer}>
      <View style={styles.networkContainer}>
        {/* Lines from center to nodes */}
        {NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const nx = Math.cos(rad) * RADIUS;
          const ny = Math.sin(rad) * RADIUS;
          const lineLen = RADIUS;
          const lineAngle = node.angle;
          return (
            <View
              key={`line-${i}`}
              style={[
                styles.networkLine,
                {
                  width: lineLen,
                  transform: [{ rotate: `${lineAngle}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Orbiting nodes */}
        <Animated.View style={[styles.networkOrbit, orbitStyle]}>
          {NODES.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const nx = Math.cos(rad) * RADIUS;
            const ny = Math.sin(rad) * RADIUS;
            return (
              <View
                key={`node-${i}`}
                style={[
                  styles.networkNode,
                  {
                    left: RADIUS + nx - 26,
                    top: RADIUS + ny - 26,
                    backgroundColor: `${node.color}30`,
                    borderColor: `${node.color}80`,
                  },
                ]}
              >
                <Feather name={node.icon as keyof typeof Feather.glyphMap} size={20} color={node.color} />
              </View>
            );
          })}
        </Animated.View>

        {/* Center node */}
        <Animated.View style={[styles.centerNode, centerStyle]}>
          <Feather name="heart" size={28} color={WHITE} />
        </Animated.View>
      </View>

      {/* Connected badge */}
      <Animated.View
        entering={FadeInDown.delay(700).springify()}
        style={styles.connectedBadge}
      >
        <Feather name="wifi" size={14} color="#10b981" />
        <Text style={styles.connectedText}>5 caregivers connected</Text>
      </Animated.View>
    </View>
  );
}

const VISUALS = [Slide1Visual, Slide2Visual, Slide3Visual];

// ─── Main Onboarding ─────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setOnboarded } = useApp();
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
        setCurrent(viewableItems[0].index);
      }
    }
  ).current;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setOnboarded(true);
    router.replace("/login");
  };

  const VISUAL_HEIGHT = height * 0.55;
  const CARD_HEIGHT = height - VISUAL_HEIGHT;

  return (
    <View style={[styles.screen, { backgroundColor: SLIDES[current].bgColor }]}>
      {/* Skip button */}
      <Pressable
        onPress={handleFinish}
        style={[styles.skipBtn, { top: topInset + 12 }]}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slide pager */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        style={{ height: VISUAL_HEIGHT, flexGrow: 0 }}
        renderItem={({ item, index }) => {
          const Visual = VISUALS[index];
          return (
            <View style={{ width, height: VISUAL_HEIGHT }}>
              <Visual />
            </View>
          );
        }}
      />

      {/* Bottom card */}
      <View style={[styles.card, { height: CARD_HEIGHT, paddingBottom: bottomInset + 12 }]}>
        {/* Slide text */}
        <Animated.View key={current} entering={FadeInUp.duration(400)} style={styles.cardText}>
          <Text style={styles.cardTitle}>{SLIDES[current].title}</Text>
          <Text style={styles.cardSubtitle}>{SLIDES[current].subtitle}</Text>
        </Animated.View>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                flatRef.current?.scrollToIndex({ index: i, animated: true });
                setCurrent(i);
              }}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === current ? TEAL : "#cbd5e1",
                    width: i === current ? 28 : 8,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={goNext}
          style={styles.nextBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <View style={styles.nextArrow}>
            <Feather name="arrow-right" size={18} color={TEAL} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  skipText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  // Visual area
  visualContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Orbit ring (slide 1)
  orbitRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  orbitDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
  },
  centralIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  centralIconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Floating pill chips
  pillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
    borderWidth: 1,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  // Stats card (slide 1)
  statsCard: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  statsCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsCardText: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  // Bell / pulse (slide 2)
  bellPulseContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  bellCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  scheduleCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    width: width * 0.78,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  scheduleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleTime: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    width: 64,
  },
  scheduleMed: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },

  // Network / caregiver (slide 3)
  networkContainer: {
    width: RADIUS_DIAM,
    height: RADIUS_DIAM,
    alignItems: "center",
    justifyContent: "center",
  },
  networkOrbit: {
    position: "absolute",
    width: RADIUS_DIAM,
    height: RADIUS_DIAM,
  },
  networkLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    top: "50%",
    left: "50%",
    transformOrigin: "left center",
  },
  networkNode: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  centerNode: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginTop: 20,
  },
  connectedText: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  // Bottom card
  card: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    gap: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  cardText: {
    flex: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#0f172a",
    lineHeight: 38,
  },
  cardSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    lineHeight: 24,
  },

  // Dots
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Next button
  nextBtn: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingVertical: 18,
    paddingLeft: 28,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: WHITE,
    flex: 1,
  },
  nextArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
});
