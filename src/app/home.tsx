import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
  getFitnessProfile,
  FitnessProfile,
} from "../utils/fitnessStorage";
import {
  logoutUser,
  getLoggedInUser,
  UserAccount,
} from "../utils/authStorage";

const PURPLE = "#5548D9";
const BG = "#F7F8FC";
const DARK = "#182235";
const MUTED = "#858C9C";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function HomeScreen() {
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

const loadHomeData = useCallback(async () => {
  try {
    const fitnessProfile = await getFitnessProfile();
    const loggedInUser = await getLoggedInUser();

    console.log("Fitness profile name:", fitnessProfile?.name);
    console.log("Account name:", loggedInUser?.name);

    setProfile(fitnessProfile);
    setUser(loggedInUser);
  } catch (error) {
    console.error("Unable to load home data:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  // Fitness Profile name ko account name se priority do.
  const displayName =
    profile?.name?.trim() || user?.name?.trim() || "Fitness Enthusiast";

  const firstName = displayName.split(/\s+/)[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const calculateCalories = () => {
    if (!profile) return null;

    const { age, height, weight, gender, activity, goal } = profile;

    const bmr =
      10 * weight +
      6.25 * height -
      5 * age +
      (gender === "male" ? 5 : -161);

    const multiplier =
      activity === "low"
        ? 1.2
        : activity === "moderate"
        ? 1.55
        : 1.725;

    const maintenance = bmr * multiplier;

    const target =
      goal === "lose"
        ? maintenance - 400
        : goal === "gain"
        ? maintenance + 300
        : maintenance;

    return Math.max(0, Math.round(target));
  };

  const calorieTarget = calculateCalories();

  const openRoute = (path: string) => {
    setDrawerVisible(false);
    router.push(path as never);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setDrawerVisible(false);

    try {
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PURPLE}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={27} color={DARK} />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Ionicons name="fitness" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>FitCoach AI</Text>
              <Text style={styles.brandSubtitle}>YOUR FITNESS PARTNER</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => openRoute("/reminders")}
            accessibilityLabel="Open reminders"
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={DARK}
            />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {firstName}!
            </Text>
            <Text style={styles.greetingDescription}>
              Ready to make today count?
            </Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons name="person" size={29} color={PURPLE} />
          </View>
        </View>

        {/* AI Coach Banner */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => openRoute("/coach")}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={15} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI PERSONAL COACH</Text>
            </View>
            <Ionicons
              name="arrow-up-outline"
              size={22}
              color="#FFFFFF"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </View>

          <Text style={styles.heroTitle}>
            Your fitness journey,{"\n"}powered by AI.
          </Text>
          <Text style={styles.heroDescription}>
            Get personalized workouts, nutrition tips and guidance.
          </Text>

          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Talk to AI Coach</Text>
            <Ionicons name="arrow-forward" size={17} color={PURPLE} />
          </View>

          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />
        </TouchableOpacity>

        {/* Daily Overview */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Daily Overview</Text>
            <Text style={styles.sectionSubtitle}>
              Your activity at a glance
            </Text>
          </View>
          <Ionicons name="stats-chart-outline" size={22} color={PURPLE} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="flame-outline"
            title="Calories"
            value="0"
            unit="kcal"
            color="#F07842"
            background="#FFF0E8"
          />
          <StatCard
            icon="footsteps-outline"
            title="Steps"
            value="0"
            unit="steps"
            color="#2985D7"
            background="#E9F3FF"
          />
          <StatCard
            icon="water-outline"
            title="Water"
            value="0"
            unit="glasses"
            color="#219BC4"
            background="#E5F8FF"
          />
          <StatCard
            icon="time-outline"
            title="Workout"
            value="0"
            unit="minutes"
            color="#2C9B6F"
            background="#E7F8EF"
          />
        </View>

        {/* Calorie Target */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieIcon}>
            <Ionicons name="nutrition-outline" size={24} color={PURPLE} />
          </View>
          <View style={styles.calorieInfo}>
            <Text style={styles.calorieTitle}>Daily Calorie Target</Text>
            <Text style={styles.calorieSubtitle}>
              {profile
                ? `Based on your ${profile.goal === "lose" ? "weight loss" : profile.goal === "gain" ? "muscle gain" : "maintenance"} goal`
                : "Complete your fitness profile to personalize your target"}
            </Text>
          </View>
          <View style={styles.calorieValueContainer}>
            <Text style={styles.calorieValue}>
              {calorieTarget ?? "--"}
            </Text>
            <Text style={styles.calorieUnit}>kcal/day</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>
              What would you like to do?
            </Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <ActionCard
            icon="barbell-outline"
            title="Workout"
            description="Generate a workout plan"
            color="#5548D9"
            background="#EEECFF"
            onPress={() => openRoute("/workout-generator")}
          />
          <ActionCard
            icon="restaurant-outline"
            title="Nutrition"
            description="Explore healthy meals"
            color="#2C9B6F"
            background="#E5F8ED"
            onPress={() => openRoute("/nutrition")}
          />
          <ActionCard
            icon="scan-outline"
            title="Meal Analyzer"
            description="Analyze your food"
            color="#E28A31"
            background="#FFF2E3"
            onPress={() => openRoute("/meal-analyzer")}
          />
          <ActionCard
            icon="analytics-outline"
            title="Progress"
            description="Track your progress"
            color="#248DC5"
            background="#E5F5FF"
            onPress={() => openRoute("/progress")}
          />
        </View>

        {/* Fitness Profile */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Your Fitness Profile</Text>
            <Text style={styles.sectionSubtitle}>
              Keep your personal details up to date
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openRoute("/fitness-profile")}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={17} color={PURPLE} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {profile ? (
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person-outline" size={26} color={PURPLE} />
              </View>
              <View style={styles.profileNameContainer}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.name?.trim() || firstName}
                </Text>
                <Text style={styles.profileGoal}>
                  {profile.goal === "lose"
                    ? "Weight Loss"
                    : profile.goal === "gain"
                    ? "Muscle Gain"
                    : "Maintain Weight"}
                </Text>
              </View>
              <View style={styles.profileCompleteBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#249B6B"
                />
                <Text style={styles.profileCompleteText}>Saved</Text>
              </View>
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.profileMetrics}>
              <ProfileMetric
                label="Age"
                value={`${profile.age}`}
                unit="years"
              />
              <View style={styles.metricDivider} />
              <ProfileMetric
                label="Height"
                value={`${profile.height}`}
                unit="cm"
              />
              <View style={styles.metricDivider} />
              <ProfileMetric
                label="Weight"
                value={`${profile.weight}`}
                unit="kg"
              />
            </View>

            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => openRoute("/fitness-profile")}
            >
              <Text style={styles.viewProfileText}>Update your details</Text>
              <Ionicons name="arrow-forward" size={17} color={PURPLE} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.setupProfileCard}
            onPress={() => openRoute("/fitness-profile")}
            activeOpacity={0.85}
          >
            <View style={styles.setupIcon}>
              <Ionicons name="person-add-outline" size={25} color={PURPLE} />
            </View>
            <View style={styles.setupTextContainer}>
              <Text style={styles.setupTitle}>Complete your profile</Text>
              <Text style={styles.setupDescription}>
                Add your age, height, weight and fitness goal.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={PURPLE} />
          </TouchableOpacity>
        )}

        {/* Wellness tools */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Wellness Tools</Text>
            <Text style={styles.sectionSubtitle}>
              Small habits, big results
            </Text>
          </View>
        </View>

        <View style={styles.wellnessCard}>
          <WellnessRow
            icon="water-outline"
            title="Water Tracker"
            subtitle="Stay hydrated throughout the day"
            onPress={() => openRoute("/water-tracker")}
          />
          <View style={styles.wellnessDivider} />
          <WellnessRow
            icon="timer-outline"
            title="Workout Timer"
            subtitle="Keep track of your training time"
            onPress={() => openRoute("/workout-timer")}
          />
          <View style={styles.wellnessDivider} />
          <WellnessRow
            icon="calendar-outline"
            title="Workout Calendar"
            subtitle="Organize your fitness routine"
            onPress={() => openRoute("/calender")}
          />
        </View>

        <Text style={styles.footerText}>
          Consistency is progress. Keep showing up for yourself.
        </Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <BottomTab
          icon="home"
          label="Home"
          active
          onPress={() => router.replace("/home")}
        />
        <BottomTab
          icon="compass-outline"
          label="Explore"
          onPress={() => openRoute("/coach")}
        />
        <BottomTab
          icon="person-outline"
          label="Profile"
          onPress={() => openRoute("/fitness-profile")}
        />
      </View>

   {/* Side Drawer */}
<Modal
  visible={drawerVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setDrawerVisible(false)}
>
  <View style={styles.modalRoot}>
    <Pressable
      style={styles.drawerBackdrop}
      onPress={() => setDrawerVisible(false)}
    />

    <View style={styles.drawer}>
      {/* Fixed Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Ionicons name="person" size={27} color={PURPLE} />
        </View>

        <View style={styles.drawerUserInfo}>
          <Text style={styles.drawerName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.drawerEmail} numberOfLines={1}>
            {user?.email || "Your fitness account"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setDrawerVisible(false)}>
          <Ionicons name="close" size={25} color={DARK} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Menu */}
      <ScrollView
        style={styles.drawerMenuScroll}
        contentContainerStyle={styles.drawerMenuContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.drawerSectionLabel}>YOUR FITNESS</Text>

        <DrawerItem
          icon="home-outline"
          label="Home"
          onPress={() => openRoute("/home")}
        />
        <DrawerItem
          icon="person-outline"
          label="Fitness Profile"
          onPress={() => openRoute("/fitness-profile")}
        />
        <DrawerItem
          icon="barbell-outline"
          label="Workout Generator"
          onPress={() => openRoute("/workout-generator")}
        />
        <DrawerItem
          icon="restaurant-outline"
          label="Nutrition"
          onPress={() => openRoute("/nutrition")}
        />
        <DrawerItem
          icon="scan-outline"
          label="Meal Analyzer"
          onPress={() => openRoute("/meal-analyzer")}
        />
        <DrawerItem
          icon="analytics-outline"
          label="Progress"
          onPress={() => openRoute("/progress")}
        />

        <Text style={styles.drawerSectionLabel}>
          TRACKERS & TOOLS
        </Text>

        <DrawerItem
          icon="water-outline"
          label="Water Tracker"
          onPress={() => openRoute("/water-tracker")}
        />
        <DrawerItem
          icon="calendar-outline"
          label="Workout Calendar"
          onPress={() => openRoute("/calender")}
        />
        <DrawerItem
          icon="timer-outline"
          label="Workout Timer"
          onPress={() => openRoute("/workout-timer")}
        />
        <DrawerItem
          icon="stopwatch-outline"
          label="Stopwatch"
          onPress={() => openRoute("/stopwatch")}
        />
        <DrawerItem
          icon="scale-outline"
          label="Weight Tracker"
          onPress={() => openRoute("/weigth-tracker")}
        />
        <DrawerItem
          icon="notifications-outline"
          label="Reminders"
          onPress={() => openRoute("/reminders")}
        />
      </ScrollView>

      {/* Fixed Logout Button */}
      <View style={styles.drawerBottom}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#D94A4A" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#D94A4A"
              />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
}

function StatCard({
  icon,
  title,
  value,
  unit,
  color,
  background,
}: {
  icon: IconName;
  title: string;
  value: string;
  unit: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  description,
  color,
  background,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={25} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
      <View style={styles.actionArrow}>
        <Ionicons name="arrow-forward" size={17} color={color} />
      </View>
    </TouchableOpacity>
  );
}

function ProfileMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.profileMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function WellnessRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.wellnessRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.wellnessIcon}>
        <Ionicons name={icon} size={23} color={PURPLE} />
      </View>
      <View style={styles.wellnessText}>
        <Text style={styles.wellnessTitle}>{title}</Text>
        <Text style={styles.wellnessSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#A2A8B6" />
    </TouchableOpacity>
  );
}

function BottomTab({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.bottomTab}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={icon}
        size={23}
        color={active ? PURPLE : "#939AAA"}
      />
      <Text
        style={[
          styles.bottomTabLabel,
          active && styles.bottomTabLabelActive,
        ]}
      >
        {label}
      </Text>
      {active && <View style={styles.activeTabDot} />}
    </TouchableOpacity>
  );
}

function DrawerItem({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={21} color="#646D80" />
      <Text style={styles.drawerItemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#A2A8B6" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },
  menuButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EF",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
  },
  brandContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "800",
  },
  brandSubtitle: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 3,
  },
  notificationButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  greetingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#747C8E",
    fontWeight: "500",
  },
  userName: {
    fontSize: 29,
    color: DARK,
    fontWeight: "900",
    marginTop: 2,
  },
  greetingDescription: {
    fontSize: 13,
    color: MUTED,
    marginTop: 5,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#EEECFF",
    borderWidth: 1,
    borderColor: "#DDD9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 24,
    padding: 21,
    marginBottom: 29,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 33,
    marginTop: 22,
  },
  heroDescription: {
    color: "#E7E4FF",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    maxWidth: 270,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    marginTop: 19,
  },
  heroButtonText: {
    color: PURPLE,
    fontSize: 13,
    fontWeight: "800",
  },
  heroDecorationOne: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 24,
    borderColor: "rgba(255,255,255,0.07)",
    right: -42,
    bottom: -44,
  },
  heroDecorationTwo: {
    position: "absolute",
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: 23,
    top: 53,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    color: DARK,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  statCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF2",
    borderRadius: 19,
    padding: 15,
    marginBottom: 12,
  },
  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginTop: 6,
    flexWrap: "wrap",
  },
  statValue: {
    fontSize: 25,
    color: DARK,
    fontWeight: "900",
  },
  statUnit: {
    fontSize: 11,
    color: MUTED,
  },
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF2",
    borderRadius: 19,
    padding: 15,
    marginBottom: 29,
  },
  calorieIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  calorieInfo: {
    flex: 1,
    paddingRight: 5,
  },
  calorieTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: DARK,
  },
  calorieSubtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 5,
    lineHeight: 15,
  },
  calorieValueContainer: {
    alignItems: "flex-end",
  },
  calorieValue: {
    fontSize: 21,
    color: PURPLE,
    fontWeight: "900",
  },
  calorieUnit: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 29,
  },
  actionCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF2",
    borderRadius: 19,
    padding: 15,
    marginBottom: 12,
    minHeight: 177,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: DARK,
  },
  actionDescription: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
    marginTop: 5,
    paddingRight: 4,
  },
  actionArrow: {
    position: "absolute",
    right: 13,
    bottom: 13,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEECFF",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  editButtonText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EF",
    borderRadius: 21,
    padding: 17,
    marginBottom: 29,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileNameContainer: {
    flex: 1,
    paddingRight: 5,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "900",
    color: DARK,
  },
  profileGoal: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: "700",
    marginTop: 4,
  },
  profileCompleteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F8F0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  profileCompleteText: {
    color: "#249B6B",
    fontSize: 10,
    fontWeight: "800",
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#EDF0F5",
    marginVertical: 17,
  },
  profileMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  profileMetric: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: MUTED,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginTop: 6,
  },
  metricValue: {
    fontSize: 19,
    color: DARK,
    fontWeight: "900",
  },
  metricUnit: {
    fontSize: 10,
    color: MUTED,
  },
  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#E9EBF2",
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F5",
    marginTop: 16,
    paddingTop: 15,
  },
  viewProfileText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "800",
  },
  setupProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EF",
    borderRadius: 19,
    padding: 16,
    marginBottom: 29,
  },
  setupIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  setupTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  setupTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: DARK,
  },
  setupDescription: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
    marginTop: 5,
  },
  wellnessCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF2",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  wellnessRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  wellnessIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  wellnessText: {
    flex: 1,
    paddingRight: 8,
  },
  wellnessTitle: {
    fontSize: 13,
    color: DARK,
    fontWeight: "800",
  },
  wellnessSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    lineHeight: 15,
  },
  wellnessDivider: {
    height: 1,
    backgroundColor: "#EDF0F5",
  },
  footerText: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginVertical: 8,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9EBF2",
    paddingTop: 10,
    paddingBottom: 17,
  },
  bottomTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bottomTabLabel: {
    fontSize: 10,
    color: "#939AAA",
    fontWeight: "600",
  },
  bottomTabLabelActive: {
    color: PURPLE,
    fontWeight: "900",
  },
  activeTabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PURPLE,
    marginTop: 1,
  },
  modalRoot: {
    flex: 1,
    flexDirection: "row",
  },
 drawerBackdrop: {
  ...StyleSheet.absoluteFill,
  backgroundColor: "rgba(17,24,39,0.45)",
},

drawer: {
  width: "84%",
  maxWidth: 340,
  height: "100%",
  backgroundColor: "#FFFFFF",
  paddingTop: 53,
  paddingHorizontal: 17,
  paddingBottom: 20,
},

drawerMenuScroll: {
  flex: 1,
  minHeight: 0,
},

drawerMenuContent: {
  paddingBottom: 20,
},

drawerHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 25,
},
  drawerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  drawerUserInfo: {
    flex: 1,
    paddingRight: 8,
  },
  drawerName: {
    fontSize: 15,
    color: DARK,
    fontWeight: "900",
  },
  drawerEmail: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },
  drawerSectionLabel: {
    fontSize: 10,
    color: "#9AA1B0",
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  drawerItem: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 9,
    borderRadius: 11,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 12,
    color: "#424B5D",
    fontWeight: "700",
  },
  drawerBottom: {
    // marginTop: "auto",
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F5",
  },
  logoutButton: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FFF1F1",
  },
  logoutText: {
    fontSize: 13,
    color: "#D94A4A",
    fontWeight: "800",
  },
});