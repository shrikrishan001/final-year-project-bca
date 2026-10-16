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
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Text style={styles.logo}>⚡</Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Login to continue your fitness journey.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#A1A6B2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#A1A6B2"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.loginButtonText}>
                Login →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 35,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  backText: {
    fontSize: 32,
    color: "#182235",
    marginTop: -4,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#5548D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  logo: {
    fontSize: 27,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#182235",
  },

  subtitle: {
    fontSize: 14,
    color: "#7B8291",
    marginTop: 8,
    lineHeight: 21,
  },

  form: {
    marginTop: 30,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#30394B",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#182235",
  },

  forgot: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  forgotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5548D9",
  },

  loginButton: {
    height: 56,
    backgroundColor: "#5548D9",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E1E2E7",
  },

  orText: {
    fontSize: 11,
    color: "#9A9FAB",
    marginHorizontal: 12,
    fontWeight: "700",
  },

  googleButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4285F4",
    marginRight: 10,
  },

  googleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#30394B",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  signupText: {
    fontSize: 13,
    color: "#7B8291",
  },

  signupLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5548D9",
  },
});