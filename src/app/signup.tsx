import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { saveUserAccount } from "../utils/authStorage";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Please fill all the fields."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Password should contain at least 6 characters."
      );
      return;
    }

    const account = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    await saveUserAccount(account);

    router.push("/onboarding");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressActive} />
        <View style={styles.progressInactive} />
        <View style={styles.progressInactive} />
      </View>

      <Text style={styles.stepText}>STEP 1 OF 3</Text>

      <Text style={styles.title}>Create your account</Text>

      <Text style={styles.subtitle}>
        Let's get started with your personal fitness journey.
      </Text>

      {/* Name */}
      <Text style={styles.label}>Full Name</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#9AA1B2"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#9AA1B2"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Create a password"
        placeholderTextColor="#9AA1B2"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Privacy */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>🔒</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Your data stays private
          </Text>

          <Text style={styles.infoText}>
            Your fitness information is stored securely on your
            device.
          </Text>
        </View>
      </View>

      {/* Continue */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      {/* Login */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>
          Already have an account?
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.loginLink}> Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7ED",
  },

  backText: {
    fontSize: 24,
    color: "#273146",
  },

  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 28,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#5B5BD6",
  },

  progressInactive: {
    height: 5,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#E2E4EB",
  },

  stepText: {
    marginTop: 25,
    fontSize: 12,
    fontWeight: "800",
    color: "#6257D4",
    letterSpacing: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#182235",
    marginTop: 7,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#777F90",
    marginTop: 9,
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#293247",
    marginBottom: 8,
    marginTop: 13,
  },

  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E4EB",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#182235",
  },

  infoCard: {
    marginTop: 23,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#EEECFF",
    flexDirection: "row",
  },

  infoIcon: {
    fontSize: 20,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#443CA6",
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6C6790",
    marginTop: 3,
  },

  button: {
    height: 56,
    backgroundColor: "#5B5BD6",
    borderRadius: 16,
    marginTop: 28,
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

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  loginText: {
    fontSize: 13,
    color: "#7A8292",
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5B5BD6",
  },
});