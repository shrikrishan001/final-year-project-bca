import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserAccount = {
  name: string;
  email: string;
  password: string;
};

const ACCOUNT_KEY = "userAccount";
const SESSION_KEY = "userSession";

export const saveUserAccount = async (
  account: UserAccount
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ACCOUNT_KEY,
      JSON.stringify(account)
    );
  } catch (error) {
    console.log("Error saving account:", error);
  }
};

export const getUserAccount =
  async (): Promise<UserAccount | null> => {
    try {
      const data = await AsyncStorage.getItem(ACCOUNT_KEY);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as UserAccount;
    } catch (error) {
      console.log("Error reading account:", error);
      return null;
    }
  };

export const setLoggedIn = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, "true");
  } catch (error) {
    console.log("Error creating session:", error);
  }
};

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session === "true";
  } catch (error) {
    console.log("Error checking session:", error);
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.log("Error logging out:", error);
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      ACCOUNT_KEY,
      SESSION_KEY,
    ]);
  } catch (error) {
    console.log("Error deleting account:", error);
  }
};