import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
};

export default function AIChatScreen() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI Fitness Coach. How can I help you today?",
      sender: "ai",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userText = message.trim();

    const userMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    const text = userText.toLowerCase();

    let aiReply =
      "I can help you with workouts, nutrition, calories, weight loss and fitness goals.";

    if (text.includes("workout") || text.includes("exercise")) {
      aiReply =
        "For a beginner workout, start with 5 minutes of warm-up, followed by squats, push-ups, lunges and a short cool-down.";
    } else if (
      text.includes("food") ||
      text.includes("nutrition") ||
      text.includes("diet")
    ) {
      aiReply =
        "Try to include protein, vegetables, whole grains and enough water in your daily meals.";
    } else if (
      text.includes("calorie") ||
      text.includes("calories")
    ) {
      aiReply =
        "Your daily calorie requirement depends on your age, weight, height, gender, activity level and goal.";
    } else if (
      text.includes("weight loss") ||
      text.includes("lose weight")
    ) {
      aiReply =
        "For gradual weight loss, focus on a sustainable calorie deficit, enough protein, strength training and regular daily activity.";
    } else if (
      text.includes("protein")
    ) {
      aiReply =
        "Protein helps support muscle recovery and growth. Good sources include eggs, chicken, fish, paneer, curd, milk, dal and beans.";
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiReply,
          sender: "ai",
        },
      ]);
    }, 700);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          <Text style={styles.avatarText}>✦</Text>
        </View>

        <View>
          <Text style={styles.headerTitle}>AI Fitness Coach</Text>
          <Text style={styles.onlineText}>● Online</Text>
        </View>
      </View>

      {/* CHAT */}

      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageBubble,
              item.sender === "user"
                ? styles.userBubble
                : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "user"
                  ? styles.userText
                  : styles.aiText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* QUICK QUESTIONS */}

      <View style={styles.quickSection}>
        <Text style={styles.quickTitle}>Quick questions</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setMessage("Give me a workout plan")}
          >
            <Text style={styles.quickText}>💪 Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setMessage("Give me nutrition advice")}
          >
            <Text style={styles.quickText}>🥗 Nutrition</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setMessage("How many calories do I need?")}
          >
            <Text style={styles.quickText}>🔥 Calories</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* INPUT */}

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask your fitness question..."
          placeholderTextColor="#9298A6"
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomColor: "#E7E8ED",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F1F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    color: "#182235",
    marginTop: -4,
  },

  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 26,
    color: "#5548D9",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#182235",
  },

  onlineText: {
    fontSize: 12,
    color: "#35A66F",
    marginTop: 3,
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },

  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 19,
    marginBottom: 12,
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#5548D9",
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  aiText: {
    color: "#3B4352",
  },

  userText: {
    color: "#FFFFFF",
  },

  quickSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#687080",
    marginBottom: 10,
  },

  quickButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 8,
  },

  quickText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B4352",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 16,
    padding: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E2E7",
    borderRadius: 20,
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 90,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
    color: "#182235",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#5548D9",
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },
});