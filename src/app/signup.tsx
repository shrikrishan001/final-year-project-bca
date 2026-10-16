import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  saveUserAccount,
  setLoggedIn,
} from "../utils/authStorage";
import {
  saveFitnessProfile,
  getFitnessProfile,
} from "../utils/fitnessStorage";

const isValidGmail = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());

const isStrongPassword = (password: string) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill all the fields.");
      return;
    }

    if (cleanName.length < 2) {
      Alert.alert("Invalid name", "Please enter your full name.");
      return;
    }

    if (!isValidGmail(cleanEmail)) {
      Alert.alert(
        "Invalid Gmail",
        "Please enter a valid Gmail address ending in @gmail.com."
      );
      return;
    }

    if (!isStrongPassword(password)) {
      Alert.alert(
        "Weak password",
        "Use at least 8 characters, including one uppercase letter, one number and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Both passwords must match.");
      return;
    }

    try {
      setLoading(true);

      // 1. Save the registered account.
      await saveUserAccount({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      // 2. Preserve existing fitness details, if available.
      const existingProfile = await getFitnessProfile();

      // 3. Save the registration name in the fitness profile too.
      await saveFitnessProfile({
        name: cleanName,
        age: existingProfile?.age ?? 21,
        height: existingProfile?.height ?? 170,
        weight: existingProfile?.weight ?? 70,
        gender: existingProfile?.gender ?? "male",
        goal: existingProfile?.goal ?? "maintain",
        activity: existingProfile?.activity ?? "moderate",
      });

      // 4. Mark this account as logged in.
      await setLoggedIn(cleanEmail);

      Alert.alert(
        "Account created",
        "Your account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/onboarding"),
          },
        ]
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_ALREADY_EXISTS"
      ) {
        Alert.alert(
          "Account already exists",
          "This Gmail is already registered. Please log in instead."
        );
      } else {
        console.error("Signup error:", error);
        Alert.alert(
          "Signup failed",
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color="#273146" />
      </TouchableOpacity>

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

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#9AA1B2"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        maxLength={60}
      />

      <Text style={styles.label}>Gmail Address</Text>
      <TextInput
        style={styles.input}
        placeholder="you@gmail.com"
        placeholderTextColor="#9AA1B2"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Create a strong password"
          placeholderTextColor="#9AA1B2"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={21}
            color="#777F90"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.helper}>
        8+ characters, uppercase letter, number and special character.
      </Text>

      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Re-enter your password"
          placeholderTextColor="#9AA1B2"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeButton}
          accessibilityLabel={
            showConfirmPassword
              ? "Hide confirm password"
              : "Show confirm password"
          }
        >
          <Ionicons
            name={
              showConfirmPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={21}
            color="#777F90"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons
          name="shield-checkmark-outline"
          size={23}
          color="#443CA6"
        />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Your data matters</Text>
          <Text style={styles.infoText}>
            This signup currently uses local device storage for development.
            It does not verify Gmail ownership.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.buttonText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
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
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#293247",
    marginBottom: 8,
    marginTop: 15,
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
  passwordWrap: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E4EB",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#182235",
  },
  eyeButton: {
    height: "100%",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  helper: {
    fontSize: 11,
    color: "#777F90",
    marginTop: 7,
    lineHeight: 16,
  },
  infoCard: {
    marginTop: 23,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#EEECFF",
    flexDirection: "row",
    gap: 10,
  },
  infoContent: {
    flex: 1,
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
    minHeight: 56,
    backgroundColor: "#5B5BD6",
    borderRadius: 16,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
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