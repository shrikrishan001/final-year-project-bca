import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Reminder = {
  id: string;
  title: string;
  time: string;
  type: string;
  enabled: boolean;
};

const REMINDER_KEY = "fitnessReminders";

const reminderTypes = [
  {
    icon: "💧",
    title: "Water",
  },
  {
    icon: "🏋️",
    title: "Workout",
  },
  {
    icon: "🍎",
    title: "Meal",
  },
  {
    icon: "😴",
    title: "Sleep",
  },
];

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [selectedType, setSelectedType] =
    useState("Water");

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(REMINDER_KEY);

      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch (error) {
      console.log("Error loading reminders:", error);
    }
  };

  const saveReminders = async (
    updatedReminders: Reminder[]
  ) => {
    try {
      await AsyncStorage.setItem(
        REMINDER_KEY,
        JSON.stringify(updatedReminders)
      );
    } catch (error) {
      console.log("Error saving reminders:", error);
    }
  };

  const addReminder = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Missing Title",
        "Please enter a reminder title."
      );
      return;
    }

    if (!time.trim()) {
      Alert.alert(
        "Missing Time",
        "Please enter a reminder time."
      );
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: title.trim(),
      time: time.trim(),
      type: selectedType,
      enabled: true,
    };

    const updated = [
      newReminder,
      ...reminders,
    ];

    setReminders(updated);

    await saveReminders(updated);

    setTitle("");
    setTime("");

    Alert.alert(
      "Reminder Added ✅",
      `${newReminder.title} at ${newReminder.time}`
    );
  };

  const toggleReminder = async (
    id: string
  ) => {
    const updated = reminders.map(
      (reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              enabled: !reminder.enabled,
            }
          : reminder
    );

    setReminders(updated);

    await saveReminders(updated);
  };

  const deleteReminder = (
    id: string
  ) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated =
              reminders.filter(
                (reminder) =>
                  reminder.id !== id
              );

            setReminders(updated);

            await saveReminders(updated);
          },
        },
      ]
    );
  };

  const getIcon = (type: string) => {
    const item = reminderTypes.find(
      (item) => item.title === type
    );

    return item?.icon || "⏰";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Reminders
          </Text>

          <Text style={styles.headerSubtitle}>
            Stay consistent with your fitness goals
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>
              ⏰
            </Text>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Stay on track
            </Text>

            <Text style={styles.heroSubtitle}>
              Create reminders for your daily
              fitness routine.
            </Text>
          </View>
        </View>

        {/* Create Reminder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Create Reminder
          </Text>

          <Text style={styles.label}>
            Reminder title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Drink water"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>
            Time
          </Text>

          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 08:00 AM"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>
            Reminder type
          </Text>

          <View style={styles.typeRow}>
            {reminderTypes.map((item) => {
              const selected =
                selectedType === item.title;

              return (
                <TouchableOpacity
                  key={item.title}
                  style={[
                    styles.typeButton,
                    selected &&
                      styles.typeButtonSelected,
                  ]}
                  onPress={() =>
                    setSelectedType(item.title)
                  }
                >
                  <Text style={styles.typeIcon}>
                    {item.icon}
                  </Text>

                  <Text
                    style={[
                      styles.typeText,
                      selected &&
                        styles.typeTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={addReminder}
          >
            <Text style={styles.addButtonText}>
              + Add Reminder
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reminder List */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            My Reminders
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {reminders.length}
            </Text>
          </View>
        </View>

        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ⏰
            </Text>

            <Text style={styles.emptyTitle}>
              No reminders yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first reminder above
              to stay consistent.
            </Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderCard,
                !reminder.enabled &&
                  styles.reminderDisabled,
              ]}
            >
              <View style={styles.reminderIcon}>
                <Text style={styles.reminderEmoji}>
                  {getIcon(reminder.type)}
                </Text>
              </View>

              <View style={styles.reminderInfo}>
                <Text
                  style={[
                    styles.reminderTitle,
                    !reminder.enabled &&
                      styles.disabledText,
                  ]}
                >
                  {reminder.title}
                </Text>

                <View
                  style={styles.reminderMeta}
                >
                  <Text style={styles.reminderTime}>
                    🕐 {reminder.time}
                  </Text>

                  <Text style={styles.dot}>
                    •
                  </Text>

                  <Text style={styles.reminderType}>
                    {reminder.type}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.switch,
                  reminder.enabled &&
                    styles.switchActive,
                ]}
                onPress={() =>
                  toggleReminder(reminder.id)
                }
              >
                <View
                  style={[
                    styles.switchCircle,
                    reminder.enabled &&
                      styles.switchCircleActive,
                  ]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  deleteReminder(reminder.id)
                }
              >
                <Text style={styles.deleteText}>
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Fitness reminder tip
            </Text>

            <Text style={styles.tipText}>
              Set reminders for water, workouts,
              meals and bedtime to build a
              consistent routine.
            </Text>
          </View>
        </View>

        {/* Notification Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>

          <Text style={styles.infoText}>
            Reminders are currently saved locally
            on your device. Notification alerts can
            be enabled later with the Android
            development build.
          </Text>
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
    fontSize: 11,
    color: "#7B8190",
    marginTop: 3,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  hero: {
    backgroundColor: "#5B5BD6",
    borderRadius: 23,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  heroIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  heroEmoji: {
    fontSize: 28,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "#DDDDFE",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 22,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777E8E",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E1E3EA",
    borderRadius: 13,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 14,
    color: "#182235",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 14,
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 17,
  },

  typeButton: {
    flex: 1,
    minHeight: 67,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E5EC",
    backgroundColor: "#FAFAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonSelected: {
    backgroundColor: "#EEEEFF",
    borderColor: "#5B5BD6",
  },

  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  typeText: {
    fontSize: 9,
    color: "#7B8190",
    fontWeight: "700",
  },

  typeTextSelected: {
    color: "#5B5BD6",
  },

  addButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#5B5BD6",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#182235",
    marginBottom: 12,
  },

  countBadge: {
    backgroundColor: "#EEEEFF",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 8,
    marginBottom: 12,
  },

  countText: {
    color: "#5B5BD6",
    fontSize: 10,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
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
    fontSize: 11,
    color: "#858B99",
    textAlign: "center",
    marginTop: 5,
  },

  reminderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    flexDirection: "row",
    alignItems: "center",
  },

  reminderDisabled: {
    opacity: 0.55,
  },

  reminderIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEEEFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  reminderEmoji: {
    fontSize: 22,
  },

  reminderInfo: {
    flex: 1,
  },

  reminderTitle: {
    color: "#182235",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledText: {
    color: "#9298A6",
  },

  reminderMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  reminderTime: {
    color: "#5B5BD6",
    fontSize: 10,
    fontWeight: "700",
  },

  dot: {
    color: "#B2B6C0",
    marginHorizontal: 5,
  },

  reminderType: {
    color: "#858B99",
    fontSize: 10,
  },

  switch: {
    width: 42,
    height: 24,
    borderRadius: 20,
    backgroundColor: "#D8DAE1",
    justifyContent: "center",
    paddingHorizontal: 3,
    marginRight: 8,
  },

  switchActive: {
    backgroundColor: "#5B5BD6",
  },

  switchCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },

  switchCircleActive: {
    alignSelf: "flex-end",
  },

  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    fontSize: 16,
  },

  tipCard: {
    backgroundColor: "#FFF9E8",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F4E8BF",
    marginTop: 10,
  },

  tipIcon: {
    fontSize: 23,
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
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  infoCard: {
    marginTop: 12,
    backgroundColor: "#EEF3FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  infoText: {
    flex: 1,
    color: "#53617A",
    fontSize: 10,
    lineHeight: 16,
  },
});