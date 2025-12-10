import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
  };
}

export const presetThemes: Theme[] = [
  {
    id: 'olive',
    name: 'Oliva (Padrão)',
    colors: {
      primary: '78 44% 20%',
      secondary: '108 53% 89%',
      accent: '138 78% 90%',
      background: '78 50% 92%',
      foreground: '78 44% 20%',
      card: '78 50% 90%',
      muted: '108 43% 89%',
    },
  },
  {
    id: 'ocean',
    name: 'Oceano',
    colors: {
      primary: '210 80% 40%',
      secondary: '200 60% 90%',
      accent: '180 70% 85%',
      background: '210 40% 96%',
      foreground: '210 80% 20%',
      card: '210 40% 94%',
      muted: '200 30% 90%',
    },
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    colors: {
      primary: '20 90% 48%',
      secondary: '35 90% 90%',
      accent: '45 100% 85%',
      background: '30 50% 96%',
      foreground: '20 50% 20%',
      card: '30 50% 94%',
      muted: '35 40% 90%',
    },
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    colors: {
      primary: '270 60% 50%',
      secondary: '280 50% 92%',
      accent: '290 60% 88%',
      background: '270 30% 97%',
      foreground: '270 50% 20%',
      card: '270 30% 95%',
      muted: '280 25% 92%',
    },
  },
  {
    id: 'forest',
    name: 'Floresta',
    colors: {
      primary: '150 60% 30%',
      secondary: '140 40% 88%',
      accent: '160 50% 85%',
      background: '150 30% 95%',
      foreground: '150 50% 15%',
      card: '150 30% 93%',
      muted: '140 25% 90%',
    },
  },
  {
    id: 'rose',
    name: 'Rosê',
    colors: {
      primary: '340 70% 50%',
      secondary: '350 60% 92%',
      accent: '330 50% 88%',
      background: '340 30% 97%',
      foreground: '340 50% 20%',
      card: '340 30% 95%',
      muted: '350 25% 92%',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return presetThemes[0];
      }
    }
    return presetThemes[0];
  });

  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    const saved = localStorage.getItem('custom-themes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-foreground', theme.colors.background);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--secondary-foreground', theme.colors.foreground);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--accent-foreground', theme.colors.foreground);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--card', theme.colors.card);
    root.style.setProperty('--card-foreground', theme.colors.foreground);
    root.style.setProperty('--popover', theme.colors.background);
    root.style.setProperty('--popover-foreground', theme.colors.foreground);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--muted-foreground', `${theme.colors.foreground.split(' ')[0]} 5% 37%`);
    root.style.setProperty('--sidebar-background', theme.colors.background);
    root.style.setProperty('--sidebar-foreground', theme.colors.foreground);
    root.style.setProperty('--sidebar-primary', theme.colors.primary);
    root.style.setProperty('--sidebar-accent', theme.colors.secondary);
    root.style.setProperty('--ring', theme.colors.primary);
    root.style.setProperty('--border', theme.colors.muted);
    root.style.setProperty('--input', theme.colors.muted);
  };

  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem('app-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  const addCustomTheme = (theme: Theme) => {
    setCustomThemes((prev) => [...prev, theme]);
  };

  const deleteCustomTheme = (id: string) => {
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));
    if (currentTheme.id === id) {
      setCurrentTheme(presetThemes[0]);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, customThemes, setTheme, addCustomTheme, deleteCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
