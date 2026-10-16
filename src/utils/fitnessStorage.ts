import AsyncStorage from "@react-native-async-storage/async-storage";

export type FitnessProfile = {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female";
  goal: "lose" | "maintain" | "gain";
  activity: "low" | "moderate" | "high";
};

const PROFILE_KEY = "fitnessProfile";

export const saveFitnessProfile = async (
  profile: FitnessProfile
): Promise<void> => {
  await AsyncStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(profile)
  );
};

export const getFitnessProfile =
  async (): Promise<FitnessProfile | null> => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);

      if (!data) return null;

      const profile: unknown = JSON.parse(data);

      if (
        typeof profile !== "object" ||
        profile === null ||
        !("age" in profile) ||
        !("height" in profile) ||
        !("weight" in profile)
      ) {
        return null;
      }

      return profile as FitnessProfile;
    } catch (error) {
      console.error("Error reading fitness profile:", error);
      return null;
    }
  };

export const deleteFitnessProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(PROFILE_KEY);
};