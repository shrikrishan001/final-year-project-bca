import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* LOGO */}
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>⚡</Text>
        </View>

        <Text style={styles.brand}>AI Fitness Coach</Text>

        <Text style={styles.title}>
          Your personal{"\n"}
          <Text style={styles.highlight}>AI fitness</Text> companion
        </Text>

        <Text style={styles.subtitle}>
          Build better habits, get smarter workouts and
          personalized nutrition guidance — all in one place.
        </Text>

        {/* FEATURES */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text>🤖</Text>
            </View>

            <View>
              <Text style={styles.featureTitle}>AI Coach</Text>
              <Text style={styles.featureText}>
                Personalized fitness guidance
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text>💪</Text>
            </View>

            <View>
              <Text style={styles.featureTitle}>Smart Workouts</Text>
              <Text style={styles.featureText}>
                Plans built around your goals
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text>🥗</Text>
            </View>

            <View>
              <Text style={styles.featureTitle}>Nutrition</Text>
              <Text style={styles.featureText}>
                Understand what you eat
              </Text>
            </View>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttons}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.primaryButtonText}>
              Get Started →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Your fitness journey starts here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 45,
    paddingBottom: 25,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#5548D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  logo: {
    fontSize: 30,
  },

  brand: {
    fontSize: 15,
    fontWeight: "800",
    color: "#5548D9",
    letterSpacing: 0.4,
    marginBottom: 28,
  },

  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    color: "#182235",
  },

  highlight: {
    color: "#5548D9",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#737B8C",
    marginTop: 16,
    maxWidth: 340,
  },

  features: {
    marginTop: 30,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182235",
  },

  featureText: {
    fontSize: 12,
    color: "#8A91A2",
    marginTop: 3,
  },

  buttons: {
    marginTop: "auto",
  },

  primaryButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#5548D9",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  secondaryButtonText: {
    color: "#5548D9",
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#A0A5B1",
    marginTop: 8,
  },
});