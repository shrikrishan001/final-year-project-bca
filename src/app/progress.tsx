import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFitnessProfile, FitnessProfile } from "../utils/fitnessStorage";
import {
  getWorkoutData,
  getWorkoutStreak,
  getWeeklyWorkoutCounts,
} from "../utils/workoutStorage";

const { width } = Dimensions.get("window");

const PRIMARY = "#5B5BD6";
const GREEN = "#20A36A";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
const TEXT = "#182235";
const MUTED = "#8B91A3";
const BG = "#F7F8FC";
const BORDER = "#E8E9EF";

type WeightData = {
  targetWeight?: number;
  entries?: {
    id: string;
    weight: number;
    date: string;
  }[];
};

type WaterData = {
  goal?: number;
  target?: number;
  current?: number;
  consumed?: number;
  date?: string;
};

export default function ProgressScreen() {
  const [profile, setProfile] =
    useState<FitnessProfile | null>(null);

  const [workoutTotal, setWorkoutTotal] = useState(0);
  const [workoutStreak, setWorkoutStreak] = useState(0);

  const [weeklyWorkouts, setWeeklyWorkouts] =
    useState<number[]>([
      0, 0, 0, 0, 0, 0, 0,
    ]);

  const [currentWeight, setCurrentWeight] =
    useState<number | null>(null);

  const [targetWeight, setTargetWeight] =
    useState<number | null>(null);

  const [previousWeight, setPreviousWeight] =
    useState<number | null>(null);

  const [waterConsumed, setWaterConsumed] =
    useState(0);

  const [waterGoal, setWaterGoal] =
    useState(2500);

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const fitnessProfile =
        await getFitnessProfile();

      setProfile(fitnessProfile);

      // -----------------------------
      // WORKOUT DATA
      // -----------------------------

      const workoutData =
        await getWorkoutData();

      const streak =
        await getWorkoutStreak();

      const weekly =
        await getWeeklyWorkoutCounts();

      setWorkoutTotal(
        workoutData.totalWorkouts || 0
      );

      setWorkoutStreak(streak || 0);

      setWeeklyWorkouts(weekly);

      // -----------------------------
      // WEIGHT DATA
      // -----------------------------

      const weightRaw =
        await AsyncStorage.getItem(
          "weightTracker"
        );

      if (weightRaw) {
        const weightData =
          JSON.parse(weightRaw) as WeightData;

        const entries =
          weightData.entries || [];

        if (entries.length > 0) {
          const sortedEntries = [
            ...entries,
          ].sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          );

          setCurrentWeight(
            sortedEntries[0].weight
          );

          if (sortedEntries.length > 1) {
            setPreviousWeight(
              sortedEntries[1].weight
            );
          }
        }

        if (
          typeof weightData.targetWeight ===
          "number"
        ) {
          setTargetWeight(
            weightData.targetWeight
          );
        }
      } else if (fitnessProfile) {
        setCurrentWeight(
          fitnessProfile.weight
        );
      }

      // -----------------------------
      // WATER DATA
      // -----------------------------

      const waterRaw =
        await AsyncStorage.getItem(
          "waterTracker"
        );

      if (waterRaw) {
        const waterData =
          JSON.parse(waterRaw) as WaterData;

        const consumed =
          waterData.consumed ??
          waterData.current ??
          0;

        const goal =
          waterData.goal ??
          waterData.target ??
          2500;

        setWaterConsumed(consumed);
        setWaterGoal(goal);
      }
    } catch (error) {
      console.log(
        "Progress loading error:",
        error
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadProgress();

    setRefreshing(false);
  };

  // --------------------------------
  // CALORIE CALCULATION
  // --------------------------------

  const calculateCalories = () => {
    if (!profile) {
      return 2000;
    }

    const weight = Number(profile.weight);
    const height = Number(profile.height);
    const age = Number(profile.age);

    let bmr = 0;

    if (profile.gender === "male") {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age +
        5;
    } else {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age -
        161;
    }

    let multiplier = 1.2;

    if (profile.activity === "low") {
      multiplier = 1.2;
    } else if (
      profile.activity === "moderate"
    ) {
      multiplier = 1.55;
    } else if (
      profile.activity === "high"
    ) {
      multiplier = 1.725;
    }

    let calories = bmr * multiplier;

    if (profile.goal === "lose") {
      calories -= 400;
    }

    if (profile.goal === "gain") {
      calories += 300;
    }

    return Math.round(calories);
  };

  const calorieTarget =
    calculateCalories();

  // --------------------------------
  // BMI
  // --------------------------------

  const calculateBMI = () => {
    if (!profile) {
      return 0;
    }

    const weight =
      currentWeight || profile.weight;

    const height =
      Number(profile.height) / 100;

    if (!height) {
      return 0;
    }

    return weight / (height * height);
  };

  const bmi = calculateBMI();

  const getBMIStatus = () => {
    if (!bmi) {
      return "Not available";
    }

    if (bmi < 18.5) {
      return "Underweight";
    }

    if (bmi < 25) {
      return "Healthy";
    }

    if (bmi < 30) {
      return "Overweight";
    }

    return "Obese";
  };

  // --------------------------------
  // WEIGHT PROGRESS
  // --------------------------------

  const getWeightProgress = () => {
    if (
      currentWeight === null ||
      targetWeight === null ||
      !profile
    ) {
      return 0;
    }

    const startWeight =
      Number(profile.weight);

    const difference =
      startWeight - targetWeight;

    if (difference === 0) {
      return 100;
    }

    const completed =
      startWeight - currentWeight;

    let progress =
      (completed / difference) * 100;

    if (progress < 0) {
      progress = 0;
    }

    if (progress > 100) {
      progress = 100;
    }

    return Math.round(progress);
  };

  const weightProgress =
    getWeightProgress();

  // --------------------------------
  // WATER PROGRESS
  // --------------------------------

  const waterPercentage =
    waterGoal > 0
      ? Math.min(
          Math.round(
            (waterConsumed / waterGoal) *
              100
          ),
          100
        )
      : 0;

  // --------------------------------
  // WEEKLY WORKOUTS
  // --------------------------------

  const weeklyTotal =
    weeklyWorkouts.reduce(
      (sum, value) => sum + value,
      0
    );

  const maxWeeklyValue =
    Math.max(
      ...weeklyWorkouts,
      1
    );

  const dayLabels = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
  ];

  // --------------------------------
  // MOTIVATION
  // --------------------------------

  const getMotivation = () => {
    if (workoutStreak >= 7) {
      return "Amazing consistency! You have built a strong workout habit.";
    }

    if (workoutStreak >= 3) {
      return "Great streak! Keep the momentum going.";
    }

    if (workoutTotal > 0) {
      return "Good start! Stay consistent and keep improving.";
    }

    return "Start your first workout and begin your fitness journey.";
  };

  // --------------------------------
  // ACHIEVEMENTS
  // --------------------------------

  const achievements = [
    {
      icon: "fitness-outline" as const,
      title: "First Workout",
      description:
        "Complete your first workout",
      unlocked: workoutTotal >= 1,
    },
    {
      icon: "flame-outline" as const,
      title: "3 Day Streak",
      description:
        "Workout for 3 days in a row",
      unlocked: workoutStreak >= 3,
    },
    {
      icon: "trophy-outline" as const,
      title: "7 Day Streak",
      description:
        "Workout for 7 days in a row",
      unlocked: workoutStreak >= 7,
    },
    {
      icon: "water-outline" as const,
      title: "Hydration Goal",
      description:
        "Reach your daily water goal",
      unlocked:
        waterGoal > 0 &&
        waterConsumed >= waterGoal,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
          />
        }
      >
        {/* =========================
            HEADER
        ========================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={TEXT}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Your Progress
            </Text>

            <Text style={styles.subtitle}>
              Track your fitness journey
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadProgress}
          >
            <Ionicons
              name="refresh-outline"
              size={21}
              color={PRIMARY}
            />
          </TouchableOpacity>
        </View>

        {/* =========================
            HERO
        ========================== */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="analytics-outline"
              size={30}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Keep Going
            </Text>

            <Text style={styles.heroSubtitle}>
              {getMotivation()}
            </Text>
          </View>
        </View>

        {/* =========================
            TOP STATS
        ========================== */}

        <View style={styles.statsGrid}>
          <StatCard
            icon="fitness-outline"
            value={String(workoutTotal)}
            label="Workouts"
            color={PRIMARY}
          />

          <StatCard
            icon="flame-outline"
            value={String(workoutStreak)}
            label="Day Streak"
            color={ORANGE}
          />

          <StatCard
            icon="water-outline"
            value={`${waterPercentage}%`}
            label="Hydration"
            color={BLUE}
          />

          <StatCard
            icon="flame-outline"
            value={`${calorieTarget}`}
            label="Daily Calories"
            color={GREEN}
          />
        </View>

        {/* =========================
            WEEKLY ACTIVITY
        ========================== */}

        <SectionHeader
          title="Weekly Activity"
          icon="bar-chart-outline"
        />

        <View style={styles.card}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.bigNumber}>
                {weeklyTotal}
              </Text>

              <Text style={styles.smallLabel}>
                workouts this week
              </Text>
            </View>

            <View style={styles.weekBadge}>
              <Ionicons
                name="trending-up-outline"
                size={16}
                color={GREEN}
              />

              <Text style={styles.weekBadgeText}>
                Stay consistent
              </Text>
            </View>
          </View>

          <View style={styles.chart}>
            {weeklyWorkouts.map(
              (value, index) => {
                const height =
                  value === 0
                    ? 8
                    : Math.max(
                        18,
                        (value /
                          maxWeeklyValue) *
                          115
                      );

                return (
                  <View
                    key={index}
                    style={styles.chartColumn}
                  >
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height,
                          backgroundColor:
                            value > 0
                              ? PRIMARY
                              : "#E5E6F0",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.dayLabel,
                        value > 0 &&
                          styles.activeDay,
                      ]}
                    >
                      {dayLabels[index]}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* =========================
            WEIGHT
        ========================== */}

        <SectionHeader
          title="Weight Progress"
          icon="scale-outline"
        />

        <View style={styles.card}>
          <View style={styles.weightTop}>
            <View>
              <Text style={styles.cardLabel}>
                Current Weight
              </Text>

              <Text style={styles.weightNumber}>
                {currentWeight !== null
                  ? `${currentWeight} kg`
                  : "--"}
              </Text>
            </View>

            <View style={styles.targetBox}>
              <Text style={styles.cardLabel}>
                Target
              </Text>

              <Text style={styles.targetNumber}>
                {targetWeight !== null
                  ? `${targetWeight} kg`
                  : "--"}
              </Text>
            </View>
          </View>

          {previousWeight !== null &&
            currentWeight !== null && (
              <View style={styles.changeRow}>
                <Ionicons
                  name={
                    currentWeight <
                    previousWeight
                      ? "trending-down-outline"
                      : currentWeight >
                        previousWeight
                      ? "trending-up-outline"
                      : "remove-outline"
                  }
                  size={18}
                  color={
                    currentWeight <=
                    previousWeight
                      ? GREEN
                      : ORANGE
                  }
                />

                <Text style={styles.changeText}>
                  {Math.abs(
                    currentWeight -
                      previousWeight
                  ).toFixed(1)}{" "}
                  kg since previous entry
                </Text>
              </View>
            )}

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weightProgress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              Goal progress
            </Text>

            <Text style={styles.progressPercent}>
              {weightProgress}%
            </Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                "/weight-tracker" as any
              )
            }
          >
            <Ionicons
              name="scale-outline"
              size={18}
              color={PRIMARY}
            />

            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Update Weight
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            HYDRATION
        ========================== */}

        <SectionHeader
          title="Hydration"
          icon="water-outline"
        />

        <View style={styles.card}>
          <View style={styles.hydrationTop}>
            <View style={styles.waterCircle}>
              <Ionicons
                name="water"
                size={30}
                color={BLUE}
              />
            </View>

            <View style={styles.hydrationText}>
              <Text
                style={styles.hydrationValue}
              >
                {waterConsumed} ml
              </Text>

              <Text
                style={styles.hydrationGoal}
              >
                of {waterGoal} ml daily goal
              </Text>
            </View>

            <Text style={styles.waterPercent}>
              {waterPercentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.waterProgressFill,
                {
                  width: `${waterPercentage}%`,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                "/water-tracker"
              )
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={BLUE}
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: BLUE,
                },
              ]}
            >
              Track Water
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            BODY METRICS
        ========================== */}

        <SectionHeader
          title="Body Metrics"
          icon="body-outline"
        />

        <View style={styles.metricsCard}>
          <MetricItem
            icon="speedometer-outline"
            title="BMI"
            value={
              bmi
                ? bmi.toFixed(1)
                : "--"
            }
            subtitle={getBMIStatus()}
          />

          <View style={styles.metricDivider} />

          <MetricItem
            icon="flame-outline"
            title="Calories"
            value={`${calorieTarget}`}
            subtitle="Daily target"
          />

          <View style={styles.metricDivider} />

          <MetricItem
            icon="fitness-outline"
            title="Goal"
            value={
              profile?.goal === "lose"
                ? "Lose"
                : profile?.goal === "gain"
                ? "Gain"
                : "Maintain"
            }
            subtitle="Fitness goal"
          />
        </View>

        {/* =========================
            ACHIEVEMENTS
        ========================== */}

        <SectionHeader
          title="Achievements"
          icon="trophy-outline"
        />

        <View style={styles.achievementGrid}>
          {achievements.map(
            (achievement, index) => (
              <View
                key={index}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked &&
                    styles.lockedAchievement,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    !achievement.unlocked &&
                      styles.lockedIcon,
                  ]}
                >
                  <Ionicons
                    name={achievement.icon}
                    size={23}
                    color={
                      achievement.unlocked
                        ? PRIMARY
                        : "#AEB2C0"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.unlocked &&
                      styles.lockedText,
                  ]}
                >
                  {achievement.title}
                </Text>

                <Text
                  style={
                    styles.achievementDescription
                  }
                >
                  {achievement.description}
                </Text>

                {achievement.unlocked && (
                  <View
                    style={
                      styles.unlockedBadge
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={GREEN}
                    />

                    <Text
                      style={
                        styles.unlockedText
                      }
                    >
                      Unlocked
                    </Text>
                  </View>
                )}
              </View>
            )
          )}
        </View>

        {/* =========================
            QUICK ACTIONS
        ========================== */}

        <SectionHeader
          title="Quick Actions"
          icon="flash-outline"
        />

        <View style={styles.actionsCard}>
          <ActionRow
            icon="fitness-outline"
            title="Start Workout"
            subtitle="Complete today's workout"
            onPress={() =>
              router.push(
                "/workout-timer"
              )
            }
          />

          <ActionRow
            icon="scale-outline"
            title="Update Weight"
            subtitle="Record your latest weight"
            onPress={() =>
              router.push(
                "/weight-tracker" as any
              )
            }
          />

          <ActionRow
            icon="water-outline"
            title="Track Water"
            subtitle="Keep your hydration on track"
            onPress={() =>
              router.push(
                "/water-tracker"
              )
            }
          />
        </View>

        {/* =========================
            FOOTER
        ========================== */}

        <View style={styles.footer}>
          <Ionicons
            name="sparkles-outline"
            size={18}
            color={PRIMARY}
          />

          <Text style={styles.footerText}>
            Small progress every day creates
            big results.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// =====================================================
// STAT CARD
// =====================================================

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
};

function StatCard({
  icon,
  value,
  label,
  color,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              color + "15",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

type SectionHeaderProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function SectionHeader({
  title,
  icon,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={PRIMARY}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

// =====================================================
// METRIC ITEM
// =====================================================

type MetricItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
};

function MetricItem({
  icon,
  title,
  value,
  subtitle,
}: MetricItemProps) {
  return (
    <View style={styles.metricItem}>
      <Ionicons
        name={icon}
        size={22}
        color={PRIMARY}
      />

      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

// =====================================================
// ACTION ROW
// =====================================================

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
}: ActionRowProps) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={PRIMARY}
        />
      </View>

      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#A3A7B5"
      />
    </TouchableOpacity>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: TEXT,
  },

  subtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 5,
  },

  heroSubtitle: {
    color: "#E8E8FF",
    fontSize: 13,
    lineHeight: 19,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
  },

  statLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 2,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEEEFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 25,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bigNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT,
  },

  smallLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  weekBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8F2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  weekBadgeText: {
    fontSize: 11,
    color: GREEN,
    fontWeight: "700",
    marginLeft: 4,
  },

  chart: {
    height: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    marginTop: 15,
  },

  chartColumn: {
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    width: 30,
  },

  chartBar: {
    width: 18,
    borderRadius: 9,
    marginBottom: 8,
  },

  dayLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
  },

  activeDay: {
    color: PRIMARY,
    fontWeight: "800",
  },

  weightTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },

  weightNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
  },

  targetBox: {
    alignItems: "flex-end",
  },

  targetNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: PRIMARY,
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  changeText: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 5,
  },

  progressTrack: {
    height: 9,
    backgroundColor: "#ECECF4",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
  },

  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  progressLabel: {
    fontSize: 12,
    color: MUTED,
  },

  progressPercent: {
    fontSize: 12,
    fontWeight: "800",
    color: PRIMARY,
  },

  secondaryButton: {
    height: 45,
    borderRadius: 13,
    backgroundColor: "#F2F2FF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 16,
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: PRIMARY,
    marginLeft: 7,
  },

  hydrationTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  waterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EAF4FF",
    justifyContent: "center",
    alignItems: "center",
  },

  hydrationText: {
    flex: 1,
    marginLeft: 13,
  },

  hydrationValue: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT,
  },

  hydrationGoal: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
  },

  waterPercent: {
    fontSize: 20,
    fontWeight: "800",
    color: BLUE,
  },

  waterProgressFill: {
    height: "100%",
    backgroundColor: BLUE,
    borderRadius: 10,
  },

  metricsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  metricItem: {
    flex: 1,
    alignItems: "center",
  },

  metricTitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 7,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginTop: 3,
  },

  metricSubtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    textAlign: "center",
  },

  metricDivider: {
    width: 1,
    height: 65,
    backgroundColor: BORDER,
  },

  achievementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  achievementCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },

  lockedAchievement: {
    opacity: 0.65,
  },

  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EEEEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 11,
  },

  lockedIcon: {
    backgroundColor: "#F0F1F5",
  },

  achievementTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  lockedText: {
    color: "#7E8290",
  },

  achievementDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
    marginTop: 4,
  },

  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  unlockedText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: "700",
    marginLeft: 3,
  },

  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 25,
    overflow: "hidden",
  },

  actionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F4",
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEEEFF",
    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  actionSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 3,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  footerText: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 7,
  },
});