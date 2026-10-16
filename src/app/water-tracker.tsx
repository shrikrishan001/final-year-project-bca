import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "waterTracker";

type WaterData = {
  date: string;
  consumed: number;
  goal: number;
};

const getTodayKey = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
};

export default function WaterTrackerScreen() {
  const [goal, setGoal] = useState(2500);
  const [consumed, setConsumed] = useState(0);
  const [goalInput, setGoalInput] = useState("2500");

  const today = getTodayKey();

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (!data) return;

      const parsed: WaterData = JSON.parse(data);

      if (parsed.date === today) {
        setConsumed(parsed.consumed);
        setGoal(parsed.goal);
        setGoalInput(String(parsed.goal));
      } else {
        const freshData: WaterData = {
          date: today,
          consumed: 0,
          goal: parsed.goal || 2500,
        };

        setGoal(freshData.goal);
        setGoalInput(String(freshData.goal));

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(freshData)
        );
      }
    } catch (error) {
      console.log("Water load error:", error);
    }
  };

  const saveWaterData = async (
    newConsumed: number,
    newGoal: number = goal
  ) => {
    try {
      const data: WaterData = {
        date: today,
        consumed: newConsumed,
        goal: newGoal,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log("Water save error:", error);
    }
  };

  const addWater = async (amount: number) => {
    const newValue = Math.min(
      consumed + amount,
      goal * 1.5
    );

    setConsumed(newValue);

    await saveWaterData(newValue);
  };

  const removeWater = async (amount: number) => {
    const newValue = Math.max(
      consumed - amount,
      0
    );

    setConsumed(newValue);

    await saveWaterData(newValue);
  };

  const resetToday = () => {
    Alert.alert(
      "Reset today's water?",
      "Your water consumption will be reset to 0 ml.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setConsumed(0);
            await saveWaterData(0);
          },
        },
      ]
    );
  };

  const updateGoal = async () => {
    const newGoal = Number(goalInput);

    if (
      !newGoal ||
      newGoal < 500 ||
      newGoal > 10000
    ) {
      Alert.alert(
        "Invalid goal",
        "Please enter a goal between 500 ml and 10000 ml."
      );

      return;
    }

    setGoal(newGoal);

    await saveWaterData(consumed, newGoal);

    Alert.alert(
      "Goal Updated 💧",
      `Your daily goal is now ${newGoal} ml.`
    );
  };

  const percentage = useMemo(() => {
    if (goal <= 0) return 0;

    return Math.min(
      Math.round((consumed / goal) * 100),
      100
    );
  }, [consumed, goal]);

  const remaining = Math.max(
    goal - consumed,
    0
  );

  const glasses = Math.floor(consumed / 250);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Water Tracker
          </Text>

          <Text style={styles.headerSubtitle}>
            Stay hydrated throughout the day
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Main Progress Card */}
        <View style={styles.mainCard}>
          <View style={styles.waterCircle}>
            <View style={styles.circleInner}>
              <Text style={styles.waterEmoji}>
                💧
              </Text>

              <Text style={styles.percentage}>
                {percentage}%
              </Text>

              <Text style={styles.completedText}>
                of daily goal
              </Text>
            </View>
          </View>

          <Text style={styles.consumedText}>
            {consumed.toLocaleString()} ml
          </Text>

          <Text style={styles.goalText}>
            Daily goal: {goal.toLocaleString()} ml
          </Text>

          {remaining > 0 ? (
            <Text style={styles.remainingText}>
              {remaining.toLocaleString()} ml remaining
            </Text>
          ) : (
            <Text style={styles.successText}>
              🎉 Daily goal completed!
            </Text>
          )}
        </View>

        {/* Quick Add */}
        <Text style={styles.sectionTitle}>
          Quick Add
        </Text>

        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(250)}
          >
            <Text style={styles.quickEmoji}>
              🥤
            </Text>

            <Text style={styles.quickAmount}>
              +250 ml
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(500)}
          >
            <Text style={styles.quickEmoji}>
              💧
            </Text>

            <Text style={styles.quickAmount}>
              +500 ml
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(750)}
          >
            <Text style={styles.quickEmoji}>
              🫗
            </Text>

            <Text style={styles.quickAmount}>
              +750 ml
            </Text>
          </TouchableOpacity>
        </View>

        {/* Manual Controls */}
        <View style={styles.controlCard}>
          <Text style={styles.cardTitle}>
            Today's Water
          </Text>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.minusButton}
              onPress={() => removeWater(250)}
            >
              <Text style={styles.minusText}>
                −250
              </Text>
            </TouchableOpacity>

            <View style={styles.currentAmount}>
              <Text style={styles.currentValue}>
                {consumed.toLocaleString()}
              </Text>

              <Text style={styles.currentUnit}>
                ml
              </Text>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => addWater(250)}
            >
              <Text style={styles.plusText}>
                +250
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal */}
        <View style={styles.goalCard}>
          <Text style={styles.cardTitle}>
            Daily Water Goal
          </Text>

          <Text style={styles.goalDescription}>
            Recommended range for most adults:
            around 2–3 litres/day. Adjust based on
            activity, weather and your needs.
          </Text>

          <View style={styles.goalInputRow}>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              style={styles.goalInput}
              placeholder="2500"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.mlLabel}>
              ml
            </Text>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={updateGoal}
            >
              <Text style={styles.updateText}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>
          Today's Stats
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>
              🥛
            </Text>

            <Text style={styles.statValue}>
              {glasses}
            </Text>

            <Text style={styles.statLabel}>
              250 ml glasses
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>
              🎯
            </Text>

            <Text style={styles.statValue}>
              {goal.toLocaleString()}
            </Text>

            <Text style={styles.statLabel}>
              Daily goal
            </Text>
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetToday}
        >
          <Text style={styles.resetText}>
            Reset Today's Progress
          </Text>
        </TouchableOpacity>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Hydration Tip
            </Text>

            <Text style={styles.tipText}>
              Don't wait until you're thirsty.
              Drinking small amounts regularly
              throughout the day can help you
              stay hydrated.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E9EF",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F1F2FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 34,
    color: "#202A3D",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#182235",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#7B8190",
    marginTop: 3,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 24,
  },

  waterCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#E9F7FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#C9EDFF",
  },

  circleInner: {
    alignItems: "center",
  },

  waterEmoji: {
    fontSize: 30,
  },

  percentage: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1976B8",
    marginTop: 3,
  },

  completedText: {
    fontSize: 10,
    color: "#7B8190",
    marginTop: 2,
  },

  consumedText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#182235",
    marginTop: 20,
  },

  goalText: {
    fontSize: 12,
    color: "#7B8190",
    marginTop: 4,
  },

  remainingText: {
    marginTop: 10,
    color: "#1976B8",
    fontSize: 12,
    fontWeight: "700",
  },

  successText: {
    marginTop: 10,
    color: "#16A36A",
    fontSize: 12,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
  },

  quickRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  quickButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  quickEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },

  quickAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1976B8",
  },

  controlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 14,
  },

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  minusButton: {
    backgroundColor: "#FFF0F0",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  minusText: {
    color: "#D95353",
    fontWeight: "800",
    fontSize: 12,
  },

  currentAmount: {
    alignItems: "center",
  },

  currentValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#182235",
  },

  currentUnit: {
    fontSize: 10,
    color: "#8A90A0",
  },

  plusButton: {
    backgroundColor: "#EAF7FF",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  plusText: {
    color: "#1976B8",
    fontWeight: "800",
    fontSize: 12,
  },

  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 22,
  },

  goalDescription: {
    color: "#7B8190",
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 14,
  },

  goalInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  goalInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E1E3EA",
    borderRadius: 13,
    paddingHorizontal: 14,
    color: "#182235",
    fontWeight: "700",
  },

  mlLabel: {
    marginLeft: -28,
    marginRight: 12,
    color: "#8A90A0",
    fontSize: 12,
    fontWeight: "700",
  },

  updateButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#5B5BD6",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  updateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  statEmoji: {
    fontSize: 23,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#182235",
    marginTop: 7,
  },

  statLabel: {
    color: "#7B8190",
    fontSize: 10,
    marginTop: 3,
  },

  resetButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E4EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  resetText: {
    color: "#D95353",
    fontWeight: "800",
    fontSize: 12,
  },

  tipCard: {
    backgroundColor: "#FFF9E8",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F4E8BF",
  },

  tipEmoji: {
    fontSize: 23,
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    color: "#5E4D18",
    fontSize: 13,
    fontWeight: "800",
  },

  tipText: {
    color: "#786A3C",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});