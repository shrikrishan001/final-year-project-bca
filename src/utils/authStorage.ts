import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserAccount = {
  name: string;
  email: string;
  password: string;
};

const ACCOUNTS_KEY = "userAccounts";
const LEGACY_ACCOUNT_KEY = "userAccount";
const SESSION_KEY = "userSession";

const normalizeEmail = (email: string) =>
  email.trim().toLowerCase();

const readAccounts = async (): Promise<UserAccount[]> => {
  const saved = await AsyncStorage.getItem(ACCOUNTS_KEY);

  if (saved) {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as UserAccount[]) : [];
  }

  // Migrate an existing single account, if present.
  const legacy = await AsyncStorage.getItem(LEGACY_ACCOUNT_KEY);

  if (!legacy) return [];

  try {
    const account = JSON.parse(legacy) as UserAccount;

    if (account.email && account.password) {
      const migrated = [{ ...account, email: normalizeEmail(account.email) }];
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(migrated));
      await AsyncStorage.removeItem(LEGACY_ACCOUNT_KEY);
      return migrated;
    }
  } catch {
    // Ignore malformed legacy data.
  }

  return [];
};

export const saveUserAccount = async (
  account: UserAccount
): Promise<void> => {
  const email = normalizeEmail(account.email);
  const accounts = await readAccounts();

  if (accounts.some((item) => normalizeEmail(item.email) === email)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  accounts.push({ ...account, email });
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const getUserAccount = async (): Promise<UserAccount | null> => {
  try {
    const accounts = await readAccounts();
    return accounts[0] ?? null;
  } catch (error) {
    console.error("Error reading accounts:", error);
    return null;
  }
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<UserAccount | null> => {
  const accounts = await readAccounts();
  const normalizedEmail = normalizeEmail(email);

  return (
    accounts.find(
      (account) =>
        normalizeEmail(account.email) === normalizedEmail &&
        account.password === password
    ) ?? null
  );
};

export const setLoggedIn = async (email?: string): Promise<void> => {
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: email ? normalizeEmail(email) : "" })
  );
};

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session !== null;
  } catch {
    return false;
  }
};

export const getLoggedInEmail = async (): Promise<string | null> => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    if (!session) return null;

    const parsed = JSON.parse(session);
    return typeof parsed.email === "string" ? parsed.email : null;
  } catch {
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const deleteAccount = async (): Promise<void> => {
  const email = await getLoggedInEmail();

  if (!email) {
    await logoutUser();
    return;
  }

  const accounts = await readAccounts();
  const remaining = accounts.filter(
    (account) => normalizeEmail(account.email) !== normalizeEmail(email)
  );

  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remaining));
  await logoutUser();
};

export const getLoggedInUser = async (): Promise<UserAccount | null> => {
  try {
    const email = await getLoggedInEmail();

    if (!email) {
      return null;
    }

    const accounts = await readAccounts();

    return (
      accounts.find(
        (account) =>
          normalizeEmail(account.email) === normalizeEmail(email)
      ) ?? null
    );
  } catch (error) {
    console.error("Error loading logged-in user:", error);
    return null;
  }
};

