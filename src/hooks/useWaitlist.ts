const STORAGE_KEY = 'sigma_waitlist_emails';

export function useWaitlist() {
  const submitEmail = (email: string): boolean => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (existing.includes(email)) return false;
      existing.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return true;
    } catch {
      return false;
    }
  };

  const getEmails = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  return { submitEmail, getEmails };
}
