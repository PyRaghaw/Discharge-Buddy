import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MascotBuddy } from "@/components/MascotBuddy";
import colors from "@/constants/colors";
import { getLevel, useApp } from "@/context/AppContext";
import { useSidebar } from "@/context/SidebarContext";

const { width } = Dimensions.get("window");
const theme = colors.light;

// ─── Circular Progress Chart ─────────────────────────────────────────────────
function CircularProgress({ pct, size = 120 }: { pct: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={cx} cy={cy} r={r}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={cx} cy={cy} r={r}
        stroke="#ffffff"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx},${cy}`}
      />
      <SvgText
        x={cx} y={cy - 8}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="22"
        fontFamily="Inter_700Bold"
      >
        {pct}%
      </SvgText>
      <SvgText
        x={cx} y={cy + 12}
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize="10"
        fontFamily="Inter_500Medium"
      >
        adherence
      </SvgText>
    </Svg>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────
function WeeklyBars({ taken = 0, total = 0 }: { taken: number; total: number }) {
  const today = new Date();
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = (today.getDay() + 6) % 7;
  const barW = 20;
  const barH = 70;
  const chartW = Math.min(width - 36, 360);
  const gap = (chartW - days.length * barW) / (days.length - 1);

  const baseData = [92, 100, 75, 90, 100, 85, 0];
  const todayPct = total > 0 ? (taken / total) * 100 : 0;
  const randomVals = baseData.map((v, i) => (i === todayIdx ? todayPct : i < todayIdx ? v : 0));

  return (
    <View style={{ width: chartW, height: barH + 28, alignItems: 'center' }}>
      <Svg width={chartW} height={barH + 28} viewBox={`0 0 ${chartW} ${barH + 28}`}>
        {days.map((d, i) => {
          const pct = randomVals[i] / 100;
          const h = Math.round(pct * barH);
          const x = i * (barW + gap);
          const y = barH - h;
          const isToday = i === todayIdx;
          
          return (
            <G key={i}>
              <Rect
                x={x} y={0}
                width={barW} height={barH}
                rx={10} ry={10}
                fill="rgba(255,255,255,0.12)"
              />
              {pct > 0 && (
                <Rect
                  x={x} y={y}
                  width={barW} height={h}
                  rx={10} ry={10}
                  fill={isToday ? "#ffffff" : "rgba(255,255,255,0.6)"}
                />
              )}
              <SvgText
                x={x + barW / 2} y={barH + 20}
                textAnchor="middle"
                fill={isToday ? "#ffffff" : "rgba(255,255,255,0.6)"}
                fontSize="11"
                fontWeight={isToday ? "700" : "500"}
              >
                {d}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { role } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (role === "caregiver") return <CaregiverDashboard topInset={topInset} />;
  return <PatientDashboard topInset={topInset} />;
}

function PatientDashboard({ topInset }: { topInset: number }) {
  const { user, todayDoses, medicines, followUps, updateDoseStatus } = useApp();
  const { open: openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const taken = todayDoses.filter(d => d.status === "taken").length;
  const total = todayDoses.length;
  const missed = todayDoses.filter(d => d.status === "missed").length;
  const pending = todayDoses.filter(d => d.status === "pending").length;
  const adherencePct = total > 0 ? Math.round((taken / total) * 100) : 0;

  const upcomingFollowUp = followUps.find(f => !f.completed);
  const [showAll, setShowAll] = useState(false);

  const recentActivity = todayDoses.slice(0, showAll ? undefined : 4).map(dose => ({
    dose,
    med: medicines.find(m => m.id === dose.medicineId),
  }));

  const getRiskColor = () => missed >= 2 ? "#fb2c67" : missed === 1 ? "#f59e0b" : "#10b981";
  const getRiskLabel = () => missed >= 2 ? "High Risk" : missed === 1 ? "Moderate" : "On Track";
  const firstName = (user?.name ?? "Patient").split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 90 }}
      >
        <LinearGradient
          colors={[theme.primary, "#ff85a2"]}
          style={[styles.headerBg, { paddingTop: topInset + 12 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
              <Feather name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name="user" size={18} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.helloText}>Hello,</Text>
                <Text style={styles.nameText}>{firstName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/notifications")} style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#fff" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          <MascotBuddy />

          <View style={styles.adherenceRow}>
            <CircularProgress pct={adherencePct} size={120} />
            <View style={styles.adherenceInfo}>
              <Text style={styles.statsLabel}>Recovery Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <View style={styles.activeDot} />
                <Text style={styles.statusText}>{getRiskLabel()}</Text>
              </View>
              <Text style={styles.statsMain}>{taken}/{total} doses today</Text>
              <Text style={styles.statsMinor}>{missed} missed · {pending} pending</Text>
            </View>
          </View>

          <View style={styles.weeklyChart}>
            <Text style={styles.weeklyLabel}>This Week</Text>
            <WeeklyBars taken={taken} total={total} />
          </View>

          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => updateDoseStatus("m1", "taken")}>
              <Feather name="check-square" size={15} color={theme.primary} />
              <Text style={styles.actionBtnText}>Track Dose</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/scan")}>
              <Feather name="camera" size={15} color={theme.primary} />
              <Text style={styles.actionBtnText}>Scan Rx</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.whiteArea}>
          <View style={styles.quickRow}>
            {[
              { icon: "activity" as const, label: "Symptoms", color: "#fb2c67", route: "/(tabs)/symptoms" },
              { icon: "calendar" as const, label: "Schedule", color: "#8b5cf6", route: "/(tabs)/schedule" },
              { icon: "message-circle" as const, label: "AI Help", color: theme.primary, route: "/chat" },
              { icon: "alert-triangle" as const, label: "Emergency", color: "#ef4444", route: "/emergency" },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
              >
                <View style={[styles.quickCircle, { backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }]}>
                  <Feather name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {upcomingFollowUp && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/followups")} style={styles.followupBanner}>
              <View style={styles.followupLeft}>
                <View style={[styles.followupIcon, { backgroundColor: "#fff1f4" }]}>
                  <Feather name="calendar" size={18} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.followupTitle}>{upcomingFollowUp.title}</Text>
                  <Text style={styles.followupDate}>
                    {new Date(upcomingFollowUp.dateTime).toLocaleDateString("en", {
                      weekday: "short", month: "short", day: "numeric",
                    })} · {upcomingFollowUp.doctorName}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={theme.primary} />
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Doses</Text>
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>{showAll ? "Show less" : "See all"}</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.map(({ dose, med }) => {
            if (!med) return null;
            const statusColor = dose.status === "taken" ? "#10b981" : dose.status === "missed" ? "#ef4444" : theme.primary;
            return (
              <View key={dose.id} style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: `${med.color}15` }]}>
                  <Feather name="package" size={18} color={med.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{dose.medicineName}</Text>
                  <Text style={styles.activitySub}>{med.dosage} · {dose.scheduledTime}</Text>
                </View>
                <View style={styles.activityRight}>
                   <Feather 
                    name={dose.status === "taken" ? "check-circle" : (dose.status === "missed" ? "x-circle" : "clock")} 
                    size={20} color={statusColor} 
                   />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function CaregiverDashboard({ topInset }: { topInset: number }) {
  const { user, linkedPatients } = useApp();
  const { open: openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const patient = linkedPatients[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 90 }}
      >
        <LinearGradient
          colors={[theme.primary, "#ff85a2"]}
          style={[styles.headerBg, { paddingTop: topInset + 12 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
              <Feather name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name="users" size={18} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.helloText}>Caregiver,</Text>
                <Text style={styles.nameText}>{(user?.name ?? "Caregiver").split(" ")[0]}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="settings" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <MascotBuddy />

          <View style={styles.caregiverSummary}>
            <Text style={styles.statsLabel}>Patient Status</Text>
            <Text style={styles.statsMain}>{patient?.name ?? "Patient"} is Stable</Text>
            <View style={styles.statsRow}>
              <View style={styles.miniStat}>
                <Text style={styles.miniVal}>98%</Text>
                <Text style={styles.miniLabel}>Adherence</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniVal}>0</Text>
                <Text style={styles.miniLabel}>Alerts</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickRow}>
          {[
            { icon: "eye" as const, label: "Monitor", color: theme.primary },
            { icon: "bell" as const, label: "Remind", color: "#f59e0b" },
            { icon: "message-circle" as const, label: "Message", color: "#8b5cf6" },
            { icon: "alert-triangle" as const, label: "Alert", color: "#ef4444" },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickItem}>
              <View style={[styles.quickCircle, { backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }]}>
                <Feather name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  helloText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
  nameText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
    borderWidth: 1.5,
    borderColor: "#fb2c67",
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
    marginTop: 10,
  },
  adherenceInfo: { flex: 1 },
  statsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  statusText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsMain: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  statsMinor: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
  
  weeklyChart: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
  },
  weeklyLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 12 },

  actionBtns: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(251,44,103,0.1)",
    shadowColor: "#fb2c67",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#4a0418" },

  filterScroll: { marginTop: 20, paddingLeft: 20 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 10,
  },
  filterPillActive: { backgroundColor: "#fff" },
  filterPillText: { fontSize: 12, color: "#fff", fontFamily: "Inter_600SemiBold" },
  filterPillTextActive: { color: "#fb2c67" },

  whiteArea: {
    backgroundColor: "#fff1f4",
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#4a0418",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251,44,103,0.05)",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#4a0418" },
  activitySub: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  activityRight: { alignItems: "flex-end" },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  quickItem: { alignItems: "center", gap: 8, flex: 1 },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#fb2c67",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#64748b",
    textAlign: "center",
  },

  followupBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(251,44,103,0.1)",
    shadowColor: "#fb2c67",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  followupLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  followupIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  followupTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#4a0418" },
  followupDate: { fontSize: 12, color: "#64748b" },

  caregiverSummary: { paddingHorizontal: 20, marginTop: 10 },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 12 },
  miniStat: { gap: 2 },
  miniVal: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  miniLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
});
