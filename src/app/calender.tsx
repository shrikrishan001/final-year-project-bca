import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const CALENDAR_KEY = "fitnessCalendarPlans";

type Plan = {
  id: string;
  date: string;
  title: string;
  type: "Workout" | "Cardio" | "Recovery" | "Nutrition";
};

const planTypes = [
  {
    type: "Workout" as const,
    icon: "fitness-outline" as const,
    color: "#5B5BD6",
  },
  {
    type: "Cardio" as const,
    icon: "walk-outline" as const,
    color: "#3B82F6",
  },
  {
    type: "Recovery" as const,
    icon: "leaf-outline" as const,
    color: "#20A36A",
  },
  {
    type: "Nutrition" as const,
    icon: "restaurant-outline" as const,
    color: "#F59E0B",
  },
];

export default function CalendarScreen() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(today.getMonth());

  const [currentYear, setCurrentYear] =
    useState(today.getFullYear());

  const [selectedDate, setSelectedDate] =
    useState(
      formatDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    );

  const [plans, setPlans] = useState<Plan[]>(
    []
  );

  const [planTitle, setPlanTitle] =
    useState("");

  const [selectedType, setSelectedType] =
    useState<
      "Workout" |
      "Cardio" |
      "Recovery" |
      "Nutrition"
    >("Workout");

  useEffect(() => {
    loadPlans();
  }, []);

  // ==============================
  // STORAGE
  // ==============================

  const loadPlans = async () => {
    try {
      const data =
        await AsyncStorage.getItem(
          CALENDAR_KEY
        );

      if (data) {
        setPlans(JSON.parse(data));
      }
    } catch (error) {
      console.log(
        "Calendar loading error:",
        error
      );
    }
  };

  const savePlans = async (
    updatedPlans: Plan[]
  ) => {
    try {
      await AsyncStorage.setItem(
        CALENDAR_KEY,
        JSON.stringify(updatedPlans)
      );

      setPlans(updatedPlans);
    } catch (error) {
      console.log(
        "Calendar saving error:",
        error
      );
    }
  };

  // ==============================
  // DATE HELPERS
  // ==============================

  function formatDate(
    year: number,
    month: number,
    day: number
  ) {
    return `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const getMonthName = () => {
    return new Date(
      currentYear,
      currentMonth,
      1
    ).toLocaleString("default", {
      month: "long",
    });
  };

  const getDaysInMonth = () => {
    return new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
  };

  const getFirstDay = () => {
    return new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();
  };

  // ==============================
  // MONTH NAVIGATION
  // ==============================

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(
        currentYear - 1
      );
    } else {
      setCurrentMonth(
        currentMonth - 1
      );
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(
        currentYear + 1
      );
    } else {
      setCurrentMonth(
        currentMonth + 1
      );
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());

    setSelectedDate(
      formatDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    );
  };

  // ==============================
  // SELECT DATE
  // ==============================

  const selectDate = (day: number) => {
    const date = formatDate(
      currentYear,
      currentMonth,
      day
    );

    setSelectedDate(date);
  };

  // ==============================
  // ADD PLAN
  // ==============================

  const addPlan = async () => {
    const title =
      planTitle.trim();

    if (!title) {
      Alert.alert(
        "Missing Plan",
        "Please enter a plan name."
      );

      return;
    }

    const newPlan: Plan = {
      id:
        Date.now().toString(),
      date: selectedDate,
      title,
      type: selectedType,
    };

    const updatedPlans = [
      ...plans,
      newPlan,
    ];

    await savePlans(updatedPlans);

    setPlanTitle("");

    Alert.alert(
      "Plan Added",
      "Your fitness plan has been saved."
    );
  };

  // ==============================
  // QUICK ADD
  // ==============================

  const quickAdd = async (
    type:
      | "Workout"
      | "Cardio"
      | "Recovery"
      | "Nutrition",
    title: string
  ) => {
    const newPlan: Plan = {
      id:
        Date.now().toString(),
      date: selectedDate,
      title,
      type,
    };

    await savePlans([
      ...plans,
      newPlan,
    ]);
  };

  // ==============================
  // DELETE PLAN
  // ==============================

  const deletePlan = (
    planId: string
  ) => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this plan?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedPlans =
              plans.filter(
                (plan) =>
                  plan.id !== planId
              );

            await savePlans(
              updatedPlans
            );
          },
        },
      ]
    );
  };

  // ==============================
  // SELECTED DATE PLANS
  // ==============================

  const selectedPlans =
    plans.filter(
      (plan) =>
        plan.date === selectedDate
    );

  // ==============================
  // CALENDAR CELLS
  // ==============================

  const daysInMonth =
    getDaysInMonth();

  const firstDay =
    getFirstDay();

  const calendarCells: (
    | number
    | null
  )[] = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    calendarCells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#182235"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Fitness Calendar
            </Text>

            <Text
              style={styles.subtitle}
            >
              Plan your fitness journey
            </Text>
          </View>
        </View>

        {/* MONTH HEADER */}

        <View style={styles.monthCard}>
          <View
            style={styles.monthHeader}
          >
            <TouchableOpacity
              style={styles.monthButton}
              onPress={
                previousMonth
              }
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color="#5B5BD6"
              />
            </TouchableOpacity>

            <Text
              style={styles.monthTitle}
            >
              {getMonthName()}{" "}
              {currentYear}
            </Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={
                nextMonth
              }
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#5B5BD6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.todayButton}
            onPress={goToToday}
          >
            <Ionicons
              name="today-outline"
              size={16}
              color="#5B5BD6"
            />

            <Text
              style={
                styles.todayButtonText
              }
            >
              Today
            </Text>
          </TouchableOpacity>

          {/* WEEK DAYS */}

          <View
            style={styles.weekRow}
          >
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <Text
                key={day}
                style={
                  styles.weekText
                }
              >
                {day}
              </Text>
            ))}
          </View>

          {/* CALENDAR */}

          <View
            style={styles.calendarGrid}
          >
            {calendarCells.map(
              (day, index) => {
                if (day === null) {
                  return (
                    <View
                      key={index}
                      style={
                        styles.dayCell
                      }
                    />
                  );
                }

                const date =
                  formatDate(
                    currentYear,
                    currentMonth,
                    day
                  );

                const isSelected =
                  date ===
                  selectedDate;

                const isToday =
                  date ===
                  formatDate(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );

                const hasPlan =
                  plans.some(
                    (plan) =>
                      plan.date ===
                      date
                  );

                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dayCell,
                      isSelected &&
                        styles.selectedDay,
                    ]}
                    onPress={() =>
                      selectDate(
                        day
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isSelected &&
                          styles.selectedDayText,
                        isToday &&
                          !isSelected &&
                          styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>

                    {hasPlan && (
                      <View
                        style={
                          styles.planDot
                        }
                      />
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* SELECTED DATE */}

        <View style={styles.dateHeader}>
          <View>
            <Text
              style={styles.dateTitle}
            >
              {new Date(
                selectedDate
              ).toLocaleDateString(
                "en-IN",
                {
                  weekday:
                    "long",
                  day: "numeric",
                  month:
                    "long",
                }
              )}
            </Text>

            <Text
              style={
                styles.dateSubtitle
              }
            >
              {selectedPlans.length ===
              0
                ? "No plans scheduled"
                : `${selectedPlans.length} plan${
                    selectedPlans.length >
                    1
                      ? "s"
                      : ""
                  } scheduled`}
            </Text>
          </View>

          <View
            style={styles.dateIcon}
          >
            <Ionicons
              name="calendar-outline"
              size={23}
              color="#5B5BD6"
            />
          </View>
        </View>

        {/* QUICK ADD */}

        <Text
          style={styles.sectionTitle}
        >
          Quick Add
        </Text>

        <View
          style={styles.quickGrid}
        >
          {planTypes.map(
            (item) => (
              <TouchableOpacity
                key={item.type}
                style={
                  styles.quickCard
                }
                onPress={() =>
                  quickAdd(
                    item.type,
                    item.type ===
                      "Workout"
                      ? "Workout Session"
                      : item.type ===
                        "Cardio"
                      ? "Cardio Session"
                      : item.type ===
                        "Recovery"
                      ? "Recovery Day"
                      : "Nutrition Plan"
                  )
                }
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor:
                        item.color +
                        "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={
                      item.color
                    }
                  />
                </View>

                <Text
                  style={
                    styles.quickTitle
                  }
                >
                  {item.type}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* CREATE PLAN */}

        <Text
          style={styles.sectionTitle}
        >
          Create Custom Plan
        </Text>

        <View
          style={styles.createCard}
        >
          <Text
            style={styles.inputLabel}
          >
            Plan name
          </Text>

          <TextInput
            value={planTitle}
            onChangeText={
              setPlanTitle
            }
            placeholder="e.g. Chest Workout"
            placeholderTextColor="#A0A4B2"
            style={styles.input}
          />

          <Text
            style={styles.inputLabel}
          >
            Plan type
          </Text>

          <View
            style={styles.typeRow}
          >
            {planTypes.map(
              (item) => {
                const active =
                  selectedType ===
                  item.type;

                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.typeButton,
                      active &&
                        styles.activeType,
                    ]}
                    onPress={() =>
                      setSelectedType(
                        item.type
                      )
                    }
                  >
                    <Ionicons
                      name={
                        item.icon
                      }
                      size={18}
                      color={
                        active
                          ? "#FFFFFF"
                          : item.color
                      }
                    />

                    <Text
                      style={[
                        styles.typeText,
                        active &&
                          styles.activeTypeText,
                      ]}
                    >
                      {
                        item.type
                      }
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={addPlan}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.saveButtonText
              }
            >
              Save Plan
            </Text>
          </TouchableOpacity>
        </View>

        {/* PLANS */}

        {selectedPlans.length >
          0 && (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Today's Plans
            </Text>

            {selectedPlans.map(
              (plan) => {
                const config =
                  planTypes.find(
                    (item) =>
                      item.type ===
                      plan.type
                  );

                return (
                  <View
                    key={plan.id}
                    style={
                      styles.planCard
                    }
                  >
                    <View
                      style={[
                        styles.planIcon,
                        {
                          backgroundColor:
                            (config?.color ||
                              "#5B5BD6") +
                            "15",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          config?.icon ||
                          "calendar-outline"
                        }
                        size={22}
                        color={
                          config?.color ||
                          "#5B5BD6"
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.planInfo
                      }
                    >
                      <Text
                        style={
                          styles.planTitle
                        }
                      >
                        {plan.title}
                      </Text>

                      <Text
                        style={
                          styles.planType
                        }
                      >
                        {plan.type}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        deletePlan(
                          plan.id
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#E05252"
                      />
                    </TouchableOpacity>
                  </View>
                );
              }
            )}
          </>
        )}

        {/* TIP */}

        <View
          style={styles.tipCard}
        >
          <View
            style={styles.tipIcon}
          >
            <Ionicons
              name="bulb-outline"
              size={23}
              color="#F59E0B"
            />
          </View>

          <View
            style={styles.tipContent}
          >
            <Text
              style={styles.tipTitle}
            >
              Stay Consistent
            </Text>

            <Text
              style={styles.tipText}
            >
              Planning your workouts in
              advance makes it easier to
              stay consistent with your
              fitness goals.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  headerText: {
    marginLeft: 13,
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#182235",
  },

  subtitle: {
    fontSize: 13,
    color: "#8B91A3",
    marginTop: 3,
  },

  monthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 24,
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#182235",
  },

  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F1FB",
    justifyContent: "center",
    alignItems: "center",
  },

  todayButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "#F1F1FB",
    borderRadius: 10,
  },

  todayButtonText: {
    color: "#5B5BD6",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 7,
  },

  weekText: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#9A9EAC",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.285%",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    position: "relative",
  },

  selectedDay: {
    backgroundColor: "#5B5BD6",
  },

  dayNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#303747",
  },

  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  todayText: {
    color: "#5B5BD6",
    fontWeight: "800",
  },

  planDot: {
    position: "absolute",
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#5B5BD6",
  },

  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  dateTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#182235",
  },

  dateSubtitle: {
    fontSize: 12,
    color: "#8B91A3",
    marginTop: 4,
  },

  dateIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEEEFF",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  quickIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182235",
  },

  createCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 25,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#606678",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderRadius: 13,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#182235",
    marginBottom: 17,
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  activeType: {
    backgroundColor: "#5B5BD6",
    borderColor: "#5B5BD6",
  },

  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#596071",
    marginLeft: 5,
  },

  activeTypeText: {
    color: "#FFFFFF",
  },

  saveButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#5B5BD6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 10,
  },

  planIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  planInfo: {
    flex: 1,
    marginLeft: 12,
  },

  planTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182235",
  },

  planType: {
    fontSize: 11,
    color: "#8B91A3",
    marginTop: 3,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 16,
    marginTop: 15,
  },

  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFF0CA",
    justifyContent: "center",
    alignItems: "center",
  },

  tipContent: {
    flex: 1,
    marginLeft: 12,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8A6200",
    marginBottom: 4,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#8B7650",
  },
});