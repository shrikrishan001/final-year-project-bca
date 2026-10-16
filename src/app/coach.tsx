import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

export default function CoachScreen() {
  const [screen, setScreen] = useState<
    "main" | "workout" | "nutrition" | "calories"
  >("main");

  // Calories form
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");

  const [calories, setCalories] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);

  const [message, setMessage] = useState("");

const [messages, setMessages] = useState<
  { id: number; text: string; sender: "user" | "ai" }[]
>([
  {
    id: 1,
    text: "Hi! I'm your AI Fitness Coach. How can I help you today?",
    sender: "ai",
  },
]);

const sendMessage = () => {
  if (!message.trim()) {
    return;
  }

  const userMessage = {
    id: Date.now(),
    text: message.trim(),
    sender: "user" as const,
  };

  setMessages((prev) => [...prev, userMessage]);

  const userText = message.trim().toLowerCase();

  setMessage("");

  let aiReply =
    "I'm your AI Fitness Coach. I can help you with workouts, nutrition, calories and fitness goals.";

  if (
    userText.includes("workout") ||
    userText.includes("exercise")
  ) {
    aiReply =
      "For a beginner workout, start with 5 minutes of warm-up followed by squats, push-ups, lunges and a short cool-down.";
  } else if (
    userText.includes("food") ||
    userText.includes("nutrition") ||
    userText.includes("diet")
  ) {
    aiReply =
      "Try to include a good protein source, vegetables, whole grains and enough water in your daily meals.";
  } else if (
    userText.includes("calorie") ||
    userText.includes("calories")
  ) {
    aiReply =
      "I can estimate your daily calorie needs. Open the Calories section and enter your age, weight, height, activity level and goal.";
  } else if (
    userText.includes("weight loss") ||
    userText.includes("lose weight")
  ) {
    aiReply =
      "For gradual weight loss, focus on a sustainable calorie deficit, regular strength training, sufficient protein and daily activity.";
  }

  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text: aiReply,
        sender: "ai",
      },
    ]);
  }, 700);
};

  // ---------------- CALCULATE CALORIES ----------------

  const calculateCalories = () => {
    const ageValue = Number(age);
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!ageValue || !weightValue || !heightValue) {
      return;
    }

    let calculatedBmr = 0;

    if (gender === "male") {
      calculatedBmr =
        10 * weightValue +
        6.25 * heightValue -
        5 * ageValue +
        5;
    } else {
      calculatedBmr =
        10 * weightValue +
        6.25 * heightValue -
        5 * ageValue -
        161;
    }

    let multiplier = 1.2;

    if (activity === "light") {
      multiplier = 1.375;
    } else if (activity === "moderate") {
      multiplier = 1.55;
    } else if (activity === "high") {
      multiplier = 1.725;
    }

    const maintenanceCalories = calculatedBmr * multiplier;

    let targetCalories = maintenanceCalories;

    if (goal === "lose") {
      targetCalories = maintenanceCalories - 400;
    } else if (goal === "gain") {
      targetCalories = maintenanceCalories + 300;
    }

    setBmr(Math.round(calculatedBmr));
    setCalories(Math.round(targetCalories));
  };

  // ---------------- WORKOUT SCREEN ----------------

  if (screen === "workout") {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen("main")}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>💪 Workout Plan</Text>

          <Text style={styles.subtitle}>
            Your personalized workout plan
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🔥 Today's Workout</Text>

            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>🏃 Warm-up</Text>
              <Text style={styles.exerciseTime}>5 minutes</Text>
            </View>

            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>💪 Push Ups</Text>
              <Text style={styles.exerciseTime}>3 × 12 reps</Text>
            </View>

            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>🦵 Squats</Text>
              <Text style={styles.exerciseTime}>3 × 15 reps</Text>
            </View>

            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>🏋️ Lunges</Text>
              <Text style={styles.exerciseTime}>3 × 10 reps</Text>
            </View>

            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>🧘 Cool Down</Text>
              <Text style={styles.exerciseTime}>5 minutes</Text>
            </View>
          </View>

          <View style={styles.goalCard}>
            <Text style={styles.cardTitle}>🎯 Today's Goal</Text>
            <Text style={styles.goalText}>
              Complete your workout and try to reach 8,000 steps today.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------- NUTRITION SCREEN ----------------

  if (screen === "nutrition") {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen("main")}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>🥗 Nutrition Advice</Text>

          <Text style={styles.subtitle}>
            Healthy meal suggestions for your day
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🌅 Breakfast</Text>
            <Text style={styles.mealText}>
              🥚 Eggs + whole wheat toast{"\n"}
              🍌 One banana{"\n"}
              🥛 A glass of milk
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>☀️ Lunch</Text>
            <Text style={styles.mealText}>
              🍚 Brown rice{"\n"}
              🥗 Mixed vegetables{"\n"}
              🍗 Grilled chicken / paneer
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🌙 Dinner</Text>
            <Text style={styles.mealText}>
              🥗 Salad{"\n"}
              🍲 Dal{"\n"}
              🫓 2 chapatis
            </Text>
          </View>

          <View style={styles.goalCard}>
            <Text style={styles.cardTitle}>💧 Hydration</Text>
            <Text style={styles.goalText}>
              Try to drink around 2–3 litres of water throughout the day.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------- CALORIES SCREEN ----------------

  if (screen === "calories") {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen("main")}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>🔥 Calories</Text>

          <Text style={styles.subtitle}>
            Calculate your daily calorie requirement
          </Text>

          {/* AGE */}

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Age</Text>

            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor="#9AA0AE"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* WEIGHT */}

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>

            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter your weight"
              placeholderTextColor="#9AA0AE"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* HEIGHT */}

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Height (cm)</Text>

            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="Enter your height"
              placeholderTextColor="#9AA0AE"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* GENDER */}

          <Text style={styles.sectionLabel}>Gender</Text>

          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                gender === "male" && styles.choiceSelected,
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={[
                  styles.choiceText,
                  gender === "male" && styles.choiceTextSelected,
                ]}
              >
                👨 Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                gender === "female" && styles.choiceSelected,
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={[
                  styles.choiceText,
                  gender === "female" && styles.choiceTextSelected,
                ]}
              >
                👩 Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVITY */}

          <Text style={styles.sectionLabel}>Activity Level</Text>

          <TouchableOpacity
            style={[
              styles.activityButton,
              activity === "light" && styles.choiceSelected,
            ]}
            onPress={() => setActivity("light")}
          >
            <Text style={styles.activityTitle}>🚶 Light Activity</Text>
            <Text style={styles.activityDescription}>
              Light exercise 1–3 days/week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.activityButton,
              activity === "moderate" && styles.choiceSelected,
            ]}
            onPress={() => setActivity("moderate")}
          >
            <Text style={styles.activityTitle}>🏃 Moderate Activity</Text>
            <Text style={styles.activityDescription}>
              Exercise 3–5 days/week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.activityButton,
              activity === "high" && styles.choiceSelected,
            ]}
            onPress={() => setActivity("high")}
          >
            <Text style={styles.activityTitle}>🔥 High Activity</Text>
            <Text style={styles.activityDescription}>
              Hard exercise 6–7 days/week
            </Text>
          </TouchableOpacity>

          {/* GOAL */}

          <Text style={styles.sectionLabel}>Your Goal</Text>

          <View style={styles.goalRow}>
            <TouchableOpacity
              style={[
                styles.goalButton,
                goal === "lose" && styles.choiceSelected,
              ]}
              onPress={() => setGoal("lose")}
            >
              <Text style={styles.goalButtonText}>⬇️</Text>
              <Text style={styles.goalButtonLabel}>Lose</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.goalButton,
                goal === "maintain" && styles.choiceSelected,
              ]}
              onPress={() => setGoal("maintain")}
            >
              <Text style={styles.goalButtonText}>⚖️</Text>
              <Text style={styles.goalButtonLabel}>Maintain</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.goalButton,
                goal === "gain" && styles.choiceSelected,
              ]}
              onPress={() => setGoal("gain")}
            >
              <Text style={styles.goalButtonText}>⬆️</Text>
              <Text style={styles.goalButtonLabel}>Gain</Text>
            </TouchableOpacity>
          </View>

          {/* CALCULATE BUTTON */}

          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateCalories}
          >
            <Text style={styles.calculateText}>
              Calculate My Calories
            </Text>
          </TouchableOpacity>

          {/* RESULT */}

          {calories !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                🎯 Your Daily Calories
              </Text>

              <Text style={styles.calorieNumber}>
                {calories}
              </Text>

              <Text style={styles.calorieUnit}>
                calories / day
              </Text>

              <View style={styles.resultDivider} />

              <Text style={styles.resultSmall}>
                Your estimated BMR
              </Text>

              <Text style={styles.bmrText}>
                {bmr} calories
              </Text>

              <Text style={styles.resultMessage}>
                {goal === "lose"
                  ? "A moderate calorie deficit can support gradual weight loss."
                  : goal === "gain"
                  ? "A moderate calorie surplus can support gradual weight gain."
                  : "This is an estimated maintenance calorie target."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ---------------- MAIN SCREEN ----------------

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* AI ICON */}

        <View style={styles.aiIcon}>
          <Text style={styles.aiIconText}>✦</Text>
        </View>

        <Text style={styles.title}>Your Personal AI Coach</Text>

        <Text style={styles.subtitle}>
          Get personalized workouts, nutrition tips and fitness guidance.
        </Text>

        {/* ASK AI */}

           <TouchableOpacity
                activeOpacity={0.8}
                style={styles.askCard}
                onPress={() => router.push("/ai-chat")}
                >
          <Text style={styles.askTitle}>How can I help you?</Text>

          <Text style={styles.askText}>
            Ask me about workouts, nutrition, calories or your fitness goals.
          </Text>
        </TouchableOpacity>

        {/* QUICK QUESTIONS */}

        <Text style={styles.sectionTitle}>Quick Questions</Text>

        {/* WORKOUT */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionCard}
         onPress={() => router.push("/workout-generator")}
        >
          <Text style={styles.optionEmoji}>💪</Text>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Workout Plan</Text>

            <Text style={styles.optionDescription}>
              Create a personalized workout
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* NUTRITION */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionCard}
          onPress={() => router.push("/meal-analyzer")}
        >
          <Text style={styles.optionEmoji}>🥗</Text>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Nutrition Advice</Text>

            <Text style={styles.optionDescription}>
              Get healthy meal suggestions
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* CALORIES */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionCard}
          onPress={() => setScreen("calories")}
        >
          <Text style={styles.optionEmoji}>🔥</Text>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Calories</Text>

            <Text style={styles.optionDescription}>
              Calculate your daily calorie needs
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* FITNESS PROFILE */}

<TouchableOpacity
  activeOpacity={0.8}
  style={styles.optionCard}
  onPress={() => router.push("/fitness-profile")}
>
  <Text style={styles.optionEmoji}>👤</Text>

  <View style={styles.optionContent}>
    <Text style={styles.optionTitle}>
      Fitness Profile
    </Text>

    <Text style={styles.optionDescription}>
      Manage your personal fitness information
    </Text>
  </View>

  <Text style={styles.arrow}>›</Text>
</TouchableOpacity>

{/* PROGRESS */}

<TouchableOpacity
  activeOpacity={0.8}
  style={styles.optionCard}
  onPress={() => router.push("/progress")}
>
  <Text style={styles.optionEmoji}>📊</Text>

  <View style={styles.optionContent}>
    <Text style={styles.optionTitle}>
      Progress
    </Text>

    <Text style={styles.optionDescription}>
      Track your fitness progress and activity
    </Text>
  </View>

  <Text style={styles.arrow}>›</Text>
</TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    padding: 24,
    paddingTop: 55,
    paddingBottom: 50,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 15,
  },

  backText: {
    fontSize: 18,
    color: "#4F46E5",
    fontWeight: "600",
  },

  aiIcon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: "#EEF0FF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 25,
  },

  aiIconText: {
    fontSize: 70,
    color: "#5548D9",
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#182235",
    textAlign: "center",
    marginBottom: 18,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 30,
    color: "#8A91A2",
    textAlign: "center",
    marginBottom: 35,
  },

  askCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E3E4E8",
    marginBottom: 35,
  },

  askTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 14,
  },

  askText: {
    fontSize: 18,
    lineHeight: 29,
    color: "#858C9B",
  },

  sectionTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 20,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    flexDirection: "row",
    alignItems: "center",
  },

  optionEmoji: {
    fontSize: 48,
    width: 70,
    textAlign: "center",
  },

  optionContent: {
    flex: 1,
    marginLeft: 15,
  },

  optionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 7,
  },

  optionDescription: {
    fontSize: 16,
    color: "#8A91A2",
    lineHeight: 23,
  },

  arrow: {
    fontSize: 34,
    color: "#8A91A2",
    marginLeft: 10,
  },

  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E1E2E7",
  },

  cardTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 18,
  },

  exercise: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF2",
  },

  exerciseName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#30394A",
  },

  exerciseTime: {
    fontSize: 16,
    color: "#737B8C",
  },

  goalCard: {
    backgroundColor: "#EEF0FF",
    borderRadius: 25,
    padding: 24,
    marginTop: 20,
  },

  goalText: {
    fontSize: 17,
    lineHeight: 27,
    color: "#5F6677",
  },

  mealText: {
    fontSize: 18,
    lineHeight: 34,
    color: "#5F6677",
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E1E2E7",
  },

  inputLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#30394A",
    marginBottom: 10,
  },

  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#182235",
  },

  sectionLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#182235",
    marginTop: 18,
    marginBottom: 12,
  },

  choiceRow: {
    flexDirection: "row",
    gap: 12,
  },

  choiceButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E2E7",
  },

  choiceSelected: {
    backgroundColor: "#EEF0FF",
    borderColor: "#5548D9",
  },

  choiceText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5F6677",
  },

  choiceTextSelected: {
    color: "#5548D9",
  },

  activityButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 19,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E2E7",
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#30394A",
    marginBottom: 6,
  },

  activityDescription: {
    fontSize: 15,
    color: "#8A91A2",
  },

  goalRow: {
    flexDirection: "row",
    gap: 10,
  },

  goalButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E2E7",
  },

  goalButtonText: {
    fontSize: 24,
    marginBottom: 5,
  },

  goalButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F6677",
  },

  calculateButton: {
    backgroundColor: "#5548D9",
    borderRadius: 20,
    paddingVertical: 19,
    alignItems: "center",
    marginTop: 30,
  },

  calculateText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  resultCard: {
    backgroundColor: "#202D3D",
    borderRadius: 28,
    padding: 28,
    marginTop: 25,
    alignItems: "center",
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
  },

  calorieNumber: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "900",
    marginTop: 12,
  },

  calorieUnit: {
    color: "#B9C2D0",
    fontSize: 17,
  },

  resultDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#435062",
    marginVertical: 20,
  },

  resultSmall: {
    color: "#B9C2D0",
    fontSize: 15,
  },

  bmrText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 5,
  },

  resultMessage: {
    color: "#D5DAE2",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
});