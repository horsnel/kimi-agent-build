const AUTH_KEY = 'sigma_auth_user';
const ACCOUNTS_KEY = 'sigma_auth_accounts';

export interface SigmaUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  experience: string; // 'beginner' | 'intermediate' | 'advanced'
  interests: string[];
  onboardingComplete: boolean;
  createdAt: string;
}

interface StoredAccount {
  user: SigmaUser;
  password: string;
}

export function useAuth() {
  const getUser = (): SigmaUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SigmaUser;
    } catch {
      return null;
    }
  };

  const isLoggedIn = (): boolean => {
    return getUser() !== null;
  };

  const saveUser = (user: SigmaUser): void => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch {
      console.error('Failed to save user to localStorage');
    }
  };

  const removeUser = (): void => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      console.error('Failed to remove user from localStorage');
    }
  };

  const getAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as StoredAccount[];
    } catch {
      return [];
    }
  };

  const saveAccounts = (accounts: StoredAccount[]): void => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      console.error('Failed to save accounts to localStorage');
    }
  };

  const signUp = (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): { success: boolean; error?: string } => {
    if (!email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    if (!password.trim()) {
      return { success: false, error: 'Password is required' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    if (!firstName.trim()) {
      return { success: false, error: 'First name is required' };
    }
    if (!lastName.trim()) {
      return { success: false, error: 'Last name is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const accounts = getAccounts();
    const existingAccount = accounts.find(
      (a) => a.user.email.toLowerCase() === email.toLowerCase()
    );
    if (existingAccount) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser: SigmaUser = {
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      experience: '',
      interests: [],
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };

    accounts.push({ user: newUser, password });
    saveAccounts(accounts);
    saveUser(newUser);

    return { success: true };
  };

  const signIn = (
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    if (!email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    if (!password.trim()) {
      return { success: false, error: 'Password is required' };
    }

    const accounts = getAccounts();
    const account = accounts.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!account) {
      return { success: false, error: 'No account found with this email' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    saveUser(account.user);

    return { success: true };
  };

  const signOut = (): void => {
    removeUser();
  };

  const completeOnboarding = (experience: string, interests: string[]): void => {
    const user = getUser();
    if (!user) return;

    const updatedUser: SigmaUser = {
      ...user,
      experience,
      interests,
      onboardingComplete: true,
    };
    saveUser(updatedUser);

    // Also update the account in the accounts list
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((a) => a.user.id === user.id);
    if (accountIndex !== -1) {
      accounts[accountIndex].user = updatedUser;
      saveAccounts(accounts);
    }
  };

  const updateProfile = (updates: Partial<SigmaUser>): void => {
    const user = getUser();
    if (!user) return;

    const updatedUser: SigmaUser = {
      ...user,
      ...updates,
      id: user.id, // Prevent id from being overwritten
      createdAt: user.createdAt, // Prevent createdAt from being overwritten
    };
    saveUser(updatedUser);

    // Also update the account in the accounts list
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((a) => a.user.id === user.id);
    if (accountIndex !== -1) {
      accounts[accountIndex].user = updatedUser;
      saveAccounts(accounts);
    }
  };

  return {
    getUser,
    isLoggedIn,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
    updateProfile,
  };
}
