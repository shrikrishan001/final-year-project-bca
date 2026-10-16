import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { completeWorkout } from "../utils/workoutStorage";

type TimerMode = "work" | "rest";

export default function WorkoutTimer() {
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(15);
  const [rounds, setRounds] = useState(5);

  const [currentRound, setCurrentRound] = useState(1);
  const [mode, setMode] = useState<TimerMode>("work");
  const [remaining, setRemaining] = useState(30);

  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  // -----------------------------
  // TIMER
  // -----------------------------

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        handlePhaseComplete();
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode, currentRound]);

  // -----------------------------
  // PHASE COMPLETE
  // -----------------------------

  const handlePhaseComplete = () => {
    // WORK -> REST
    if (mode === "work") {
      setMode("rest");
      setRemaining(restSeconds);
      return;
    }

    // REST -> NEXT ROUND
    if (currentRound < rounds) {
      setCurrentRound((prev) => prev + 1);
      setMode("work");
      setRemaining(workSeconds);
      return;
    }

    // WORKOUT COMPLETE
    setRunning(false);
    setCompleted(true);

    completeWorkout().catch((error) => {
      console.log("Workout completion error:", error);
    });
  };

  // -----------------------------
  // START / PAUSE
  // -----------------------------

  const handleStartPause = () => {
    if (completed) {
      resetTimer();
      setRunning(true);
      return;
    }

    setRunning((prev) => !prev);
  };

  // -----------------------------
  // RESET
  // -----------------------------

  const resetTimer = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentRound(1);
    setMode("work");
    setRemaining(workSeconds);
  };

  // -----------------------------
  // SETTINGS
  // -----------------------------

  const increaseWork = () => {
    const newValue = Math.min(workSeconds + 5, 300);

    setWorkSeconds(newValue);

    if (!running && mode === "work") {
      setRemaining(newValue);
    }
  };

  const decreaseWork = () => {
    const newValue = Math.max(workSeconds - 5, 5);

    setWorkSeconds(newValue);

    if (!running && mode === "work") {
      setRemaining(newValue);
    }
  };

  const increaseRest = () => {
    setRestSeconds((prev) => Math.min(prev + 5, 180));
  };

  const decreaseRest = () => {
    setRestSeconds((prev) => Math.max(prev - 5, 5));
  };

  const increaseRounds = () => {
    setRounds((prev) => Math.min(prev + 1, 30));
  };

  const decreaseRounds = () => {
    setRounds((prev) => Math.max(prev - 1, 1));
  };

  // -----------------------------
  // PRESETS
  // -----------------------------

  const applyPreset = (
    work: number,
    rest: number,
    totalRounds: number
  ) => {
    setRunning(false);
    setCompleted(false);

    setWorkSeconds(work);
    setRestSeconds(rest);
    setRounds(totalRounds);

    setCurrentRound(1);
    setMode("work");
    setRemaining(work);
  };

  // -----------------------------
  // FORMAT TIME
  // -----------------------------

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // -----------------------------
  // CURRENT PHASE
  // -----------------------------

  const phaseTitle = completed
    ? "Workout Complete 🎉"
    : mode === "work"
    ? "WORK"
    : "REST";

  const phaseColor =
    mode === "work"
      ? "#5B5BD6"
      : "#20A36A";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Workout Timer
            </Text>

            <Text style={styles.headerSubtitle}>
              Train with intervals
            </Text>
          </View>
        </View>

        {/* HERO TIMER */}

        <View style={styles.timerCard}>
          <Text
            style={[
              styles.phaseText,
              {
                color: completed
                  ? "#20A36A"
                  : phaseColor,
              },
            ]}
          >
            {phaseTitle}
          </Text>

          <Text style={styles.timerText}>
            {formatTime(remaining)}
          </Text>

          {!completed && (
            <Text style={styles.roundText}>
              Round {currentRound} of {rounds}
            </Text>
          )}

          {completed && (
            <Text style={styles.completeText}>
              Great job! You completed your workout.
            </Text>
          )}

          {/* PROGRESS */}

          {!completed && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      ((currentRound - 1) / rounds) *
                        100 +
                      (mode === "rest"
                        ? 50 / rounds
                        : 0)
                    }%`,
                  },
                ]}
              />
            </View>
          )}

          {/* MAIN BUTTON */}

          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: completed
                  ? "#20A36A"
                  : "#5B5BD6",
              },
            ]}
            onPress={handleStartPause}
          >
            <Text style={styles.startButtonText}>
              {completed
                ? "Restart Workout"
                : running
                ? "Pause"
                : "Start Workout"}
            </Text>
          </TouchableOpacity>

          {/* RESET */}

          {!completed && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetTimer}
            >
              <Text style={styles.resetText}>
                Reset Timer
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QUICK PRESETS */}

        <Text style={styles.sectionTitle}>
          Quick Presets
        </Text>

        <View style={styles.presetGrid}>
          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              applyPreset(20, 10, 8)
            }
          >
            <Text style={styles.presetIcon}>
              ⚡
            </Text>

            <Text style={styles.presetTitle}>
              Tabata
            </Text>

            <Text style={styles.presetSubtitle}>
              20s / 10s × 8
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              applyPreset(30, 15, 5)
            }
          >
            <Text style={styles.presetIcon}>
              🔥
            </Text>

            <Text style={styles.presetTitle}>
              HIIT
            </Text>

            <Text style={styles.presetSubtitle}>
              30s / 15s × 5
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              applyPreset(45, 15, 6)
            }
          >
            <Text style={styles.presetIcon}>
              💪
            </Text>

            <Text style={styles.presetTitle}>
              Strength
            </Text>

            <Text style={styles.presetSubtitle}>
              45s / 15s × 6
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              applyPreset(60, 30, 5)
            }
          >
            <Text style={styles.presetIcon}>
              🏃
            </Text>

            <Text style={styles.presetTitle}>
              Cardio
            </Text>

            <Text style={styles.presetSubtitle}>
              60s / 30s × 5
            </Text>
          </TouchableOpacity>
        </View>

        {/* SETTINGS */}

        <Text style={styles.sectionTitle}>
          Timer Settings
        </Text>

        <View style={styles.settingsCard}>
          {/* WORK */}

          <SettingRow
            icon="🏋️"
            title="Work Time"
            value={`${workSeconds}s`}
            onMinus={decreaseWork}
            onPlus={increaseWork}
          />

          <View style={styles.divider} />

          {/* REST */}

          <SettingRow
            icon="😮‍💨"
            title="Rest Time"
            value={`${restSeconds}s`}
            onMinus={decreaseRest}
            onPlus={increaseRest}
          />

          <View style={styles.divider} />

          {/* ROUNDS */}

          <SettingRow
            icon="🔁"
            title="Rounds"
            value={`${rounds}`}
            onMinus={decreaseRounds}
            onPlus={increaseRounds}
          />
        </View>

        {/* WORKOUT INFO */}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            💡
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              How it works
            </Text>

            <Text style={styles.infoText}>
              Work during the active interval,
              rest when the timer switches, and
              complete all rounds to finish your
              workout.
            </Text>
          </View>
        </View>

        {/* BACK HOME */}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.homeButtonText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// =====================================================
// SETTING ROW
// =====================================================

type SettingRowProps = {
  icon: string;
  title: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
};

function SettingRow({
  icon,
  title,
  value,
  onMinus,
  onPlus,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Text style={styles.settingIcon}>
            {icon}
          </Text>
        </View>

        <Text style={styles.settingTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.counter}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={onMinus}
        >
          <Text style={styles.counterText}>
            −
          </Text>
        </TouchableOpacity>

        <Text style={styles.counterValue}>
          {value}
        </Text>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={onPlus}
        >
          <Text style={styles.counterText}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
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
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  backText: {
    fontSize: 32,
    color: "#182235",
    lineHeight: 34,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#182235",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#8B91A3",
    marginTop: 3,
  },

  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 26,
  },

  phaseText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  timerText: {
    fontSize: 64,
    fontWeight: "800",
    color: "#182235",
    letterSpacing: 2,
  },

  roundText: {
    fontSize: 14,
    color: "#8B91A3",
    marginTop: 5,
  },

  completeText: {
    fontSize: 14,
    color: "#20A36A",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
  },

  progressContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#ECECF4",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 22,
    marginBottom: 24,
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#5B5BD6",
    borderRadius: 10,
  },

  startButton: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resetButton: {
    marginTop: 14,
    paddingVertical: 8,
  },

  resetText: {
    color: "#6D7283",
    fontSize: 14,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 14,
  },

  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  presetCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  presetIcon: {
    fontSize: 26,
    marginBottom: 10,
  },

  presetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
  },

  presetSubtitle: {
    fontSize: 12,
    color: "#8B91A3",
    marginTop: 4,
  },

  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 20,
  },

  settingRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  settingIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1F1FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  settingIcon: {
    fontSize: 20,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#252C3D",
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  counterButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F1FB",
    justifyContent: "center",
    alignItems: "center",
  },

  counterText: {
    fontSize: 21,
    fontWeight: "700",
    color: "#5B5BD6",
  },

  counterValue: {
    minWidth: 42,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: "#182235",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF3",
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F0F0FF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3434A0",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5F6380",
  },

  homeButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E9",
    justifyContent: "center",
    alignItems: "center",
  },

  homeButtonText: {
    color: "#5B5BD6",
    fontSize: 15,
    fontWeight: "800",
  },
});