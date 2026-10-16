import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  getFitnessProfile,
  FitnessProfile,
} from "../utils/fitnessStorage";

import { logoutUser } from "../utils/authStorage";

export default function HomeScreen() {
  const [profile, setProfile] =
    useState<FitnessProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [greeting, setGreeting] =
    useState("Good Morning");

  const [drawerVisible, setDrawerVisible] =
    useState(false);

  useEffect(() => {
    loadProfile();
    updateGreeting();

    const timer = setInterval(() => {
      updateGreeting();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // GREETING
  // ==========================================

  const updateGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  const loadProfile = async () => {
    try {
      const data = await getFitnessProfile();
      setProfile(data);
    } catch (error) {
      console.log("Home profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CALORIES
  // ==========================================

  const calculateCalories = () => {
    if (!profile) {
      return 0;
    }

    const {
      age,
      weight,
      height,
      gender,
      activity,
      goal,
    } = profile;

    let bmr = 0;

    if (gender === "male") {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age +
        5;
    } else {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age -
        161;
    }

    let activityMultiplier = 1.2;

    if (activity === "moderate") {
      activityMultiplier = 1.55;
    }

    if (activity === "high") {
      activityMultiplier = 1.725;
    }

    let calories =
      bmr * activityMultiplier;

    if (goal === "lose") {
      calories -= 400;
    }

    if (goal === "gain") {
      calories += 300;
    }

    return Math.round(calories);
  };

  // ==========================================
  // GOAL TEXT
  // ==========================================

  const getGoalText = () => {
    if (!profile) {
      return "Fitness";
    }

    if (profile.goal === "lose") {
      return "Lose Weight";
    }

    if (profile.goal === "gain") {
      return "Build Muscle";
    }

    return "Maintain Weight";
  };

  // ==========================================
  // ACTIVITY TEXT
  // ==========================================

  const getActivityText = () => {
    if (!profile) {
      return "Fitness";
    }

    if (profile.activity === "low") {
      return "Beginner";
    }

    if (profile.activity === "high") {
      return "Very Active";
    }

    return "Moderately Active";
  };

  // ==========================================
  // INITIAL
  // ==========================================

  const getInitial = () => {
    if (!profile?.name) {
      return "U";
    }

    return profile.name
      .charAt(0)
      .toUpperCase();
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    setDrawerVisible(false);

    try {
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // ==========================================
  // DRAWER NAVIGATION
  // ==========================================

  const navigateFromDrawer = (
    routeName: string
  ) => {
    setDrawerVisible(false);

    setTimeout(() => {
      router.push(routeName as any);
    }, 150);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#5B5BD6"
        />
      </View>
    );
  }

  const dailyCalories =
    calculateCalories();

  return (
    <View style={styles.container}>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =================================
            HEADER
        ================================= */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              setDrawerVisible(true)
            }
          >
            <Ionicons
              name="menu"
              size={25}
              color="#202A3D"
            />
          </TouchableOpacity>

          <View
            style={styles.headerTextContainer}
          >
            <Text style={styles.smallText}>
              {greeting}
            </Text>

            <Text style={styles.title}>
              {profile?.name
                ? `Ready to get stronger, ${profile.name}?`
                : "Ready to get stronger?"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() =>
              router.push(
                "/fitness-profile" as any
              )
            }
          >
            <Text style={styles.profileText}>
              {getInitial()}
            </Text>
          </TouchableOpacity>

        </View>

        {/* =================================
            TODAY ACTIVITY
        ================================= */}

        <View style={styles.activityCard}>

          <View style={styles.activityHeader}>

            <View>
              <Text style={styles.cardLabel}>
                TODAY'S ACTIVITY
              </Text>

              <Text
                style={styles.activityTitle}
              >
                Keep moving
              </Text>
            </View>

            <Ionicons
              name="flame"
              size={29}
              color="#FFFFFF"
            />

          </View>

          <View style={styles.statsRow}>

            <View>
              <Text style={styles.statValue}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Steps
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                0.0
              </Text>

              <Text style={styles.statLabel}>
                km
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Calories
              </Text>
            </View>

          </View>

          <Text style={styles.activityNote}>
            Connect health data to track your
            real activity
          </Text>

        </View>

        {/* =================================
            DAILY CALORIE TARGET
        ================================= */}

        <View style={styles.goalCard}>

          <View style={styles.goalIcon}>
            <Ionicons
              name="locate-outline"
              size={25}
              color="#5B5BD6"
            />
          </View>

          <View style={styles.goalContent}>

            <Text style={styles.goalLabel}>
              DAILY CALORIE TARGET
            </Text>

            <Text
              style={styles.goalCalories}
            >
              {dailyCalories > 0
                ? `${dailyCalories} kcal`
                : "--"}
            </Text>

            <Text
              style={styles.goalDescription}
            >
              Based on your profile and
              fitness goal
            </Text>

          </View>

        </View>

        {/* =================================
            PROFILE
        ================================= */}

        {profile && (
          <>
            <Text style={styles.sectionTitle}>
              Your Fitness Profile
            </Text>

            <View style={styles.profileCard}>

              <View style={styles.profileRow}>

                <View style={styles.profileInfo}>
                  <Text
                    style={styles.profileLabel}
                  >
                    Goal
                  </Text>

                  <Text
                    style={styles.profileValue}
                  >
                    {getGoalText()}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text
                    style={styles.profileLabel}
                  >
                    Activity
                  </Text>

                  <Text
                    style={styles.profileValue}
                  >
                    {getActivityText()}
                  </Text>
                </View>

              </View>

              <View
                style={styles.profileDivider}
              />

              <View style={styles.profileRow}>

                <View style={styles.profileInfo}>
                  <Text
                    style={styles.profileLabel}
                  >
                    Weight
                  </Text>

                  <Text
                    style={styles.profileValue}
                  >
                    {profile.weight} kg
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text
                    style={styles.profileLabel}
                  >
                    Height
                  </Text>

                  <Text
                    style={styles.profileValue}
                  >
                    {profile.height} cm
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text
                    style={styles.profileLabel}
                  >
                    Age
                  </Text>

                  <Text
                    style={styles.profileValue}
                  >
                    {profile.age}
                  </Text>
                </View>

              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push(
                    "/fitness-profile" as any
                  )
                }
              >
                <Text
                  style={styles.editButtonText}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>

            </View>
          </>
        )}

        {/* =================================
            AI COACH
        ================================= */}

        <Text style={styles.sectionTitle}>
          AI Coach
        </Text>

        <TouchableOpacity
          style={styles.aiCard}
          onPress={() =>
            router.push("/coach" as any)
          }
        >

          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={24}
              color="#5B5BD6"
            />
          </View>

          <View style={styles.aiContent}>

            <Text style={styles.aiTitle}>
              Your personal AI Coach
            </Text>

            <Text
              style={styles.aiDescription}
            >
              Get personalized fitness,
              workout and nutrition guidance.
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#A0A6B4"
          />

        </TouchableOpacity>

        {/* =================================
            QUICK ACTIONS
        ================================= */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionGrid}>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                "/workout-generator" as any
              )
            }
          >

            <View style={styles.actionIcon}>
              <Ionicons
                name="barbell-outline"
                size={22}
                color="#5B5BD6"
              />
            </View>

            <Text style={styles.actionTitle}>
              Workout
            </Text>

            <Text
              style={styles.actionSubtitle}
            >
              Generate a plan
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                "/meal-analyzer" as any
              )
            }
          >
            <TouchableOpacity
  style={styles.actionCard}
  onPress={() => router.push("/nutrition" as any)}
>
  <View style={styles.actionIcon}>
    <Ionicons
      name="nutrition-outline"
      size={24}
      color="#5B5BD6"
    />
  </View>

  <Text style={styles.actionTitle}>
    Nutrition
  </Text>

  <Text style={styles.actionSubtitle}>
    Track meals and calories
  </Text>
</TouchableOpacity>

            <View style={styles.actionIcon}>
              <Ionicons
                name="restaurant-outline"
                size={22}
                color="#5B5BD6"
              />
            </View>

            <Text style={styles.actionTitle}>
              Meal Analysis
            </Text>

            <Text
              style={styles.actionSubtitle}
            >
              Analyze nutrition
            </Text>

          </TouchableOpacity>

        </View>

        {/* =================================
            PROGRESS
        ================================= */}

        <TouchableOpacity
          style={styles.progressCard}
          onPress={() =>
            router.push(
              "/progress" as any
            )
          }
        >

          <View style={styles.progressIcon}>
            <Ionicons
              name="stats-chart-outline"
              size={23}
              color="#5B5BD6"
            />
          </View>

          <View style={styles.progressContent}>

            <Text
              style={styles.progressTitle}
            >
              Progress Dashboard
            </Text>

            <Text
              style={styles.progressSubtitle}
            >
              Track your fitness journey
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#A0A6B4"
          />

        </TouchableOpacity>

        {/* =================================
            LOGOUT
        ================================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color="#E05252"
          />

          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* =================================
            BOTTOM NAV
        ================================= */}

        <View style={styles.bottomNav}>

          <TouchableOpacity
            style={styles.navItem}
          >
            <Ionicons
              name="home"
              size={22}
              color="#5B5BD6"
            />

            <Text
              style={styles.navTextActive}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() =>
              router.push("/coach" as any)
            }
          >
            <Ionicons
              name="sparkles-outline"
              size={21}
              color="#9299A8"
            />

            <Text style={styles.navText}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() =>
              router.push(
                "/fitness-profile" as any
              )
            }
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#9299A8"
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* =====================================
          DRAWER
      ===================================== */}

      <Modal
        visible={drawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDrawerVisible(false)
        }
      >

        <View style={styles.drawerOverlay}>

          {/* DRAWER */}

          <View style={styles.drawer}>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.drawerContent
              }
            >

              {/* DRAWER HEADER */}

              <View style={styles.drawerHeader}>

                <View
                  style={styles.drawerBrandIcon}
                >
                  <Ionicons
                    name="flash"
                    size={24}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={styles.drawerBrandText}
                >
                  <Text
                    style={
                      styles.drawerBrandTitle
                    }
                  >
                    AI Fitness Coach
                  </Text>

                  <Text
                    style={
                      styles.drawerBrandSubtitle
                    }
                  >
                    Your personal fitness companion
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setDrawerVisible(false)
                  }
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color="#687083"
                  />
                </TouchableOpacity>

              </View>

              {/* USER PROFILE */}

              <TouchableOpacity
                style={styles.drawerProfile}
                onPress={() =>
                  navigateFromDrawer(
                    "/fitness-profile"
                  )
                }
              >

                <View
                  style={styles.drawerAvatar}
                >
                  <Text
                    style={
                      styles.drawerAvatarText
                    }
                  >
                    {getInitial()}
                  </Text>
                </View>

                <View
                  style={styles.drawerUserInfo}
                >
                  <Text
                    style={styles.drawerUserName}
                  >
                    {profile?.name ||
                      "Fitness User"}
                  </Text>

                  <Text
                    style={
                      styles.drawerUserGoal
                    }
                  >
                    {getGoalText()} •{" "}
                    {getActivityText()}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#A0A6B4"
                />

              </TouchableOpacity>

              {/* FITNESS */}

              <Text style={styles.drawerSection}>
                FITNESS
              </Text>

              <DrawerItem
                icon="sparkles"
                title="AI Coach"
                subtitle="Personal fitness guidance"
                onPress={() =>
                  navigateFromDrawer("/coach")
                }
              />

              <DrawerItem
                icon="barbell-outline"
                title="Workout Plans"
                subtitle="Generate your workout"
                onPress={() =>
                  navigateFromDrawer(
                    "/workout-generator"
                  )
                }
              />

              <DrawerItem
                icon="restaurant-outline"
                title="Meal Analyzer"
                subtitle="Analyze your nutrition"
                onPress={() =>
                  navigateFromDrawer(
                    "/meal-analyzer"
                  )
                }
              />

              <DrawerItem
                icon="flame-outline"
                title="Calorie Calculator"
                subtitle="Calculate daily calories"
                onPress={() =>
                  navigateFromDrawer("/coach")
                }
              />

              <DrawerItem
                icon="stats-chart-outline"
                title="Progress"
                subtitle="Track your fitness journey"
                onPress={() =>
                  navigateFromDrawer(
                    "/progress"
                  )
                }
              />

              {/* TRACKING */}

              <Text style={styles.drawerSection}>
                TRACKING
              </Text>

              <DrawerItem
                icon="calendar-outline"
                title="Calendar"
                subtitle="Plan and review your days"
                onPress={() =>
                  navigateFromDrawer(
                    "/calendar"
                  )
                }
              />

              <DrawerItem
                icon="timer-outline"
                title="Workout Timer"
                subtitle="Workout and rest timer"
                onPress={() =>
                  navigateFromDrawer(
                    "/workout-timer"
                  )
                }
              />

              <DrawerItem
                icon="stopwatch-outline"
                title="Stopwatch"
                subtitle="Track your workout time"
                onPress={() =>
                  navigateFromDrawer(
                    "/stopwatch"
                  )
                }
              />

              <DrawerItem
                icon="water-outline"
                title="Water Tracker"
                subtitle="Track your daily hydration"
                onPress={() =>
                  navigateFromDrawer(
                    "/water-tracker"
                  )
                }
              />

              <DrawerItem
                icon="scale-outline"
                title="Weight Tracker"
                subtitle="Monitor weight progress"
                onPress={() =>
                  navigateFromDrawer(
                    "/weight-tracker"
                  )
                }
              />

              <DrawerItem
                icon="footsteps-outline"
                title="Activity"
                subtitle="Steps, distance and calories"
                onPress={() =>
                  navigateFromDrawer(
                    "/progress"
                  )
                }
              />

              {/* PLANNING */}

              <Text style={styles.drawerSection}>
                PLANNING
              </Text>

              <DrawerItem
                icon="calendar-number-outline"
                title="Workout Schedule"
                subtitle="Plan your weekly workouts"
                onPress={() =>
                  navigateFromDrawer(
                    "/calendar"
                  )
                }
              />

              <DrawerItem
                icon="notifications-outline"
                title="Reminders"
                subtitle="Manage your fitness reminders"
                onPress={() =>
                  navigateFromDrawer(
                    "/reminders"
                  )
                }
              />

              <DrawerItem
                icon="flag-outline"
                title="Daily Goals"
                subtitle="Track your daily targets"
                onPress={() =>
                  navigateFromDrawer(
                    "/progress"
                  )
                }
              />

              {/* APP */}

              <Text style={styles.drawerSection}>
                APP
              </Text>

              <DrawerItem
                icon="trophy-outline"
                title="Achievements"
                subtitle="Your fitness milestones"
                onPress={() =>
                  navigateFromDrawer(
                    "/progress"
                  )
                }
              />

              <DrawerItem
                icon="heart-outline"
                title="Health Data"
                subtitle="View your fitness data"
                onPress={() =>
                  navigateFromDrawer(
                    "/progress"
                  )
                }
              />

              <DrawerItem
                icon="settings-outline"
                title="Settings"
                subtitle="Manage your profile"
                onPress={() =>
                  navigateFromDrawer(
                    "/fitness-profile"
                  )
                }
              />

              <DrawerItem
                icon="help-circle-outline"
                title="Help & Support"
                subtitle="Get fitness guidance"
                onPress={() =>
                  navigateFromDrawer(
                    "/coach"
                  )
                }
              />

              {/* LOGOUT */}

              <TouchableOpacity
                style={styles.drawerLogout}
                onPress={handleLogout}
              >

                <View
                  style={styles.drawerLogoutIcon}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#D94C4C"
                  />
                </View>

                <Text
                  style={styles.drawerLogoutText}
                >
                  Logout
                </Text>

              </TouchableOpacity>

              <Text style={styles.versionText}>
                AI Fitness Coach • v1.0
              </Text>

            </ScrollView>

          </View>

          {/* OUTSIDE DRAWER */}

          <Pressable
            style={styles.drawerOutside}
            onPress={() =>
              setDrawerVisible(false)
            }
          />

        </View>

      </Modal>

    </View>
  );
}

// ==========================================
// DRAWER ITEM
// ==========================================

function DrawerItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={onPress}
      activeOpacity={0.75}
    >

      <View style={styles.drawerItemIcon}>
        <Ionicons
          name={icon as any}
          size={21}
          color="#5B5BD6"
        />
      </View>

      <View
        style={styles.drawerItemContent}
      >
        <Text
          style={styles.drawerItemTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.drawerItemSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#A7ADBA"
      />

    </TouchableOpacity>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  smallText: {
    fontSize: 14,
    color: "#7B8292",
    fontWeight: "600",
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#182235",
    marginTop: 4,
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#5B5BD6",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  // ACTIVITY

  activityCard: {
    backgroundColor: "#5B5BD6",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    color: "#DCD9FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  activityTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.2)",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  statLabel: {
    color: "#DCD9FF",
    fontSize: 12,
    marginTop: 3,
  },

  activityNote: {
    color: "#DCD9FF",
    fontSize: 10,
    marginTop: 18,
    textAlign: "center",
  },

  // GOAL

  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 28,
  },

  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEECFF",
    justifyContent: "center",
    alignItems: "center",
  },

  goalContent: {
    flex: 1,
    marginLeft: 13,
  },

  goalLabel: {
    fontSize: 10,
    color: "#7A8293",
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  goalCalories: {
    fontSize: 20,
    color: "#202A3D",
    fontWeight: "900",
    marginTop: 2,
  },

  goalDescription: {
    fontSize: 11,
    color: "#858C9B",
    marginTop: 2,
  },

  // SECTION

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#182235",
    marginBottom: 13,
  },

  // PROFILE

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 28,
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  profileInfo: {
    flex: 1,
  },

  profileLabel: {
    fontSize: 11,
    color: "#858C9B",
  },

  profileValue: {
    fontSize: 14,
    color: "#202A3D",
    fontWeight: "800",
    marginTop: 4,
  },

  profileDivider: {
    height: 1,
    backgroundColor: "#ECEEF3",
    marginVertical: 15,
  },

  editButton: {
    marginTop: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  editButtonText: {
    color: "#5B5BD6",
    fontSize: 13,
    fontWeight: "800",
  },

  // AI

  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 28,
  },

  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEECFF",
    justifyContent: "center",
    alignItems: "center",
  },

  aiContent: {
    flex: 1,
    marginLeft: 13,
  },

  aiTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202A3D",
  },

  aiDescription: {
    fontSize: 12,
    color: "#7A8293",
    lineHeight: 18,
    marginTop: 4,
  },

  // ACTIONS

  actionGrid: {
    flexDirection: "row",
    marginBottom: 14,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginHorizontal: 6,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202A3D",
  },

  actionSubtitle: {
    fontSize: 11,
    color: "#858C9B",
    marginTop: 4,
  },

  // PROGRESS

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 14,
  },

  progressIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  progressContent: {
    flex: 1,
    marginLeft: 13,
  },

  progressTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202A3D",
  },

  progressSubtitle: {
    fontSize: 12,
    color: "#858C9B",
    marginTop: 4,
  },

  // LOGOUT

  logoutButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },

  logoutText: {
    color: "#E05252",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  // BOTTOM NAV

  bottomNav: {
    height: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginTop: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navTextActive: {
    fontSize: 11,
    color: "#5B5BD6",
    fontWeight: "800",
    marginTop: 3,
  },

  navText: {
    fontSize: 11,
    color: "#9299A8",
    fontWeight: "600",
    marginTop: 3,
  },

  // DRAWER

  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor:
      "rgba(12,18,35,0.48)",
  },

  drawer: {
    width: "84%",
    maxWidth: 360,
    height: "100%",
    backgroundColor: "#F8F9FC",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 5,
      height: 0,
    },
  },

  drawerOutside: {
    flex: 1,
  },

  drawerContent: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  drawerBrandIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#5B5BD6",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerBrandText: {
    flex: 1,
    marginLeft: 12,
  },

  drawerBrandTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#182235",
  },

  drawerBrandSubtitle: {
    fontSize: 10,
    color: "#858C9B",
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
  },

  // DRAWER PROFILE

  drawerProfile: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E9EF",
    marginBottom: 20,
  },

  drawerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#5B5BD6",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  drawerUserInfo: {
    flex: 1,
    marginLeft: 11,
  },

  drawerUserName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#202A3D",
  },

  drawerUserGoal: {
    fontSize: 10,
    color: "#858C9B",
    marginTop: 4,
  },

  // DRAWER SECTION

  drawerSection: {
    fontSize: 10,
    fontWeight: "900",
    color: "#939AAA",
    letterSpacing: 1.2,
    marginTop: 7,
    marginBottom: 8,
    paddingLeft: 4,
  },

  // DRAWER ITEM

  drawerItem: {
    minHeight: 62,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEEF3",
  },

  drawerItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerItemContent: {
    flex: 1,
    marginLeft: 11,
  },

  drawerItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#202A3D",
  },

  drawerItemSubtitle: {
    fontSize: 9,
    color: "#8A91A0",
    marginTop: 3,
  },

  // DRAWER LOGOUT

  drawerLogout: {
    height: 52,
    backgroundColor: "#FFF4F4",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F6DADA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 16,
  },

  drawerLogoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFE7E7",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerLogoutText: {
    color: "#D94C4C",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 11,
  },

  versionText: {
    textAlign: "center",
    color: "#A0A6B4",
    fontSize: 9,
    marginTop: 18,
  },
});