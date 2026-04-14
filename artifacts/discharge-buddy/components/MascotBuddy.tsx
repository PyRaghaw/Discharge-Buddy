import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  withSpring,
  Easing
} from "react-native-reanimated";

const MASCOT_IMG = require("../assets/images/pink_medical_mascot.png");

export function MascotBuddy() {
  const float = useSharedValue(0);
  const wave = useSharedValue(0);
  const scale = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);

  useEffect(() => {
    // Initial bounce in
    scale.value = withSpring(1, { damping: 12 });
    
    // Delay bubble
    setTimeout(() => {
      bubbleOpacity.value = withTiming(1, { duration: 500 });
    }, 1000);

    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    wave.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: float.value },
      { rotate: `${wave.value}deg` }
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ translateY: withSpring(bubbleOpacity.value === 1 ? 0 : 20) }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bubbleContainer, bubbleStyle]}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Hii! I'm Buddy. 👋 Let's make today a great recovery day! ✨</Text>
        </View>
        <View style={styles.bubbleTail} />
      </Animated.View>
      <Animated.View style={[styles.mascotWrapper, animatedStyle]}>
        <Image 
          source={MASCOT_IMG} 
          style={styles.mascot}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
    zIndex: 10,
  },
  mascotWrapper: {
    width: 100,
    height: 100,
  },
  mascot: {
    width: "100%",
    height: "100%",
  },
  bubbleContainer: {
    flex: 1,
    marginRight: 10,
    marginBottom: 20,
    alignItems: "flex-end",
  },
  bubble: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: "#fb2c67",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleText: {
    color: "#4a0418",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ffffff",
    transform: [{ rotate: "180deg" }],
    marginRight: 15,
    marginTop: -1,
  },
});
