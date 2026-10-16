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

type WeightEntry = {
  id: string;
  weight: number;
  date: string;
};

type WeightData = {
  targetWeight: number;
  entries: WeightEntry[];
};

const STORAGE_KEY = "weightTracker";

export default function WeightTrackerScreen() {
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (data) {
        const parsed: WeightData = JSON.parse(data);

        setEntries(parsed.entries || []);
        setTargetWeight(
          parsed.targetWeight
            ? String(parsed.targetWeight)
            : ""
        );

        if (parsed.entries?.length) {
          setWeight(
            String(parsed.entries[0].weight)
          );
        }
      }
    } catch (error) {
      console.log("Weight load error:", error);
    } finally {
      setLoaded(true);
    }
  };

  const saveData = async (
    newEntries: WeightEntry[],
    newTarget: number
  ) => {
    try {
      const data: WeightData = {
        targetWeight: newTarget,
        entries: newEntries,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log("Weight save error:", error);
    }
  };

  const addWeight = async () => {
    const value = Number(weight);

    if (!value || value < 20 || value > 300) {
      Alert.alert(
        "Invalid weight",
        "Please enter a weight between 20 and 300 kg."
      );
      return;
    }

    const today = new Date();

    const date = today.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    const existingToday = entries.find(
      (item) => item.date === date
    );

    let updatedEntries: WeightEntry[];

    if (existingToday) {
      updatedEntries = entries.map((item) =>
        item.id === existingToday.id
          ? {
              ...item,
              weight: value,
            }
          : item
      );
    } else {
      updatedEntries = [
        {
          id: Date.now().toString(),
          weight: value,
          date,
        },
        ...entries,
      ];
    }

    updatedEntries.sort(
      (a, b) =>
        Number(b.id) - Number(a.id)
    );

    setEntries(updatedEntries);

    const target = Number(targetWeight) || 0;

    await saveData(updatedEntries, target);

    Alert.alert(
      "Weight Updated ✅",
      `Your weight is now ${value} kg.`
    );
  };

  const updateTarget = async () => {
    const target = Number(targetWeight);

    if (
      !target ||
      target < 20 ||
      target > 300
    ) {
      Alert.alert(
        "Invalid target",
        "Please enter a target between 20 and 300 kg."
      );
      return;
    }

    await saveData(entries, target);

    Alert.alert(
      "Target Updated 🎯",
      `Your target weight is ${target} kg.`
    );
  };

  const deleteEntry = (entry: WeightEntry) => {
    Alert.alert(
      "Delete Entry",
      `Remove ${entry.weight} kg from ${entry.date}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = entries.filter(
              (item) => item.id !== entry.id
            );

            setEntries(updated);

            await saveData(
              updated,
              Number(targetWeight) || 0
            );
          },
        },
      ]
    );
  };

  const currentWeight =
    entries.length > 0
      ? entries[0].weight
      : Number(weight) || 0;

  const previousWeight =
    entries.length > 1
      ? entries[1].weight
      : currentWeight;

  const weightChange =
    currentWeight - previousWeight;

  const target = Number(targetWeight) || 0;

  const remainingToTarget =
    target > 0
      ? currentWeight - target
      : 0;

  const progress = useMemo(() => {
    if (
      entries.length < 2 ||
      !target ||
      entries.length === 0
    ) {
      return 0;
    }

    const startingWeight =
      entries[entries.length - 1].weight;

    const totalDistance =
      Math.abs(startingWeight - target);

    const completedDistance =
      Math.abs(startingWeight - currentWeight);

    if (totalDistance === 0) return 100;

    return Math.min(
      Math.max(
        Math.round(
          (completedDistance /
            totalDistance) *
            100
        ),
        0
      ),
      100
    );
  }, [
    entries,
    target,
    currentWeight,
  ]);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

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
            Weight Tracker
          </Text>

          <Text style={styles.headerSubtitle}>
            Monitor your progress over time
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Current Weight */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            CURRENT WEIGHT
          </Text>

          <View style={styles.weightRow}>
            <Text style={styles.currentWeight}>
              {currentWeight || "--"}
            </Text>

            <Text style={styles.kg}>
              kg
            </Text>
          </View>

          {entries.length > 1 && (
            <View style={styles.changeBadge}>
              <Text
                style={[
                  styles.changeText,
                  weightChange > 0
                    ? styles.gainText
                    : styles.lossText,
                ]}
              >
                {weightChange > 0 ? "↑" : "↓"}{" "}
                {Math.abs(weightChange).toFixed(
                  1
                )} kg since last update
              </Text>
            </View>
          )}
        </View>

        {/* Add Weight */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Update Weight
          </Text>

          <Text style={styles.label}>
            Today's weight
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 72.5"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />

            <Text style={styles.unit}>
              kg
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={addWeight}
            >
              <Text style={styles.primaryText}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Target Weight 🎯
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 68"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />

            <Text style={styles.unit}>
              kg
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={updateTarget}
            >
              <Text style={styles.secondaryText}>
                Set Target
              </Text>
            </TouchableOpacity>
          </View>

          {target > 0 && (
            <View style={styles.targetInfo}>
              <Text style={styles.targetText}>
                {remainingToTarget > 0
                  ? `${remainingToTarget.toFixed(
                      1
                    )} kg to reach your target`
                  : "🎉 Target reached!"}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {progress}% progress
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>
          Weight Summary
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              ⚖️
            </Text>

            <Text style={styles.statValue}>
              {currentWeight || "--"}
            </Text>

            <Text style={styles.statLabel}>
              Current
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              🎯
            </Text>

            <Text style={styles.statValue}>
              {target || "--"}
            </Text>

            <Text style={styles.statLabel}>
              Target
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              📊
            </Text>

            <Text style={styles.statValue}>
              {entries.length}
            </Text>

            <Text style={styles.statLabel}>
              Entries
            </Text>
          </View>
        </View>

        {/* History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>
            Weight History
          </Text>

          <Text style={styles.historyCount}>
            {entries.length}
          </Text>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ⚖️
            </Text>

            <Text style={styles.emptyTitle}>
              No weight records yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first weight to start
              tracking your progress.
            </Text>
          </View>
        ) : (
          entries.map((entry, index) => (
            <View
              key={entry.id}
              style={styles.historyCard}
            >
              <View style={styles.historyIcon}>
                <Text>⚖️</Text>
              </View>

              <View style={styles.historyInfo}>
                <Text style={styles.historyWeight}>
                  {entry.weight} kg
                </Text>

                <Text style={styles.historyDate}>
                  {entry.date}
                </Text>
              </View>

              {index < entries.length - 1 && (
                <View style={styles.historyChange}>
                  <Text
                    style={{
                      color:
                        entry.weight <=
                        entries[index + 1]
                          .weight
                          ? "#16A36A"
                          : "#D95353",
                      fontWeight: "800",
                    }}
                  >
                    {entry.weight <=
                    entries[index + 1].weight
                      ? "↓"
                      : "↑"}{" "}
                    {Math.abs(
                      entry.weight -
                        entries[index + 1]
                          .weight
                    ).toFixed(1)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() =>
                  deleteEntry(entry)
                }
              >
                <Text style={styles.deleteText}>
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Tracking Tip
            </Text>

            <Text style={styles.tipText}>
              Weigh yourself under similar
              conditions each time, preferably
              around the same time of day.
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

  loading: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#5B5BD6",
    fontWeight: "700",
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

  heroCard: {
    backgroundColor: "#5B5BD6",
    borderRadius: 25,
    padding: 24,
    marginBottom: 18,
  },

  heroLabel: {
    color: "#DCDCFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  currentWeight: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  kg: {
    fontSize: 18,
    color: "#E5E5FF",
    marginLeft: 7,
    fontWeight: "700",
  },

  changeBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  changeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  lossText: {
    color: "#C9FFD9",
  },

  gainText: {
    color: "#FFE0E0",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 14,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777E8E",
    marginBottom: 7,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E1E3EA",
    borderRadius: 13,
    paddingHorizontal: 13,
    color: "#182235",
    fontWeight: "700",
  },

  unit: {
    marginLeft: -30,
    marginRight: 10,
    color: "#858B99",
    fontSize: 12,
    fontWeight: "700",
  },

  primaryButton: {
    height: 48,
    backgroundColor: "#5B5BD6",
    borderRadius: 13,
    paddingHorizontal: 17,
    justifyContent: "center",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  secondaryButton: {
    height: 48,
    backgroundColor: "#EEEEFF",
    borderRadius: 13,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  secondaryText: {
    color: "#5B5BD6",
    fontSize: 11,
    fontWeight: "800",
  },

  targetInfo: {
    marginTop: 18,
  },

  targetText: {
    color: "#5B5BD6",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 9,
  },

  progressTrack: {
    height: 9,
    backgroundColor: "#E8E9F2",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#5B5BD6",
    borderRadius: 10,
  },

  progressText: {
    color: "#8A90A0",
    fontSize: 10,
    marginTop: 6,
    textAlign: "right",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  statIcon: {
    fontSize: 20,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#182235",
    marginTop: 6,
  },

  statLabel: {
    color: "#858B99",
    fontSize: 9,
    marginTop: 2,
  },

  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyCount: {
    backgroundColor: "#EEEEFF",
    color: "#5B5BD6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 7,
    marginBottom: 12,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    flexDirection: "row",
    alignItems: "center",
  },

  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  historyInfo: {
    flex: 1,
  },

  historyWeight: {
    fontSize: 15,
    fontWeight: "800",
    color: "#182235",
  },

  historyDate: {
    fontSize: 10,
    color: "#858B99",
    marginTop: 3,
  },

  historyChange: {
    marginRight: 13,
  },

  deleteText: {
    fontSize: 16,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
    marginTop: 10,
  },

  emptyText: {
    color: "#858B99",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },

  tipCard: {
    marginTop: 18,
    backgroundColor: "#FFF9E8",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F4E8BF",
  },

  tipIcon: {
    fontSize: 22,
    marginRight: 10,
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