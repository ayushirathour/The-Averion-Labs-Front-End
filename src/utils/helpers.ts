
export const formatRelativeTime = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const getDiagnosisBgColor = (diagnosis: string) => {
  return diagnosis === 'PNEUMONIA' ? 'bg-red-100' : 'bg-green-100';
};

export const getDiagnosisColor = (diagnosis: string) => {
  return diagnosis === 'PNEUMONIA' ? 'text-red-600' : 'text-green-600';
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 90) return { level: 'high', label: 'High' };
  if (confidence >= 70) return { level: 'medium', label: 'Medium' };
  if (confidence >= 50) return { level: 'low', label: 'Low' };
  return { level: 'very-low', label: 'Very Low' };
};

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const downloadFile = (data: any, filename: string, type: string = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        console.log('Text copied to clipboard (fallback)');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        throw new Error('Copy to clipboard failed');
      }
      
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    throw error;
  }
};

export const cn = (...inputs: Array<string | Record<string, boolean> | null | undefined>): string => {
  return inputs
    .map((input) => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([_key, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
};

export type ThemePreference = 'light' | 'dark' | 'auto';

export const getStoredTheme = (): ThemePreference => {
  const stored = localStorage.getItem('al_theme') as ThemePreference | null;
  return stored || 'light';
};

export const applyTheme = (preference: ThemePreference) => {
  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = preference === 'dark' || (preference === 'auto' && prefersDark);
    const root = document.documentElement;
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
    root.setAttribute('data-theme', preference);
    localStorage.setItem('al_theme', preference);
  } catch (e) {
  }
};