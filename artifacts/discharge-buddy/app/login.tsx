import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

const TEAL = "#0891b2";
const TEAL_DARK = "#0c4a6e";
const WHITE = "#ffffff";
const INPUT_BG = "#f0f9ff";
const INPUT_BORDER = "#bae6fd";
const MUTED = "#64748b";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setRole, setUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [role, setRoleState] = useState<"patient" | "caregiver">("patient");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(role);
    setUser({
      id: Date.now().toString(),
      name: email.split("@")[0] || (role === "patient" ? "John Doe" : "Mary Doe"),
      email: email || `${role}@example.com`,
      role,
    });
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Teal wave header */}
        <View style={[styles.header, { paddingTop: topInset + 24 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={WHITE} />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Feather name="heart" size={22} color={TEAL} />
            </View>
            <Text style={styles.logoName}>DischargeBuddy</Text>
          </View>

          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Login to your account</Text>
        </View>

        {/* Wave SVG divider effect */}
        <View style={styles.waveDivider} />

        {/* Form card */}
        <View style={[styles.formCard, { paddingBottom: bottomInset + 24 }]}>
          {/* Role toggle */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              onPress={() => setRoleState("patient")}
              style={[styles.roleBtn, role === "patient" && styles.roleBtnActive]}
            >
              <Feather name="user" size={14} color={role === "patient" ? WHITE : TEAL} />
              <Text style={[styles.roleBtnText, { color: role === "patient" ? WHITE : TEAL }]}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRoleState("caregiver")}
              style={[styles.roleBtn, role === "caregiver" && styles.roleBtnActive]}
            >
              <Feather name="users" size={14} color={role === "caregiver" ? WHITE : TEAL} />
              <Text style={[styles.roleBtnText, { color: role === "caregiver" ? WHITE : TEAL }]}>Caregiver</Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Feather name="mail" size={18} color={TEAL} />
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email or username"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Feather name="lock" size={18} color={TEAL} />
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              style={[styles.input, { paddingRight: 44 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Remember + Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              onPress={() => setRemember(!remember)}
              style={styles.checkRow}
            >
              <View style={[styles.checkbox, { backgroundColor: remember ? TEAL : "transparent" }]}>
                {remember && <Feather name="check" size={11} color={WHITE} />}
              </View>
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.forgotText, { color: TEAL }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin} style={styles.loginBtn} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Feather name="github" size={20} color="#1a1a1a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Feather name="smartphone" size={20} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/register")}>
              <Text style={[styles.signupLink, { color: TEAL }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },

  // Header
  header: {
    backgroundColor: TEAL_DARK,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoName: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  headerTitle: {
    color: WHITE,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },

  // Wave effect
  waveDivider: {
    height: 40,
    backgroundColor: TEAL_DARK,
    marginBottom: -2,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  // Form
  formCard: {
    flex: 1,
    backgroundColor: WHITE,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 14,
  },

  // Role toggle
  roleToggle: {
    flexDirection: "row",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    padding: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  roleBtnActive: {
    backgroundColor: TEAL,
  },
  roleBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  // Inputs
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#0f172a",
    paddingVertical: 14,
    paddingRight: 14,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 14,
  },

  // Remember
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  // Login button
  loginBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },

  // Social
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#ea4335",
  },

  // Sign up
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signupLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
