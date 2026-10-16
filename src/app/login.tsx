import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  authenticateUser,
  setLoggedIn,
} from "../utils/authStorage";

const isValidGmail = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Missing information", "Enter your Gmail and password.");
      return;
    }

    if (!isValidGmail(cleanEmail)) {
      Alert.alert("Invalid Gmail", "Please enter a valid @gmail.com address.");
      return;
    }

    try {
      setLoading(true);

      const account = await authenticateUser(cleanEmail, password);

      if (!account) {
        Alert.alert(
          "Login failed",
          "This Gmail is not registered, or the password is incorrect."
        );
        return;
      }

      await setLoggedIn(account.email);
      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login failed", "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#182235" />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name="fitness-outline" size={30} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Login with the Gmail and password you registered with.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Gmail address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@gmail.com"
              placeholderTextColor="#A1A6B2"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#A1A6B2"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="current-password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color="#777F90"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgot}
              onPress={() =>
                Alert.alert(
                  "Forgot password?",
                  "Password reset is not configured in this local development version."
                )
              }
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={18} color="#777F90" />
            <Text style={styles.noteText}>
              Accounts are currently stored locally on this device.
            </Text>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 35 },
  backButton: {
    width: 44, height: 44, borderRadius: 15, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E1E2E7",
    justifyContent: "center", alignItems: "center", marginBottom: 30,
  },
  logoCircle: {
    width: 58, height: 58, borderRadius: 20, backgroundColor: "#5548D9",
    justifyContent: "center", alignItems: "center", marginBottom: 22,
  },
  title: { fontSize: 32, fontWeight: "900", color: "#182235" },
  subtitle: { fontSize: 14, color: "#7B8291", marginTop: 8, lineHeight: 21 },
  form: { marginTop: 24 },
  label: { fontSize: 13, fontWeight: "700", color: "#30394B", marginBottom: 8, marginTop: 16 },
  input: {
    height: 54, backgroundColor: "#FFFFFF", borderWidth: 1,
    borderColor: "#E1E2E7", borderRadius: 15, paddingHorizontal: 16,
    fontSize: 14, color: "#182235",
  },
  passwordWrap: {
    height: 54, flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E1E2E7",
    borderRadius: 15,
  },
  passwordInput: { flex: 1, height: "100%", paddingHorizontal: 16, fontSize: 14, color: "#182235" },
  eyeButton: { height: "100%", paddingHorizontal: 15, justifyContent: "center", alignItems: "center" },
  forgot: { alignSelf: "flex-end", marginTop: 12 },
  forgotText: { fontSize: 12, fontWeight: "700", color: "#5548D9" },
  loginButton: {
    height: 56, backgroundColor: "#5548D9", borderRadius: 17,
    justifyContent: "center", alignItems: "center", marginTop: 24,
    flexDirection: "row", gap: 10,
  },
  disabledButton: { opacity: 0.7 },
  loginButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  note: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 22 },
  noteText: { fontSize: 11, color: "#777F90", flexShrink: 1 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  signupText: { fontSize: 13, color: "#7B8291" },
  signupLink: { fontSize: 13, fontWeight: "800", color: "#5548D9" },
});