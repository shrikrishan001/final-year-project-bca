import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function StopwatchScreen() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor(
      (milliseconds % 60000) / 1000
    );
    const centiseconds = Math.floor(
      (milliseconds % 1000) / 10
    );

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}.${String(
      centiseconds
    ).padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setRunning((prev) => !prev);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!running) return;

    setLaps((prev) => [
      ...prev,
      time,
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Stopwatch
            </Text>

            <Text style={styles.headerSubtitle}>
              Track your workout time
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Timer */}

        <View style={styles.timerCard}>
          <View style={styles.timerIcon}>
            <Text style={styles.timerEmoji}>
              ⏱️
            </Text>
          </View>

          <Text style={styles.timerLabel}>
            WORKOUT TIME
          </Text>

          <Text style={styles.timerText}>
            {formatTime(time)}
          </Text>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                running && styles.statusDotActive,
              ]}
            />

            <Text style={styles.statusText}>
              {running ? "Running" : "Ready"}
            </Text>
          </View>
        </View>

        {/* Controls */}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetIcon}>↻</Text>

            <Text style={styles.resetText}>
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.startButton,
              running && styles.pauseButton,
            ]}
            onPress={handleStartPause}
          >
            <Text style={styles.startIcon}>
              {running ? "Ⅱ" : "▶"}
            </Text>

            <Text style={styles.startText}>
              {running ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.lapButton,
              !running && styles.disabledButton,
            ]}
            onPress={handleLap}
            disabled={!running}
          >
            <Text style={styles.lapIcon}>
              + 
            </Text>

            <Text style={styles.lapText}>
              Lap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workout Stats */}

        <Text style={styles.sectionTitle}>
          Workout Session
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.floor(time / 60000)}
            </Text>

            <Text style={styles.statLabel}>
              Minutes
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {laps.length}
            </Text>

            <Text style={styles.statLabel}>
              Laps
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {running ? "ON" : "OFF"}
            </Text>

            <Text style={styles.statLabel}>
              Status
            </Text>
          </View>
        </View>

        {/* Laps */}

        {laps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Lap Times
            </Text>

            <View style={styles.lapsCard}>
              {laps
                .slice()
                .reverse()
                .map((lapTime, index) => {
                  const lapNumber =
                    laps.length - index;

                  return (
                    <View
                      key={`${lapNumber}-${lapTime}`}
                      style={styles.lapRow}
                    >
                      <View style={styles.lapNumber}>
                        <Text
                          style={styles.lapNumberText}
                        >
                          {lapNumber}
                        </Text>
                      </View>

                      <Text style={styles.lapTitle}>
                        Lap {lapNumber}
                      </Text>

                      <Text style={styles.lapTime}>
                        {formatTime(lapTime)}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* Tip */}

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Workout Tip
            </Text>

            <Text style={styles.tipText}>
              Use the stopwatch to track running,
              cardio, HIIT or any timed workout.
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 32,
    color: "#202A3D",
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#182235",
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#858C9B",
    marginTop: 3,
  },

  headerSpacer: {
    width: 44,
  },

  timerCard: {
    backgroundColor: "#5B5BD6",
    borderRadius: 26,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 18,
  },

  timerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  timerEmoji: {
    fontSize: 27,
  },

  timerLabel: {
    color: "#DCD9FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  timerText: {
    color: "#FFFFFF",
    fontSize: 43,
    fontWeight: "900",
    marginTop: 7,
    letterSpacing: 1,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 13,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DCD9FF",
    marginRight: 6,
  },

  statusDotActive: {
    backgroundColor: "#FFFFFF",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  controlsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  resetButton: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    justifyContent: "center",
    alignItems: "center",
  },

  resetIcon: {
    fontSize: 20,
    color: "#5B5BD6",
  },

  resetText: {
    fontSize: 10,
    color: "#5B5BD6",
    fontWeight: "800",
    marginTop: 2,
  },

  startButton: {
    flex: 1.4,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#5B5BD6",
    justifyContent: "center",
    alignItems: "center",
  },

  pauseButton: {
    backgroundColor: "#E05252",
  },

  startIcon: {
    color: "#FFFFFF",
    fontSize: 19,
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  lapButton: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  lapIcon: {
    fontSize: 20,
    color: "#5B5BD6",
  },

  lapText: {
    fontSize: 10,
    color: "#5B5BD6",
    fontWeight: "800",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#182235",
    marginBottom: 13,
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 28,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#202A3D",
  },

  statLabel: {
    fontSize: 10,
    color: "#858C9B",
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#ECEEF3",
  },

  lapsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 20,
  },

  lapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },

  lapNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  lapNumberText: {
    color: "#5B5BD6",
    fontSize: 11,
    fontWeight: "900",
  },

  lapTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#394257",
    fontWeight: "700",
  },

  lapTime: {
    fontSize: 13,
    color: "#202A3D",
    fontWeight: "900",
  },

  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  tipIcon: {
    fontSize: 23,
  },

  tipContent: {
    flex: 1,
    marginLeft: 12,
  },

  tipTitle: {
    fontSize: 14,
    color: "#202A3D",
    fontWeight: "800",
  },

  tipText: {
    fontSize: 11,
    color: "#858C9B",
    lineHeight: 17,
    marginTop: 4,
  },
});