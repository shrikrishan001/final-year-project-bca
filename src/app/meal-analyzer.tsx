import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

type NutritionResult = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recommendation: string;
};

export default function MealAnalyzerScreen() {
  const [meal, setMeal] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);

  const analyzeMeal = () => {
    const text = meal.toLowerCase().trim();

    if (!text) {
      return;
    }

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    // -------------------------
    // EGGS
    // -------------------------
    if (text.includes("egg")) {
      const count = getQuantity(text, "egg", 2);

      calories += count * 70;
      protein += count * 6;
      carbs += count * 0.5;
      fat += count * 5;
    }

    // -------------------------
    // ROTI / CHAPATI
    // -------------------------
    if (text.includes("roti") || text.includes("chapati")) {
      const count =
        getQuantity(text, "roti", 2) ||
        getQuantity(text, "chapati", 2);

      calories += count * 100;
      protein += count * 3;
      carbs += count * 18;
      fat += count * 2;
    }

    // -------------------------
    // RICE
    // -------------------------
    if (text.includes("rice")) {
      const bowls = getQuantity(text, "bowl", 1);

      calories += bowls * 205;
      protein += bowls * 4;
      carbs += bowls * 45;
      fat += bowls * 0.5;
    }

    // -------------------------
    // DAL
    // -------------------------
    if (text.includes("dal") || text.includes("daal")) {
      const bowls = getQuantity(text, "bowl", 1);

      calories += bowls * 180;
      protein += bowls * 10;
      carbs += bowls * 25;
      fat += bowls * 4;
    }

    // -------------------------
    // PANEER
    // -------------------------
    if (text.includes("paneer")) {
      const grams = getGramQuantity(text, 100);

      calories += grams * 2.65;
      protein += grams * 0.18;
      carbs += grams * 0.06;
      fat += grams * 0.20;
    }

    // -------------------------
    // CHICKEN
    // -------------------------
    if (text.includes("chicken")) {
      const grams = getGramQuantity(text, 150);

      calories += grams * 1.65;
      protein += grams * 0.31;
      carbs += grams * 0;
      fat += grams * 0.036;
    }

    // -------------------------
    // MILK
    // -------------------------
    if (text.includes("milk")) {
      const glasses = getQuantity(text, "glass", 1);

      calories += glasses * 120;
      protein += glasses * 6;
      carbs += glasses * 9;
      fat += glasses * 6;
    }

    // -------------------------
    // BANANA
    // -------------------------
    if (text.includes("banana")) {
      const count = getQuantity(text, "banana", 1);

      calories += count * 105;
      protein += count * 1.3;
      carbs += count * 27;
      fat += count * 0.4;
    }

    // -------------------------
    // APPLE
    // -------------------------
    if (text.includes("apple")) {
      const count = getQuantity(text, "apple", 1);

      calories += count * 95;
      protein += count * 0.5;
      carbs += count * 25;
      fat += count * 0.3;
    }

    // -------------------------
    // OATS
    // -------------------------
    if (text.includes("oat")) {
      const grams = getGramQuantity(text, 50);

      calories += grams * 3.89;
      protein += grams * 0.169;
      carbs += grams * 0.66;
      fat += grams * 0.069;
    }

    // -------------------------
    // BREAD
    // -------------------------
    if (text.includes("bread")) {
      const count = getQuantity(text, "bread", 2);

      calories += count * 75;
      protein += count * 3;
      carbs += count * 13;
      fat += count * 1;
    }

    // -------------------------
    // VEGETABLES
    // -------------------------
    if (
      text.includes("vegetable") ||
      text.includes("sabzi") ||
      text.includes("veggie")
    ) {
      const bowls = getQuantity(text, "bowl", 1);

      calories += bowls * 120;
      protein += bowls * 4;
      carbs += bowls * 15;
      fat += bowls * 5;
    }

    // -------------------------
    // SALAD
    // -------------------------
    if (text.includes("salad")) {
      calories += 60;
      protein += 2;
      carbs += 12;
      fat += 0.5;
    }

    // -------------------------
    // CURD / YOGURT
    // -------------------------
    if (text.includes("curd") || text.includes("yogurt")) {
      const bowls = getQuantity(text, "bowl", 1);

      calories += bowls * 100;
      protein += bowls * 5;
      carbs += bowls * 7;
      fat += bowls * 4;
    }

    // -------------------------
    // IF NOTHING DETECTED
    // -------------------------
    if (calories === 0) {
      calories = 300;
      protein = 10;
      carbs = 35;
      fat = 12;
    }

    const finalCalories = Math.round(calories);
    const finalProtein = Math.round(protein);
    const finalCarbs = Math.round(carbs);
    const finalFat = Math.round(fat);

    let recommendation =
      "This meal looks reasonably balanced. Try to include vegetables, enough protein and stay hydrated.";

    if (finalProtein < 15) {
      recommendation =
        "This meal appears low in protein. Consider adding eggs, paneer, chicken, dal, curd or another protein-rich food.";
    } else if (finalCarbs > 80) {
      recommendation =
        "This meal is relatively high in carbohydrates. Consider adding more vegetables and protein while keeping portions balanced.";
    } else if (finalFat > 30) {
      recommendation =
        "This meal may be relatively high in fat. Keep oil, fried foods and high-fat ingredients moderate.";
    } else if (finalProtein >= 25) {
      recommendation =
        "Good protein intake! Add vegetables or salad for extra fiber and micronutrients, and keep your hydration on track.";
    }

    setResult({
      calories: finalCalories,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      recommendation,
    });

    setAnalyzed(true);
  };

  // --------------------------------
  // GET SIMPLE NUMBER QUANTITY
  // --------------------------------
  const getQuantity = (
    text: string,
    word: string,
    defaultValue: number
  ): number => {
    const regex = new RegExp(`(\\d+)\\s*${word}`, "i");
    const match = text.match(regex);

    if (match) {
      return Number(match[1]);
    }

    // words like "two eggs"
    if (word === "egg" && text.includes("two")) {
      return 2;
    }

    if (word === "roti" && text.includes("two")) {
      return 2;
    }

    if (word === "banana" && text.includes("two")) {
      return 2;
    }

    return defaultValue;
  };

  // --------------------------------
  // GET GRAM QUANTITY
  // --------------------------------
  const getGramQuantity = (
    text: string,
    defaultValue: number
  ): number => {
    const match = text.match(/(\d+)\s*(g|gram|grams)/i);

    if (match) {
      return Number(match[1]);
    }

    return defaultValue;
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
            <Text style={styles.headerTitle}>Meal Analyzer</Text>
            <Text style={styles.headerSubtitle}>
              Understand your meal better
            </Text>
          </View>
        </View>

        {/* INTRO CARD */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>🥗</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              AI Nutrition Analyzer
            </Text>

            <Text style={styles.heroText}>
              Enter what you ate and get an estimated nutrition
              breakdown with personalized guidance.
            </Text>
          </View>
        </View>

        {/* INPUT */}

        <Text style={styles.sectionTitle}>What did you eat?</Text>

        <View style={styles.inputCard}>
          <TextInput
            value={meal}
            onChangeText={(text) => {
              setMeal(text);
              setAnalyzed(false);
            }}
            placeholder="Example: 2 eggs, 2 roti and 1 bowl dal"
            placeholderTextColor="#969CAA"
            multiline
            textAlignVertical="top"
            style={styles.input}
          />

          <Text style={styles.inputHint}>
            Add quantities when possible for a better estimate.
          </Text>
        </View>

        {/* EXAMPLES */}

        <Text style={styles.sectionTitle}>Try an example</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.examplesScroll}
        >
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() =>
              setMeal("2 eggs, 2 roti and 1 bowl dal")
            }
          >
            <Text style={styles.exampleText}>
              🍳 Eggs + Roti
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() =>
              setMeal("1 bowl rice, dal and vegetables")
            }
          >
            <Text style={styles.exampleText}>
              🍚 Rice + Dal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() =>
              setMeal("100g paneer, 2 roti and salad")
            }
          >
            <Text style={styles.exampleText}>
              🥘 Paneer Meal
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ANALYZE BUTTON */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.analyzeButton,
            !meal.trim() && styles.analyzeButtonDisabled,
          ]}
          onPress={analyzeMeal}
          disabled={!meal.trim()}
        >
          <Text style={styles.analyzeButtonText}>
            ✨ Analyze Meal
          </Text>
        </TouchableOpacity>

        {/* RESULT */}

        {analyzed && result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              🍽️ Meal Analysis
            </Text>

            <Text style={styles.mealName}>{meal}</Text>

            {/* CALORIES */}

            <View style={styles.calorieCard}>
              <Text style={styles.calorieLabel}>
                Estimated Calories
              </Text>

              <Text style={styles.calorieNumber}>
                {result.calories}
              </Text>

              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            {/* MACROS */}

            <View style={styles.macroRow}>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {result.protein} g
                </Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {result.carbs} g
                </Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {result.fat} g
                </Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>

            {/* COACH RECOMMENDATION */}

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                💡 Coach Recommendation
              </Text>

              <Text style={styles.recommendationText}>
                {result.recommendation}
              </Text>
            </View>

            {/* NOTE */}

            <Text style={styles.disclaimer}>
              Nutrition values are estimates and may vary depending
              on ingredients, quantities and preparation methods.
            </Text>
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
    marginTop: 5,
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    padding: 15,
    marginBottom: 20,
  },

  input: {
    minHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    color: "#182235",
  },

  inputHint: {
    fontSize: 12,
    color: "#969CAA",
    marginTop: 8,
  },

  examplesScroll: {
    marginBottom: 20,
  },

  exampleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginRight: 8,
  },

  exampleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5362",
  },

  analyzeButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#5548D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  analyzeButtonDisabled: {
    backgroundColor: "#B9BBD0",
  },

  analyzeButtonText: {
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
    marginBottom: 7,
  },

  mealName: {
    fontSize: 14,
    lineHeight: 20,
    color: "#737B8C",
    marginBottom: 18,
  },

  calorieCard: {
    backgroundColor: "#F1F2FF",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  calorieLabel: {
    fontSize: 13,
    color: "#6F7586",
    marginBottom: 5,
  },

  calorieNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#5548D9",
  },

  calorieUnit: {
    fontSize: 13,
    color: "#777E8D",
    marginTop: 1,
  },

  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  macroCard: {
    width: "31.5%",
    backgroundColor: "#F7F8FC",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  macroValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#273044",
  },

  macroLabel: {
    fontSize: 11,
    color: "#858C9B",
    marginTop: 4,
  },

  recommendationCard: {
    backgroundColor: "#F1F2FF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },

  recommendationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5548D9",
    marginBottom: 6,
  },

  recommendationText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#646B7B",
  },

  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: "#9A9FAB",
  },
});