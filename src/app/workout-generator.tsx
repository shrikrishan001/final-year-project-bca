import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  getFitnessProfile,
  FitnessProfile,
} from "../utils/fitnessStorage";

type Exercise = {
  name: string;
  details: string;
};

export default function WorkoutGeneratorScreen() {
  const [profile, setProfile] = useState<FitnessProfile | null>(null);

  const [goal, setGoal] = useState("Weight Loss");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("30 min");
  const [equipment, setEquipment] = useState("No Equipment");

  const [generated, setGenerated] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadFitnessProfile();
  }, []);

  const loadFitnessProfile = async () => {
    const savedProfile = await getFitnessProfile();

    if (!savedProfile) {
      return;
    }

    setProfile(savedProfile);

    // Goal from Fitness Profile
    if (savedProfile.goal === "lose") {
      setGoal("Weight Loss");
    } else if (savedProfile.goal === "gain") {
      setGoal("Muscle Gain");
    } else {
      setGoal("General Fitness");
    }

    // Activity → Fitness Level
    if (savedProfile.activity === "low") {
      setLevel("Beginner");
    } else if (savedProfile.activity === "moderate") {
      setLevel("Intermediate");
    } else {
      setLevel("Advanced");
    }
  };

  const generateWorkout = () => {
    let workout: Exercise[] = [];

    /*
     * WEIGHT LOSS
     */

    if (goal === "Weight Loss") {
      if (equipment === "Gym") {
        workout = [
          {
            name: "Treadmill Intervals",
            details: "5 min warm-up + 10 min intervals",
          },
          {
            name: "Goblet Squats",
            details: "3 sets × 12 reps",
          },
          {
            name: "Dumbbell Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Mountain Climbers",
            details: "3 sets × 30 seconds",
          },
          {
            name: "Jumping Jacks",
            details: "3 sets × 40 seconds",
          },
        ];
      } else if (equipment === "Home") {
        workout = [
          {
            name: "Bodyweight Squats",
            details: "3 sets × 15 reps",
          },
          {
            name: "Reverse Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Mountain Climbers",
            details: "3 sets × 30 seconds",
          },
          {
            name: "Jumping Jacks",
            details: "3 sets × 40 seconds",
          },
          {
            name: "High Knees",
            details: "3 sets × 30 seconds",
          },
        ];
      } else {
        workout = [
          {
            name: "Bodyweight Squats",
            details: "3 sets × 15 reps",
          },
          {
            name: "Walking Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Mountain Climbers",
            details: "3 sets × 30 seconds",
          },
          {
            name: "Jumping Jacks",
            details: "3 sets × 40 seconds",
          },
          {
            name: "Plank",
            details: "3 × 30 seconds",
          },
        ];
      }
    }

    /*
     * MUSCLE GAIN
     */

    else if (goal === "Muscle Gain") {
      if (equipment === "Gym") {
        workout = [
          {
            name: "Barbell Squats",
            details: "4 sets × 8 reps",
          },
          {
            name: "Bench Press",
            details: "4 sets × 8 reps",
          },
          {
            name: "Lat Pulldown",
            details: "3 sets × 10 reps",
          },
          {
            name: "Shoulder Press",
            details: "3 sets × 10 reps",
          },
          {
            name: "Bicep Curls",
            details: "3 sets × 12 reps",
          },
        ];
      } else if (equipment === "Home") {
        workout = [
          {
            name: "Push Ups",
            details: "4 sets × 10 reps",
          },
          {
            name: "Bodyweight Squats",
            details: "4 sets × 12 reps",
          },
          {
            name: "Pike Push Ups",
            details: "3 sets × 8 reps",
          },
          {
            name: "Glute Bridges",
            details: "3 sets × 15 reps",
          },
          {
            name: "Plank",
            details: "3 × 40 seconds",
          },
        ];
      } else {
        workout = [
          {
            name: "Push Ups",
            details: "4 sets × 10 reps",
          },
          {
            name: "Bodyweight Squats",
            details: "4 sets × 12 reps",
          },
          {
            name: "Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Pike Push Ups",
            details: "3 sets × 8 reps",
          },
          {
            name: "Plank",
            details: "3 × 40 seconds",
          },
        ];
      }
    }

    /*
     * GENERAL FITNESS
     */

    else {
      if (equipment === "Gym") {
        workout = [
          {
            name: "Goblet Squats",
            details: "3 sets × 12 reps",
          },
          {
            name: "Dumbbell Row",
            details: "3 sets × 10 reps",
          },
          {
            name: "Dumbbell Press",
            details: "3 sets × 10 reps",
          },
          {
            name: "Walking Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Plank",
            details: "3 × 30 seconds",
          },
        ];
      } else if (equipment === "Home") {
        workout = [
          {
            name: "Bodyweight Squats",
            details: "3 sets × 12 reps",
          },
          {
            name: "Push Ups",
            details: "3 sets × 10 reps",
          },
          {
            name: "Reverse Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Glute Bridges",
            details: "3 sets × 15 reps",
          },
          {
            name: "Plank",
            details: "3 × 30 seconds",
          },
        ];
      } else {
        workout = [
          {
            name: "Bodyweight Squats",
            details: "3 sets × 12 reps",
          },
          {
            name: "Push Ups",
            details: "3 sets × 10 reps",
          },
          {
            name: "Walking Lunges",
            details: "3 sets × 10 reps",
          },
          {
            name: "Glute Bridges",
            details: "3 sets × 15 reps",
          },
          {
            name: "Plank",
            details: "3 × 30 seconds",
          },
        ];
      }
    }

    /*
     * BEGINNER ADJUSTMENT
     */

    if (level === "Beginner") {
      workout = workout.map((exercise) => {
        if (exercise.name === "Barbell Squats") {
          return {
            name: "Bodyweight Squats",
            details: "3 sets × 10 reps",
          };
        }

        if (exercise.name === "Bench Press") {
          return {
            name: "Incline Push Ups",
            details: "3 sets × 8 reps",
          };
        }

        if (exercise.name === "Shoulder Press") {
          return {
            name: "Wall Shoulder Press",
            details: "3 sets × 10 reps",
          };
        }

        return exercise;
      });
    }

    /*
     * ADVANCED ADJUSTMENT
     */

    if (level === "Advanced") {
      workout = workout.map((exercise) => {
        if (exercise.name === "Bodyweight Squats") {
          return {
            name: "Jump Squats",
            details: "4 sets × 15 reps",
          };
        }

        if (exercise.name === "Push Ups") {
          return {
            name: "Decline Push Ups",
            details: "4 sets × 12 reps",
          };
        }

        if (exercise.name === "Walking Lunges") {
          return {
            name: "Jumping Lunges",
            details: "4 sets × 12 reps",
          };
        }

        return exercise;
      });
    }

    /*
     * DURATION
     */

    if (duration === "15 min") {
      workout = workout.slice(0, 3);
    }

    if (duration === "30 min") {
      workout = workout.slice(0, 4);
    }

    if (duration === "45 min") {
      workout = workout.slice(0, 5);
    }

    if (duration === "60 min") {
      workout = [
        ...workout,
        {
          name: "Cool Down Stretch",
          details: "5 minutes",
        },
      ];
    }

    setExercises(workout);
    setGenerated(true);
  };

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
              Workout Generator
            </Text>

            <Text style={styles.headerSubtitle}>
              Create your personalized workout
            </Text>
          </View>
        </View>

        {/* INTRO */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>💪</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              AI Workout Planner
            </Text>

            <Text style={styles.heroText}>
              Tell us your goal and preferences. We'll create a
              workout designed for you.
            </Text>

            {profile && (
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>
                  ✓ Using your fitness profile
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* GOAL */}

        <Text style={styles.sectionTitle}>
          What's your goal?
        </Text>

        <View style={styles.optionGrid}>
          {["Weight Loss", "Muscle Gain", "General Fitness"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  goal === item &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setGoal(item);
                  setGenerated(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    goal === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* LEVEL */}

        <Text style={styles.sectionTitle}>
          Fitness level
        </Text>

        <View style={styles.optionGrid}>
          {["Beginner", "Intermediate", "Advanced"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  level === item &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setLevel(item);
                  setGenerated(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    level === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* DURATION */}

        <Text style={styles.sectionTitle}>
          Workout duration
        </Text>

        <View style={styles.optionGrid}>
          {["15 min", "30 min", "45 min", "60 min"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  duration === item &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setDuration(item);
                  setGenerated(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    duration === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* EQUIPMENT */}

        <Text style={styles.sectionTitle}>
          Available equipment
        </Text>

        <View style={styles.optionGrid}>
          {["No Equipment", "Home", "Gym"].map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                equipment === item &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => {
                setEquipment(item);
                setGenerated(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  equipment === item &&
                    styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PROFILE */}

        {profile && (
          <View style={styles.profileInfoCard}>
            <Text style={styles.profileInfoTitle}>
              👤 Your Profile
            </Text>

            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>
                Weight
              </Text>

              <Text style={styles.profileInfoValue}>
                {profile.weight} kg
              </Text>
            </View>

            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>
                Height
              </Text>

              <Text style={styles.profileInfoValue}>
                {profile.height} cm
              </Text>
            </View>

            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>
                Activity
              </Text>

              <Text style={styles.profileInfoValue}>
                {profile.activity}
              </Text>
            </View>
          </View>
        )}

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Your preferences
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Goal</Text>

            <Text style={styles.summaryValue}>
              {goal}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Level</Text>

            <Text style={styles.summaryValue}>
              {level}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Duration
            </Text>

            <Text style={styles.summaryValue}>
              {duration}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Equipment
            </Text>

            <Text style={styles.summaryValue}>
              {equipment}
            </Text>
          </View>
        </View>

        {/* GENERATE */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.generateButton}
          onPress={generateWorkout}
        >
          <Text style={styles.generateButtonText}>
            ✨ Generate Workout
          </Text>
        </TouchableOpacity>

        {/* RESULT */}

        {generated && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              🔥 Your Workout
            </Text>

            <Text style={styles.resultSubtitle}>
              {duration} • {level} • {goal}
            </Text>

            {exercises.map((exercise, index) => (
              <View
                style={styles.exerciseCard}
                key={`${exercise.name}-${index}`}
              >
                <Text style={styles.exerciseNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>

                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>
                    {exercise.name}
                  </Text>

                  <Text style={styles.exerciseDetails}>
                    {exercise.details}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>
                💡 Coach Tip
              </Text>

              <Text style={styles.tipText}>
                {goal === "Weight Loss"
                  ? "Keep your rest periods short and maintain a steady pace throughout the workout."
                  : goal === "Muscle Gain"
                  ? "Focus on controlled movements and gradually increase resistance over time."
                  : "Focus on proper form, controlled movements and consistency."}
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  backText: {
    fontSize: 32,
    color: "#182235",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#182235",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#8A91A2",
    marginTop: 3,
  },

  heroCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    padding: 18,
    marginBottom: 28,
  },

  heroIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  heroIconText: {
    fontSize: 27,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 5,
  },

  heroText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#737B8C",
  },

  profileBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF0FF",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },

  profileBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5548D9",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
    marginTop: 5,
  },

  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  optionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
  },

  optionButtonSelected: {
    backgroundColor: "#5548D9",
    borderColor: "#5548D9",
  },

  optionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5F6675",
  },

  optionTextSelected: {
    color: "#FFFFFF",
  },

  profileInfoCard: {
    backgroundColor: "#EEF0FF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
  },

  profileInfoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 10,
  },

  profileInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  profileInfoLabel: {
    fontSize: 13,
    color: "#737B8C",
  },

  profileInfoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3E4655",
    textTransform: "capitalize",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    padding: 18,
    marginTop: 5,
    marginBottom: 15,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#858C9B",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3E4655",
  },

  generateButton: {
    backgroundColor: "#5548D9",
    borderRadius: 18,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    padding: 18,
  },

  resultTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#182235",
  },

  resultSubtitle: {
    fontSize: 13,
    color: "#858C9B",
    marginTop: 5,
    marginBottom: 17,
  },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 17,
    padding: 13,
    marginBottom: 10,
  },

  exerciseNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5548D9",
    width: 30,
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#273044",
  },

  exerciseDetails: {
    fontSize: 13,
    color: "#858C9B",
    marginTop: 3,
  },

  tipCard: {
    backgroundColor: "#F1F2FF",
    borderRadius: 17,
    padding: 15,
    marginTop: 8,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5548D9",
    marginBottom: 5,
  },

  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#646B7B",
  },
});