import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const TEAL = "#0891b2";
const TEAL_DARK = "#0c4a6e";
const TEAL_MID = "#0e7490";
const WHITE = "#ffffff";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { role, user, todayDoses, medicines, followUps, updateDoseStatus } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (role === "caregiver") {
    return <CaregiverDashboard topInset={topInset} />;
  }

  return <PatientDashboard topInset={topInset} />;
}

// ─── Patient Dashboard ────────────────────────────────────────────────────────
function PatientDashboard({ topInset }: { topInset: number }) {
  const { user, todayDoses, medicines, followUps, updateDoseStatus } = useApp();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const taken = todayDoses.filter((d) => d.status === "taken").length;
  const total = todayDoses.length;
  const missed = todayDoses.filter((d) => d.status === "missed").length;
  const pending = todayDoses.filter((d) => d.status === "pending").length;
  const adherencePct = total > 0 ? Math.round((taken / total) * 100) : 0;

  const upcomingFollowUp = followUps.find((f) => !f.completed);
  const [showAll, setShowAll] = useState(false);

  const recentActivity = todayDoses.slice(0, showAll ? undefined : 4).map((dose) => {
    const med = medicines.find((m) => m.id === dose.medicineId);
    return { dose, med };
  });

  const getRiskColor = () => {
    if (missed >= 2) return "#ef4444";
    if (missed === 1) return "#f59e0b";
    return "#10b981";
  };

  const getRiskLabel = () => {
    if (missed >= 2) return "High Risk";
    if (missed === 1) return "Moderate";
    return "On Track";
  };

  const getName = () => {
    const name = user?.name ?? "Patient";
    return name.split(" ")[0];
  };

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 90 }}
        stickyHeaderIndices={[]}
      >
        {/* ── Dark teal header ── */}
        <View style={[styles.headerBg, { paddingTop: topInset + 12 }]}>
          {/* Top row */}
          <View style={styles.headerTop}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name="user" size={20} color={TEAL} />
              </View>
              <View>
                <Text style={styles.helloText}>Hello,</Text>
                <Text style={styles.nameText}>{getName()}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Feather name="bell" size={20} color={WHITE} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Adherence stat */}
          <Text style={styles.statLabel}>Today's Recovery Status</Text>
          <View style={styles.statRow}>
            <Text style={styles.statValue}>{adherencePct}%</Text>
            <View style={[styles.riskPill, { backgroundColor: `${getRiskColor()}25` }]}>
              <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
              <Text style={[styles.riskText, { color: getRiskColor() }]}>{getRiskLabel()}</Text>
            </View>
          </View>
          <Text style={styles.statSub}>
            {taken} of {total} doses taken today
          </Text>

          {/* Action buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/(tabs)/medicines")}
            >
              <Feather name="check-square" size={16} color={TEAL_DARK} />
              <Text style={styles.actionBtnText}>Track Dose</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/scan")}
            >
              <Feather name="camera" size={16} color={TEAL_DARK} />
              <Text style={styles.actionBtnText}>Scan Rx</Text>
            </TouchableOpacity>
          </View>

          {/* Medicine filter pills */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["All Doses", "Morning", "Afternoon", "Night"].map((label, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.filterPill, i === 0 && styles.filterPillActive]}
                >
                  <Text style={[styles.filterPillText, i === 0 && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.filterPill, { flexDirection: "row", alignItems: "center", gap: 4 }]}>
                <Feather name="plus-circle" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.filterPillText}>More</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* ── White content area ── */}
        <View style={styles.whiteArea}>
          {/* Quick action circles */}
          <View style={styles.quickRow}>
            {[
              { icon: "activity" as const, label: "Symptoms", color: "#f59e0b", route: "/(tabs)/symptoms" },
              { icon: "calendar" as const, label: "Follow-ups", color: "#8b5cf6", route: "/(tabs)/followups" },
              { icon: "message-circle" as const, label: "AI Help", color: TEAL, route: "/chat" },
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

          {/* Follow-up banner */}
          {upcomingFollowUp && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/followups")}
              style={styles.followupBanner}
            >
              <View style={styles.followupLeft}>
                <View style={[styles.followupIcon, { backgroundColor: `${TEAL}20` }]}>
                  <Feather name="calendar" size={18} color={TEAL} />
                </View>
                <View>
                  <Text style={styles.followupTitle}>{upcomingFollowUp.title}</Text>
                  <Text style={styles.followupDate}>
                    {new Date(upcomingFollowUp.dateTime).toLocaleDateString("en", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {upcomingFollowUp.doctorName}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={TEAL} />
            </TouchableOpacity>
          )}

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Doses</Text>
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text style={[styles.seeAll, { color: TEAL }]}>{showAll ? "Show less" : "See all"}</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.map(({ dose, med }) => {
            if (!med) return null;
            const statusColor =
              dose.status === "taken" ? "#10b981"
              : dose.status === "missed" ? "#ef4444"
              : dose.status === "snoozed" ? "#f59e0b"
              : "#0891b2";

            const statusIcon =
              dose.status === "taken" ? "check-circle" as const
              : dose.status === "missed" ? "x-circle" as const
              : "clock" as const;

            return (
              <View key={dose.id} style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: `${med.color}15` }]}>
                  <Feather name="package" size={18} color={med.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{dose.medicineName}</Text>
                  <Text style={styles.activitySub}>
                    {med.dosage} · Scheduled {dose.scheduledTime}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <Feather name={statusIcon} size={20} color={statusColor} />
                  {dose.status === "pending" && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        updateDoseStatus(dose.id, "taken");
                      }}
                      style={[styles.takeBtn, { backgroundColor: `${TEAL}15` }]}
                    >
                      <Text style={[styles.takeBtnText, { color: TEAL }]}>Take</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { label: "Taken Today", value: taken, color: "#10b981", icon: "check-circle" as const },
              { label: "Missed", value: missed, color: "#ef4444", icon: "x-circle" as const },
              { label: "Pending", value: pending, color: TEAL, icon: "clock" as const },
              { label: "Total Meds", value: medicines.length, color: "#8b5cf6", icon: "package" as const },
            ].map((item, i) => (
              <View key={i} style={[styles.statCard, { borderColor: `${item.color}30`, backgroundColor: `${item.color}08` }]}>
                <Feather name={item.icon} size={20} color={item.color} />
                <Text style={[styles.statCardValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statCardLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Caregiver Dashboard ──────────────────────────────────────────────────────
function CaregiverDashboard({ topInset }: { topInset: number }) {
  const { user, linkedPatients } = useApp();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const patient = linkedPatients[0];

  const ACTIVITY = [
    { icon: "check-circle" as const, text: "Took Lisinopril 10mg", time: "8:03 AM", color: "#10b981" },
    { icon: "check-circle" as const, text: "Took Metformin 500mg", time: "8:05 AM", color: "#10b981" },
    { icon: "activity" as const, text: "Logged: mild headache", time: "10:30 AM", color: "#f59e0b" },
    { icon: "x-circle" as const, text: "Missed Aspirin 81mg", time: "8:00 PM", color: "#ef4444" },
    { icon: "clock" as const, text: "Atorvastatin pending", time: "9:00 PM", color: "#0891b2" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 90 }}
      >
        {/* Header */}
        <View style={[styles.headerBg, { paddingTop: topInset + 12 }]}>
          <View style={styles.headerTop}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name="users" size={18} color={TEAL} />
              </View>
              <View>
                <Text style={styles.helloText}>Caregiver,</Text>
                <Text style={styles.nameText}>{(user?.name ?? "Caregiver").split(" ")[0]}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Feather name="bell" size={20} color={WHITE} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          <Text style={styles.statLabel}>Monitoring Patient</Text>
          <Text style={styles.statValue}>{patient?.name ?? "No Patient"}</Text>
          <Text style={styles.statSub}>{patient?.condition ?? ""}</Text>

          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="phone" size={16} color={TEAL_DARK} />
              <Text style={styles.actionBtnText}>Call Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="alert-triangle" size={16} color="#ef4444" />
              <Text style={[styles.actionBtnText, { color: "#ef4444" }]}>Emergency</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={[styles.filterPill, styles.filterPillActive]}>
              <Text style={styles.filterPillTextActive}>Today</Text>
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>This Week</Text>
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>All Time</Text>
            </View>
          </View>
        </View>

        <View style={styles.whiteArea}>
          {/* Adherence overview */}
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceRow}>
              {[
                { label: "Taken", value: 3, color: "#10b981" },
                { label: "Missed", value: 1, color: "#ef4444" },
                { label: "Pending", value: 1, color: TEAL },
              ].map((s, i) => (
                <View key={i} style={styles.adherenceStat}>
                  <Text style={[styles.adherenceValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.adherenceLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(3 / 5) * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>60% adherence today</Text>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            {[
              { icon: "eye" as const, label: "Monitor", color: TEAL },
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

          {/* Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Activity</Text>
            <Text style={[styles.seeAll, { color: TEAL }]}>See all</Text>
          </View>

          {ACTIVITY.map((item, i) => (
            <View key={i} style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{item.text}</Text>
                <Text style={styles.activitySub}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Header ──
  headerBg: {
    backgroundColor: TEAL_DARK,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  helloText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  nameText: {
    color: WHITE,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#fbbf24",
    top: 9,
    right: 9,
    borderWidth: 1.5,
    borderColor: TEAL_DARK,
  },

  // Stat
  statLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  statValue: {
    color: WHITE,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  riskPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },
  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },

  // Action buttons
  actionBtns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#c8f6ff",
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: TEAL_DARK,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  // Filter pills
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  filterPillActive: {
    backgroundColor: "#c8f6ff",
    borderColor: "transparent",
  },
  filterPillText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  filterPillTextActive: {
    color: TEAL_DARK,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  // ── White section ──
  whiteArea: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -2,
    paddingHorizontal: 18,
    paddingTop: 24,
  },

  // Quick actions
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  quickCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#475569",
    textAlign: "center",
  },

  // Follow-up banner
  followupBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  followupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  followupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  followupTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#0f172a",
    marginBottom: 2,
  },
  followupDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#0f172a",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  // Activity rows
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#0f172a",
    marginBottom: 2,
  },
  activitySub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
  },
  activityRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  takeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  takeBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statCardValue: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statCardLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
  },

  // Caregiver adherence card
  adherenceCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  adherenceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  adherenceStat: { alignItems: "center" },
  adherenceValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  adherenceLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e0f2fe",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: TEAL,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    textAlign: "right",
  },
});
