import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getFitnessProfile } from "../utils/fitnessStorage";

type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

type Meal = {
  id: string;
  name: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
};

type NutritionData = {
  meals: Meal[];
  waterByDate: Record<string, number>;
};

const STORAGE_KEY = "nutritionTracker";
const WATER_GOAL = 2500;

const COLORS = {
  background: "#101110",
  card: "#1C1D1B",
  cardLight: "#272825",
  border: "#343630",
  primary: "#B8EF50",
  text: "#F7F8F4",
  muted: "#A6A99F",
  purple: "#C49AFF",
  blue: "#69BFFF",
  pink: "#FF8DB5",
  red: "#FF7777",
};

const categories: {
  name: MealCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "Breakfast", icon: "sunny-outline" },
  { name: "Lunch", icon: "restaurant-outline" },
  { name: "Dinner", icon: "moon-outline" },
  { name: "Snacks", icon: "nutrition-outline" },
];

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyData: NutritionData = {
  meals: [],
  waterByDate: {},
};

export default function NutritionScreen() {
  const [data, setData] = useState<NutritionData>(emptyData);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MealCategory>("Breakfast");

  const [foodName, setFoodName] = useState("");
  const [caloriesInput, setCaloriesInput] = useState("");
  const [proteinInput, setProteinInput] = useState("");
  const [carbsInput, setCarbsInput] = useState("");
  const [fatInput, setFatInput] = useState("");

  const today = getTodayKey();

  useEffect(() => {
    loadNutrition();
  }, []);

  const loadNutrition = async () => {
    try {
      const [saved, profile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        getFitnessProfile(),
      ]);

      if (saved) {
        const parsed = JSON.parse(saved);

        setData({
          meals: Array.isArray(parsed.meals)
            ? parsed.meals
            : [],
          waterByDate: parsed.waterByDate || {},
        });
      }

      if (profile) {
        const { age, weight, height, gender, activity, goal } =
          profile;

        let bmr =
          10 * weight +
          6.25 * height -
          5 * age +
          (gender === "male" ? 5 : -161);

        const multiplier =
          activity === "high"
            ? 1.725
            : activity === "moderate"
            ? 1.55
            : 1.2;

        let target = bmr * multiplier;

        if (goal === "lose") target -= 400;
        if (goal === "gain") target += 300;

        setCalorieGoal(Math.max(1200, Math.round(target)));
      }
    } catch (error) {
      console.log("Nutrition loading error:", error);
      Alert.alert("Error", "Nutrition data load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updated: NutritionData) => {
    setData(updated);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log("Nutrition save error:", error);
      Alert.alert("Error", "Data save nahi ho saka.");
    }
  };

  const todayMeals = useMemo(
    () => data.meals.filter((meal) => meal.date === today),
    [data.meals, today]
  );

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (sum, meal) => ({
        calories: sum.calories + meal.calories,
        protein: sum.protein + meal.protein,
        carbs: sum.carbs + meal.carbs,
        fat: sum.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const water = data.waterByDate[today] || 0;
  const caloriesLeft = calorieGoal - totals.calories;
  const calorieProgress = Math.min(
    totals.calories / calorieGoal,
    1
  );

  const addWater = async () => {
    const updated: NutritionData = {
      ...data,
      waterByDate: {
        ...data.waterByDate,
        [today]: water + 250,
      },
    };

    await saveData(updated);
  };

  const openAddMeal = (category: MealCategory) => {
    setSelectedCategory(category);
    setFoodName("");
    setCaloriesInput("");
    setProteinInput("");
    setCarbsInput("");
    setFatInput("");
    setModalVisible(true);
  };

  const addMeal = async () => {
    const name = foodName.trim();
    const calories = Number(caloriesInput);
    const protein = Number(proteinInput || 0);
    const carbs = Number(carbsInput || 0);
    const fat = Number(fatInput || 0);

    if (!name) {
      Alert.alert("Food required", "Food ka naam enter karo.");
      return;
    }

    if (
      caloriesInput.trim() === "" ||
      !Number.isFinite(calories) ||
      calories < 0 ||
      !Number.isFinite(protein) ||
      protein < 0 ||
      !Number.isFinite(carbs) ||
      carbs < 0 ||
      !Number.isFinite(fat) ||
      fat < 0
    ) {
      Alert.alert(
        "Invalid values",
        "Calories aur macros ki valid values enter karo."
      );
      return;
    }

    const meal: Meal = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      category: selectedCategory,
      calories,
      protein,
      carbs,
      fat,
      date: today,
    };

    await saveData({
      ...data,
      meals: [...data.meals, meal],
    });

    setModalVisible(false);
  };

  const deleteMeal = (id: string) => {
    Alert.alert("Delete meal", "Is food entry ko delete karein?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void saveData({
            ...data,
            meals: data.meals.filter((meal) => meal.id !== id),
          });
        },
      },
    ]);
  };

  const macroPercent = (value: number, goal: number) =>
    Math.min((value / goal) * 100, 100);

  const formatDate = () =>
    new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading nutrition...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.pageTitle}>Nutrition</Text>
            <Text style={styles.subtitle}>
              Fuel your fitness journey
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              router.push("/fitness-profile" as any)
            }
          >
            <Ionicons
              name="settings-outline"
              size={23}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* Calories card */}
        <View style={styles.calorieCard}>
          <Text style={styles.eyebrow}>DAILY CALORIE BUDGET</Text>

          <View style={styles.calorieRow}>
            <View style={styles.ringWrap}>
              <View style={styles.ringOuter}>
                <View
                  style={[
                    styles.ringInner,
                    {
                      borderColor:
                        totals.calories > calorieGoal
                          ? COLORS.red
                          : COLORS.primary,
                    },
                  ]}
                >
                  <Text style={styles.ringPercent}>
                    {Math.round(
                      (totals.calories / calorieGoal) * 100
                    )}
                    %
                  </Text>
                  <Text style={styles.ringLabel}>used</Text>
                </View>
              </View>
            </View>

            <View style={styles.calorieDetails}>
              <Text
                style={[
                  styles.caloriesLeft,
                  caloriesLeft < 0 && { color: COLORS.red },
                ]}
              >
                {Math.abs(caloriesLeft).toLocaleString()}
              </Text>
              <Text style={styles.calorieLeftLabel}>
                {caloriesLeft >= 0 ? "kcal left" : "kcal over"}
              </Text>

              <View style={styles.calorieStats}>
                <Text style={styles.mutedText}>Eaten</Text>
                <Text style={styles.statNumber}>
                  {totals.calories.toLocaleString()}
                </Text>
              </View>

              <View style={styles.calorieStats}>
                <Text style={styles.mutedText}>Budget</Text>
                <Text style={styles.statNumber}>
                  {calorieGoal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${calorieProgress * 100}%`,
                  backgroundColor:
                    totals.calories > calorieGoal
                      ? COLORS.red
                      : COLORS.primary,
                },
              ]}
            />
          </View>

          <Text style={styles.cardFootnote}>
            Your target is an estimate based on your fitness profile.
          </Text>
        </View>

        {/* Macros */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <Text style={styles.sectionCaption}>Today</Text>
        </View>

        <View style={styles.macroRow}>
          <MacroCard
            name="Protein"
            value={totals.protein}
            goal={130}
            color={COLORS.purple}
            icon="fitness-outline"
            percent={macroPercent(totals.protein, 130)}
          />
          <MacroCard
            name="Carbs"
            value={totals.carbs}
            goal={220}
            color={COLORS.blue}
            icon="leaf-outline"
            percent={macroPercent(totals.carbs, 220)}
          />
          <MacroCard
            name="Fat"
            value={totals.fat}
            goal={65}
            color={COLORS.pink}
            icon="water-outline"
            percent={macroPercent(totals.fat, 65)}
          />
        </View>

        {/* Water */}
        <View style={styles.waterCard}>
          <View style={styles.waterTop}>
            <View style={styles.waterIcon}>
              <Ionicons
                name="water"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.waterTitle}>Water intake</Text>
              <Text style={styles.waterValue}>
                {water.toLocaleString()} / {WATER_GOAL.toLocaleString()} ml
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addWaterButton}
              onPress={addWater}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add"
                size={20}
                color="#141710"
              />
              <Text style={styles.addWaterText}>250 ml</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (water / WATER_GOAL) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.cardFootnote}>
            Daily hydration goal: {WATER_GOAL / 1000} litres
          </Text>
        </View>

        {/* Meals */}
        <View style={styles.mealHeading}>
          <View>
            <Text style={styles.sectionTitle}>Today's meals</Text>
            <Text style={styles.sectionCaption}>
              {todayMeals.length} food{" "}
              {todayMeals.length === 1 ? "entry" : "entries"} logged
            </Text>
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() =>
              router.push("/food-scanner" as any)
            }
          >
            <Ionicons
              name="scan-outline"
              size={19}
              color="#151711"
            />
            <Text style={styles.scanButtonText}>Analyze</Text>
          </TouchableOpacity>
        </View>

        {categories.map((category) => {
          const meals = todayMeals.filter(
            (meal) => meal.category === category.name
          );

          const categoryCalories = meals.reduce(
            (sum, meal) => sum + meal.calories,
            0
          );

          return (
            <View key={category.name} style={styles.mealSection}>
              <View style={styles.mealCategoryHeader}>
                <View style={styles.mealCategoryIcon}>
                  <Ionicons
                    name={category.icon}
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.mealCategoryTitle}>
                    {category.name}
                  </Text>
                  <Text style={styles.mealCategorySubtitle}>
                    {meals.length
                      ? `${categoryCalories} kcal`
                      : "Nothing logged yet"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addMealButton}
                  onPress={() => openAddMeal(category.name)}
                >
                  <Ionicons
                    name="add"
                    size={23}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {meals.map((meal) => (
                <View key={meal.id} style={styles.foodRow}>
                  <View style={styles.foodIcon}>
                    <Ionicons
                      name="restaurant-outline"
                      size={19}
                      color={COLORS.muted}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{meal.name}</Text>
                    <Text style={styles.foodMacros}>
                      P {meal.protein} g · C {meal.carbs} g · F{" "}
                      {meal.fat} g
                    </Text>
                  </View>

                  <View style={styles.foodCaloriesWrap}>
                    <Text style={styles.foodCalories}>
                      {meal.calories}
                    </Text>
                    <Text style={styles.foodKcal}>kcal</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteMeal(meal.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={COLORS.muted}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {/* Daily summary */}
        <View style={styles.summaryCard}>
          <Ionicons
            name="analytics-outline"
            size={24}
            color={COLORS.primary}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Daily summary</Text>
            <Text style={styles.summarySubtitle}>
              {todayMeals.length === 0
                ? "Add your meals to see your nutrition totals."
                : `${totals.calories} kcal consumed from ${calorieGoal} kcal target.`}
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Nutrition values depend on the amounts and ingredients you enter.
        </Text>
      </ScrollView>

      {/* Add meal modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add food</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCategory} · Today's diary
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Food name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Roti, dal, paneer"
                placeholderTextColor={COLORS.muted}
                value={foodName}
                onChangeText={setFoodName}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 250"
                placeholderTextColor={COLORS.muted}
                value={caloriesInput}
                onChangeText={setCaloriesInput}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Macros (grams)</Text>
              <View style={styles.macroInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Protein</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    value={proteinInput}
                    onChangeText={setProteinInput}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Carbs</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    value={carbsInput}
                    onChangeText={setCarbsInput}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Fat</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    value={fatInput}
                    onChangeText={setFatInput}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.formHint}>
                Enter nutrition values from a food label or a reliable
                nutrition source.
              </Text>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={addMeal}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#151711"
                />
                <Text style={styles.saveButtonText}>
                  Save food entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function MacroCard({
  name,
  value,
  goal,
  color,
  icon,
  percent,
}: {
  name: string;
  value: number;
  goal: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  percent: number;
}) {
  return (
    <View style={styles.macroCard}>
      <View style={styles.macroIcon}>
        <Ionicons name={icon} size={19} color={color} />
      </View>

      <Text style={styles.macroName}>{name}</Text>

      <Text style={styles.macroValue}>
        {Math.round(value)}
        <Text style={styles.macroGoal}> / {goal} g</Text>
      </Text>

      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            {
              width: `${percent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  headerButton: {
    width: 46,
    height: 46,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 27,
  },
  eyebrow: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  ringWrap: {
    width: 125,
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 9,
    borderColor: "#34382C",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  ringLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  calorieDetails: {
    flex: 1,
    marginLeft: 16,
  },
  caloriesLeft: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "900",
  },
  calorieLeftLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 1,
    marginBottom: 15,
  },
  calorieStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    gap: 8,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#393B34",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  cardFootnote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 11,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },
  sectionCaption: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  macroRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 26,
  },
  macroCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 11,
  },
  macroIcon: {
    marginBottom: 8,
  },
  macroName: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  macroValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 6,
  },
  macroGoal: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "500",
  },
  macroTrack: {
    height: 5,
    backgroundColor: "#393B34",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },
  macroFill: {
    height: "100%",
    borderRadius: 8,
  },
  waterCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
  },
  waterTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  waterIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#303729",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  waterTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  waterValue: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  addWaterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  addWaterText: {
    color: "#151711",
    fontSize: 11,
    fontWeight: "900",
  },
  mealHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scanButtonText: {
    color: "#151711",
    fontWeight: "800",
    fontSize: 12,
  },
  mealSection: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    paddingHorizontal: 13,
    paddingTop: 7,
    paddingBottom: 4,
    marginBottom: 13,
  },
  mealCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },
  mealCategoryIcon: {
    width: 43,
    height: 43,
    backgroundColor: "#303729",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  mealCategoryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  mealCategorySubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  addMealButton: {
    width: 38,
    height: 38,
    backgroundColor: "#303729",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 9,
  },
  foodIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  foodName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  foodMacros: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  foodCaloriesWrap: {
    alignItems: "flex-end",
  },
  foodCalories: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  foodKcal: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  summaryCard: {
    backgroundColor: "#20251A",
    borderColor: "#414A30",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 7,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  summarySubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalCard: {
    maxHeight: "88%",
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 25,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 23,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
  },
  modalSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 13,
  },
  miniLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 7,
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    minHeight: 48,
    paddingHorizontal: 13,
    color: COLORS.text,
    fontSize: 14,
  },
  macroInputRow: {
    flexDirection: "row",
    gap: 9,
  },
  formHint: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    minHeight: 52,
    borderRadius: 15,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#151711",
    fontSize: 14,
    fontWeight: "900",
  },
  cancelButton: {
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
});