import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getFitnessProfile,
  saveFitnessProfile,
} from "../utils/fitnessStorage";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type Activity = "low" | "moderate" | "high";

export default function FitnessProfile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [gender, setGender] = useState<Gender>("male");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [activity, setActivity] = useState<Activity>("moderate");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getFitnessProfile();

        if (!mounted || !profile) return;

        setName(profile.name ?? "");
        setAge(String(profile.age ?? ""));
        setHeight(String(profile.height ?? ""));
        setWeight(String(profile.weight ?? ""));
        setGender(profile.gender ?? "male");
        setGoal(profile.goal ?? "maintain");
        setActivity(profile.activity ?? "moderate");
      } catch {
        if (mounted) {
          Alert.alert(
            "Unable to load profile",
            "Please reopen the screen and try again."
          );
        }
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const saveProfile = async () => {
    if (saving) return;

    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (!age.trim() || !height.trim() || !weight.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your age, height and weight."
      );
      return;
    }

    if (
      !Number.isFinite(ageValue) ||
      ageValue < 13 ||
      ageValue > 100 ||
      !Number.isInteger(ageValue)
    ) {
      Alert.alert(
        "Invalid Age",
        "Please enter an age between 13 and 100."
      );
      return;
    }

    if (
      !Number.isFinite(heightValue) ||
      heightValue < 80 ||
      heightValue > 250
    ) {
      Alert.alert(
        "Invalid Height",
        "Please enter a height between 80 and 250 cm."
      );
      return;
    }

    if (
      !Number.isFinite(weightValue) ||
      weightValue < 20 ||
      weightValue > 350
    ) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a weight between 20 and 350 kg."
      );
      return;
    }

    const profile = {
      name: name.trim(),
      age: ageValue,
      height: heightValue,
      weight: weightValue,
      gender,
      goal,
      activity,
    };

    try {
      setSaving(true);
      await saveFitnessProfile(profile);

      Alert.alert(
        "Profile Saved",
        "Your fitness profile has been saved successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Profile save error:", error);

      Alert.alert(
        "Save Failed",
        "Your profile could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const selectOption = <T extends string>(
    value: T,
    selectedValue: T,
    onSelect: (value: T) => void
  ) => ({
    selected: value === selectedValue,
    onPress: () => onSelect(value),
  });

  if (loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />
        <ActivityIndicator size="large" color="#5548D9" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#182235" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Fitness Profile</Text>
            <Text style={styles.subtitle}>
              Personalize your fitness journey
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="person-outline" size={23} color="#5548D9" />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="fitness-outline" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Your fitness, your way</Text>
            <Text style={styles.bannerDescription}>
              Your details help personalize workout and nutrition
              recommendations.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon="person-outline"
            title="Personal Information"
            subtitle="Basic details about you"
          />

          <FieldLabel>Name</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#9299A8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={60}
          />

          <FieldLabel>Age</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="Age in years"
            placeholderTextColor="#9299A8"
            keyboardType="number-pad"
            value={age}
            onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ""))}
            maxLength={3}
          />

          <FieldLabel>Gender</FieldLabel>
          <View style={styles.optionRow}>
            {(["male", "female"] as Gender[]).map((item) => {
              const option = selectOption(item, gender, setGender);

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.genderOption,
                    option.selected && styles.selectedOption,
                  ]}
                  onPress={option.onPress}
                >
                  <Ionicons
                    name={item === "male" ? "male-outline" : "female-outline"}
                    size={19}
                    color={option.selected ? "#FFFFFF" : "#555C6E"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      option.selected && styles.selectedOptionText,
                    ]}
                  >
                    {item === "male" ? "Male" : "Female"}
                  </Text>
                  {option.selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon="body-outline"
            title="Body Details"
            subtitle="Used for estimates and tracking"
          />

          <View style={styles.measureRow}>
            <View style={styles.measureField}>
              <FieldLabel>Height</FieldLabel>
              <View style={styles.unitInput}>
                <TextInput
                  style={styles.unitTextInput}
                  placeholder="175"
                  placeholderTextColor="#9299A8"
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text style={styles.unitText}>cm</Text>
              </View>
            </View>

            <View style={styles.measureField}>
              <FieldLabel>Weight</FieldLabel>
              <View style={styles.unitInput}>
                <TextInput
                  style={styles.unitTextInput}
                  placeholder="70"
                  placeholderTextColor="#9299A8"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon="flag-outline"
            title="Fitness Goal"
            subtitle="What would you like to achieve?"
          />

          <GoalOption
            title="Weight Loss"
            description="Gradually reduce body fat"
            icon="trending-down-outline"
            selected={goal === "lose"}
            onPress={() => setGoal("lose")}
          />

          <GoalOption
            title="Maintain Weight"
            description="Maintain weight and build healthy habits"
            icon="scale-outline"
            selected={goal === "maintain"}
            onPress={() => setGoal("maintain")}
          />

          <GoalOption
            title="Muscle Gain"
            description="Build strength and muscle"
            icon="barbell-outline"
            selected={goal === "gain"}
            onPress={() => setGoal("gain")}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon="walk-outline"
            title="Activity Level"
            subtitle="Your usual activity outside workouts"
          />

          <ActivityOption
            title="Low"
            description="Mostly sitting, little exercise"
            selected={activity === "low"}
            onPress={() => setActivity("low")}
          />

          <ActivityOption
            title="Moderate"
            description="Regular movement and some exercise"
            selected={activity === "moderate"}
            onPress={() => setActivity("moderate")}
          />

          <ActivityOption
            title="High"
            description="Frequent intense exercise or active lifestyle"
            selected={activity === "high"}
            onPress={() => setActivity("high")}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          activeOpacity={0.85}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={21} color="#FFFFFF" />
              <Text style={styles.saveText}>Save Fitness Profile</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={17} color="#858C9C" />
          <Text style={styles.footer}>
            Your profile is saved locally on this device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={21} color="#5548D9" />
      </View>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function GoalOption({
  title,
  description,
  icon,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.choiceCard, selected && styles.selectedChoiceCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.choiceIcon, selected && styles.selectedChoiceIcon]}>
        <Ionicons
          name={icon}
          size={22}
          color={selected ? "#FFFFFF" : "#5548D9"}
        />
      </View>

      <View style={styles.choiceContent}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDescription}>{description}</Text>
      </View>

      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={22}
        color={selected ? "#5548D9" : "#B6BBC7"}
      />
    </TouchableOpacity>
  );
}

function ActivityOption({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.activityCard, selected && styles.selectedActivityCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>

      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={22}
        color={selected ? "#5548D9" : "#B6BBC7"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#737B8D",
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: "#E3E5EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#182235",
  },
  subtitle: {
    fontSize: 13,
    color: "#858C9C",
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5548D9",
    borderRadius: 20,
    padding: 17,
    marginBottom: 18,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  bannerDescription: {
    color: "#E5E2FF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0EEFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#182235",
  },
  sectionSubtitle: {
    color: "#8A91A2",
    fontSize: 12,
    marginTop: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#41485A",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: "#DDE0E8",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#182235",
    backgroundColor: "#FAFBFD",
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE0E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FAFBFD",
  },
  selectedOption: {
    backgroundColor: "#5548D9",
    borderColor: "#5548D9",
  },
  optionText: {
    color: "#555C6E",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  measureRow: {
    flexDirection: "row",
    gap: 12,
  },
  measureField: {
    flex: 1,
  },
  unitInput: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE0E8",
    borderRadius: 13,
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 12,
  },
  unitTextInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: "#182235",
    paddingVertical: 12,
  },
  unitText: {
    color: "#858C9C",
    fontSize: 13,
    fontWeight: "700",
  },
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EF",
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedChoiceCard: {
    borderColor: "#776BE5",
    backgroundColor: "#F6F4FF",
  },
  choiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0EEFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedChoiceIcon: {
    backgroundColor: "#5548D9",
  },
  choiceContent: {
    flex: 1,
    paddingRight: 8,
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182235",
  },
  choiceDescription: {
    color: "#858C9C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EF",
    padding: 14,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedActivityCard: {
    borderColor: "#776BE5",
    backgroundColor: "#F6F4FF",
  },
  activityText: {
    flex: 1,
    paddingRight: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182235",
  },
  activityDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#858C9C",
    marginTop: 4,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 17,
    backgroundColor: "#5548D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  privacyNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
  },
  footer: {
    color: "#858C9C",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
});