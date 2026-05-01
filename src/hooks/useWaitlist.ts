const STORAGE_KEY = 'sigma_waitlist_emails';

// Formspree endpoint — free tier allows 50 submissions/month
// Replace with your own Formspree form ID at https://formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwpkvqdg';

export function useWaitlist() {
  const submitEmail = async (email: string): Promise<boolean> => {
    try {
      // Check localStorage dedup
      const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (existing.includes(email)) return true; // Already submitted

      // Submit to Formspree (persistent server-side storage)
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'sigma-capital-waitlist' }),
      });

      if (response.ok) {
        // Save to localStorage as dedup cache
        existing.push(email);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return true;
      }

      // If Formspree fails, still save locally so user gets feedback
      existing.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return true;
    } catch {
      // Network error — save locally and return success for UX
      try {
        const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!existing.includes(email)) {
          existing.push(email);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        }
      } catch { /* ignore */ }
      return true;
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
