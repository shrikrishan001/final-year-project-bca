import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function FoodScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) setPhotoUri(photo.uri);
    } catch {
      Alert.alert("Camera error", "Photo capture nahi ho paya. Dobara try karo.");
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#B8EF50" size="large" />
        <Text style={styles.message}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={36} color="#B8EF50" />
        </View>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.message}>
          Allow camera access to take a photo of your meal.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Allow Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.message}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101110" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Scan your meal</Text>
          <Text style={styles.headerSubtitle}>Capture your food to get started</Text>
        </View>

        {!photoUri && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              setFacing((current) => current === "back" ? "front" : "back")
            }
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.preview}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              onCameraReady={() => setCameraReady(true)}
            />

            <View pointerEvents="none" style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <View style={styles.cameraHint}>
              <Ionicons name="scan-outline" size={17} color="#FFFFFF" />
              <Text style={styles.cameraHintText}>
                Centre your meal inside the frame
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.tipRow}>
          <Ionicons name="sunny-outline" size={22} color="#B8EF50" />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>For a better result</Text>
            <Text style={styles.tipText}>
              Use good lighting and keep the entire plate visible.
            </Text>
          </View>
        </View>

        {photoUri ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                Alert.alert(
                  "Photo captured",
                  "Photo ready hai. Automatic food recognition ke liye AI image-analysis integration next step mein connect karenge."
                );
              }}
            >
              <Ionicons name="sparkles" size={20} color="#151711" />
              <Text style={styles.primaryButtonText}>Analyze Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setPhotoUri(null)}
            >
              <Ionicons name="refresh-outline" size={19} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.captureButton,
              (!cameraReady || capturing) && { opacity: 0.5 },
            ]}
            onPress={takePhoto}
            disabled={!cameraReady || capturing}
          >
            {capturing ? (
              <ActivityIndicator color="#151711" />
            ) : (
              <Ionicons name="camera" size={25} color="#151711" />
            )}
            <Text style={styles.primaryButtonText}>
              {capturing ? "Capturing..." : "Capture Meal"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          Your meal photo stays on this screen until you leave or retake it.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101110" },
  center: {
    flex: 1,
    backgroundColor: "#101110",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 18,
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#252722",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: "#A6A99F", fontSize: 11, marginTop: 4 },
  preview: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#252722",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "contain" },
  scanFrame: {
    position: "absolute",
    width: "75%",
    height: "48%",
  },
  corner: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "#B8EF50",
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  cameraHint: {
    position: "absolute",
    bottom: 22,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 30,
  },
  cameraHintText: { color: "#FFFFFF", fontSize: 12 },
  bottomPanel: { padding: 20, paddingBottom: 28 },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#20231C",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  tipTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  tipText: { color: "#A6A99F", fontSize: 11, lineHeight: 17, marginTop: 4 },
  primaryButton: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: "#B8EF50",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  captureButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#B8EF50",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonText: { color: "#151711", fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#41433B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  footerText: {
    textAlign: "center",
    color: "#777B71",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 14,
  },
  permissionIcon: {
    width: 75, height: 75, borderRadius: 24,
    backgroundColor: "#252722",
    alignItems: "center", justifyContent: "center",
    marginBottom: 22,
  },
  message: {
    color: "#A6A99F",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },
  backButton: { padding: 12, marginTop: 8 },
});