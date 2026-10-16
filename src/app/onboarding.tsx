import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";

import {
  saveFitnessProfile,
} from "../utils/fitnessStorage";

import {
  getUserAccount,
  setLoggedIn,
} from "../utils/authStorage";

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);

  // User name
  const [userName, setUserName] = useState("Fitness User");

  // Step 1
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [gender, setGender] =
    useState<"male" | "female">("male");

  // Step 2
  const [goal, setGoal] =
    useState<"lose" | "maintain" | "gain">("lose");

  // Step 3
  const [activity, setActivity] =
    useState<"low" | "moderate" | "high">("moderate");

  // Load account created during signup
  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const account = await getUserAccount();

      if (account) {
        setUserName(account.name);
      }
    } catch (error) {
      console.log("Error loading account:", error);
    }
  };

  // Continue button
  const handleNext = () => {
    if (step === 1) {
      if (!age || !height || !weight) {
        Alert.alert(
          "Missing information",
          "Please enter your age, height and weight."
        );
        return;
      }

      if (
        Number(age) <= 0 ||
        Number(height) <= 0 ||
        Number(weight) <= 0
      ) {
        Alert.alert(
          "Invalid information",
          "Please enter valid values."
        );
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      completeSetup();
    }
  };

  // Complete onboarding
  const completeSetup = async () => {
    try {
      const profile = {
        name: userName,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender,
        goal,
        activity,
      };

      // Save fitness profile
      await saveFitnessProfile(profile);

      // Create logged-in session
      await setLoggedIn();

      // Go to Home
      router.replace("/home");
    } catch (error) {
      console.log("Setup error:", error);

      Alert.alert(
        "Something went wrong",
        "We couldn't save your profile. Please try again."
      );
    }
  };

  const getGoalTitle = () => {
    if (goal === "lose") {
      return "Lose Weight";
    }

    if (goal === "gain") {
      return "Build Muscle";
    }

    return "Maintain Weight";
  };

  const getActivityTitle = () => {
    if (activity === "low") {
      return "Beginner";
    }

    if (activity === "high") {
      return "Very Active";
    }

    return "Moderately Active";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.stepText}>
              STEP {step} OF 3
            </Text>

            <Text style={styles.title}>
              {step === 1 &&
                "Tell us about yourself"}

              {step === 2 &&
                "What's your goal?"}

              {step === 3 &&
                "Your activity level"}
            </Text>
          </View>

          <Text style={styles.stepNumber}>
            {step}/3
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[
                styles.progressBar,
                item <= step &&
                  styles.progressActive,
              ]}
            />
          ))}
        </View>

        {/* ================= STEP 1 ================= */}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>
              Hi {userName.split(" ")[0]} 👋
              {"\n"}
              Let's personalize your fitness experience.
            </Text>

            {/* Age */}
            <Text style={styles.label}>
              Age
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="#9AA1B2"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />

            {/* Height */}
            <Text style={styles.label}>
              Height (cm)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 175"
              placeholderTextColor="#9AA1B2"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />

            {/* Weight */}
            <Text style={styles.label}>
              Weight (kg)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 70"
              placeholderTextColor="#9AA1B2"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              maxLength={5}
            />

            {/* Gender */}
            <Text style={styles.label}>
              Gender
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "male" &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setGender("male")
                }
              >
                <Text style={styles.genderIcon}>
                  ♂
                </Text>

                <Text
                  style={[
                    styles.optionText,
                    gender === "male" &&
                      styles.selectedOptionText,
                  ]}
                >
                  Male
                </Text>

                {gender === "male" && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "female" &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setGender("female")
                }
              >
                <Text style={styles.genderIcon}>
                  ♀
                </Text>

                <Text
                  style={[
                    styles.optionText,
                    gender === "female" &&
                      styles.selectedOptionText,
                  ]}
                >
                  Female
                </Text>

                {gender === "female" && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 2 ================= */}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>
              Choose your primary fitness goal.
              {"\n"}
              We'll personalize your recommendations around it.
            </Text>

            {/* Lose Weight */}
            <TouchableOpacity
              style={[
                styles.goalCard,
                goal === "lose" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setGoal("lose")
              }
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardEmoji}>
                  🔥
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Lose Weight
                </Text>

                <Text style={styles.cardDescription}>
                  Burn calories and reduce body fat
                </Text>
              </View>

              {goal === "lose" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Maintain */}
            <TouchableOpacity
              style={[
                styles.goalCard,
                goal === "maintain" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setGoal("maintain")
              }
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardEmoji}>
                  ⚖️
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Maintain Weight
                </Text>

                <Text style={styles.cardDescription}>
                  Stay healthy and maintain your current weight
                </Text>
              </View>

              {goal === "maintain" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Build Muscle */}
            <TouchableOpacity
              style={[
                styles.goalCard,
                goal === "gain" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setGoal("gain")
              }
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardEmoji}>
                  💪
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Build Muscle
                </Text>

                <Text style={styles.cardDescription}>
                  Build strength and increase muscle
                </Text>
              </View>

              {goal === "gain" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 3 ================= */}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>
              How active are you normally?
              {"\n"}
              This helps us calculate your training needs.
            </Text>

            {/* Beginner */}
            <TouchableOpacity
              style={[
                styles.activityCard,
                activity === "low" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setActivity("low")
              }
            >
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>
                  🚶
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Beginner
                </Text>

                <Text style={styles.cardDescription}>
                  Little or no regular exercise
                </Text>
              </View>

              {activity === "low" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Moderate */}
            <TouchableOpacity
              style={[
                styles.activityCard,
                activity === "moderate" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setActivity("moderate")
              }
            >
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>
                  🏃
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Moderately Active
                </Text>

                <Text style={styles.cardDescription}>
                  Exercise around 3–5 days per week
                </Text>
              </View>

              {activity === "moderate" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Very Active */}
            <TouchableOpacity
              style={[
                styles.activityCard,
                activity === "high" &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setActivity("high")
              }
            >
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>
                  🔥
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Very Active
                </Text>

                <Text style={styles.cardDescription}>
                  Hard training almost every day
                </Text>
              </View>

              {activity === "high" && (
                <Text style={styles.cardCheck}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Final Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Text>✨</Text>
                </View>

                <View>
                  <Text style={styles.summaryTitle}>
                    Your plan is ready
                  </Text>

                  <Text style={styles.summarySubtitle}>
                    Personalized for {userName}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Goal
                </Text>

                <Text style={styles.summaryValue}>
                  {getGoalTitle()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Activity
                </Text>

                <Text style={styles.summaryValue}>
                  {getActivityTitle()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Weight
                </Text>

                <Text style={styles.summaryValue}>
                  {weight} kg
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Continue / Complete Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {step === 3
              ? "Complete Setup"
              : "Continue"}
          </Text>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>

        {/* Back */}
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              setStep(step - 1)
            }
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  headerLeft: {
    flex: 1,
  },

  stepText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6257D4",
    letterSpacing: 1,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#182235",
    marginTop: 7,
    maxWidth: 310,
  },

  stepNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A91A2",
    marginBottom: 2,
  },

  progressContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 22,
  },

  progressBar: {
    height: 5,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#E2E4EB",
  },

  progressActive: {
    backgroundColor: "#5B5BD6",
  },

  section: {
    marginTop: 30,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#747C8E",
    marginBottom: 23,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#293247",
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E5EC",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#182235",
  },

  optionRow: {
    flexDirection: "row",
    gap: 12,
  },

  genderOption: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E5EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedOption: {
    borderColor: "#5B5BD6",
    backgroundColor: "#F1EFFF",
  },

  genderIcon: {
    fontSize: 20,
    color: "#5B5BD6",
    marginRight: 8,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#596174",
  },

  selectedOptionText: {
    color: "#5146C8",
  },

  check: {
    fontSize: 17,
    fontWeight: "900",
    color: "#5B5BD6",
    marginLeft: 8,
  },

  goalCard: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E5EC",
    marginBottom: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  activityCard: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E5EC",
    marginBottom: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedCard: {
    borderColor: "#5B5BD6",
    backgroundColor: "#F4F2FF",
  },

  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  cardEmoji: {
    fontSize: 22,
  },

  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  activityEmoji: {
    fontSize: 23,
  },

  cardContent: {
    flex: 1,
    marginLeft: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#202A3D",
  },

  cardDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#7A8293",
    marginTop: 4,
    paddingRight: 5,
  },

  cardCheck: {
    fontSize: 21,
    fontWeight: "900",
    color: "#5B5BD6",
    marginLeft: 8,
  },

  summaryCard: {
    marginTop: 8,
    backgroundColor: "#EEECFF",
    borderRadius: 18,
    padding: 17,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#4038A3",
    marginLeft: 11,
  },

  summarySubtitle: {
    fontSize: 11,
    color: "#716B99",
    marginLeft: 11,
    marginTop: 3,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#DCD8FA",
    marginVertical: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#716B99",
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4038A3",
  },

  button: {
    height: 56,
    backgroundColor: "#5B5BD6",
    borderRadius: 16,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
  },

  backButton: {
    alignItems: "center",
    paddingVertical: 17,
  },

  backText: {
    color: "#656D7E",
    fontSize: 14,
    fontWeight: "700",
  },
});