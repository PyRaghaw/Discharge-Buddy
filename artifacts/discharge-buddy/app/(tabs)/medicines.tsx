import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MedicineCard } from "@/components/MedicineCard";
import { useApp } from "@/context/AppContext";

const PINK = "#e91e8c";
const PINK_DARK = "#c2185b";
const PINK_LIGHT = "#f06292";
const TEAL = "#0891b2";
const WHITE = "#ffffff";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const TIME_SLOTS: { label: string; range: [string, string]; icon: FeatherName; color: string }[] = [
  { label: "Morning", range: ["06:00", "12:00"], icon: "sun",    color: "#f59e0b" },
  { label: "Afternoon", range: ["12:00", "17:00"], icon: "cloud", color: "#06b6d4" },
  { label: "Evening", range: ["17:00", "21:00"], icon: "sunset",  color: "#f97316" },
  { label: "Night", range: ["21:00", "24:00"], icon: "moon",      color: "#8b5cf6" },
];

export default function MedicinesScreen() {
  const insets = useSafeAreaInsets();
  const { medicines, todayDoses, updateDoseStatus } = useApp();
  const [activeTab, setActiveTab] = useState<"today" | "all">("today");

  const topInset = Platform.OS === "web" ? 0 : insets.top;

  const getDosesForSlot = (range: [string, string]) => {
    return todayDoses.filter((dose) => {
      const [h, m] = dose.scheduledTime.split(":").map(Number);
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      return timeStr >= range[0] && timeStr < range[1];
    });
  };

  const takenCount = todayDoses.filter((d) => d.status === "taken").length;
  const totalCount = todayDoses.length;
  const progressPct = totalCount > 0 ? takenCount / totalCount : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Gradient header */}
      <LinearGradient
        colors={[PINK_DARK, PINK, PINK_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 20 }]}
      >
        {/* Decorative circles */}
        <View style={styles.decor1} />
        <View style={styles.decor2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>My Medicines</Text>
            <Text style={styles.headerSub}>
              {takenCount} of {totalCount} taken today
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/scan")}
            style={styles.scanBtn}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={18} color={PINK} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progressPct * 100)}%</Text>
        </View>

        {/* Tab switcher inside header */}
        <View style={styles.tabWrap}>
          {(["today", "all"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === "today" ? "Today's Schedule" : "All Medicines"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Cards list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "today" ? (
          totalCount === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyCircle, { backgroundColor: `${PINK}15` }]}>
                <Feather name="check-circle" size={36} color={PINK} />
              </View>
              <Text style={styles.emptyTitle}>No doses today</Text>
              <Text style={styles.emptySub}>All clear for today!</Text>
            </View>
          ) : (
            TIME_SLOTS.map((slot) => {
              const doses = getDosesForSlot(slot.range);
              if (doses.length === 0) return null;
              const slotTaken = doses.filter((d) => d.status === "taken").length;
              return (
                <View key={slot.label} style={styles.slotSection}>
                  {/* Slot header */}
                  <View style={styles.slotHeader}>
                    <View style={[styles.slotIconWrap, { backgroundColor: `${slot.color}18` }]}>
                      <Feather name={slot.icon} size={15} color={slot.color} />
                    </View>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <View style={[styles.slotCountBadge, { backgroundColor: `${slot.color}18` }]}>
                      <Text style={[styles.slotCountText, { color: slot.color }]}>
                        {slotTaken}/{doses.length}
                      </Text>
                    </View>
                  </View>

                  {doses.map((dose) => {
                    const med = medicines.find((m) => m.id === dose.medicineId);
                    if (!med) return null;
                    return (
                      <MedicineCard
                        key={dose.id}
                        medicine={med}
                        dose={dose}
                        onTake={(id) => updateDoseStatus(id, "taken")}
                        onSnooze={(id) => updateDoseStatus(id, "snoozed")}
                      />
                    );
                  })}
                </View>
              );
            })
          )
        ) : medicines.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyCircle, { backgroundColor: `${PINK}15` }]}>
              <Feather name="package" size={36} color={PINK} />
            </View>
            <Text style={styles.emptyTitle}>No medicines yet</Text>
            <Text style={styles.emptySub}>Scan a prescription to get started</Text>
            <TouchableOpacity
              onPress={() => router.push("/scan")}
              style={[styles.emptyBtn, { backgroundColor: PINK }]}
            >
              <Feather name="camera" size={14} color={WHITE} />
              <Text style={styles.emptyBtnText}>Scan Rx</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.allMedsGrid}>
            {medicines.map((med) => (
              <MedicineCard key={med.id} medicine={med} compact />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "hidden",
  },
  decor1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -30,
    right: -20,
  },
  decor2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: 30,
    left: -15,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: WHITE,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  progressBg: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  progressPct: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    width: 36,
    textAlign: "right",
  },

  tabWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 50,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: WHITE,
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.8)",
  },
  tabBtnTextActive: {
    color: PINK,
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  slotSection: {
    marginBottom: 6,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  slotIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  slotLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#1e293b",
    flex: 1,
  },
  slotCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
  },
  slotCountText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  allMedsGrid: {
    gap: 0,
  },

  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1e293b",
  },
  emptySub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#94a3b8",
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 50,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: WHITE,
  },
});
