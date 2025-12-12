import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

// Keep a simple default theme for when user has none
const defaultTheme: Theme = {
  id: 'default',
  name: 'Padrão',
  colors: {
    primary: '210 80% 40%',
    secondary: '200 60% 90%',
    accent: '180 70% 85%',
    background: '210 40% 96%',
    foreground: '210 80% 20%',
    card: '210 40% 94%',
    muted: '200 30% 90%',
  },
};

// Keep this export for backward compatibility, but empty
export const presetThemes: Theme[] = [];

interface ThemeContextType {
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);

  // Fetch theme from Supabase on user login
  useEffect(() => {
    const fetchTheme = async () => {
      if (!user) {
        setCurrentTheme(defaultTheme);
        setCustomThemes([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_settings')
          .select('custom_theme')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.custom_theme) {
          const themeData = data.custom_theme as { current: Theme; custom: Theme[] };
          if (themeData.current) setCurrentTheme(themeData.current);
          if (themeData.custom) setCustomThemes(themeData.custom);
        }
      } catch (e) {
        console.error('Error fetching theme:', e);
      }
    };

    fetchTheme();
  }, [user]);

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

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Save theme to Supabase when it changes
  const saveThemeToSupabase = async (current: Theme, custom: Theme[]) => {
    if (!user) return;

    try {
      await supabase
        .from('business_settings')
        .upsert({
          user_id: user.id,
          custom_theme: { current, custom }
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    saveThemeToSupabase(theme, customThemes);
  };

  const addCustomTheme = (theme: Theme) => {
    const newCustomThemes = [...customThemes, theme];
    setCustomThemes(newCustomThemes);
    saveThemeToSupabase(currentTheme, newCustomThemes);
  };

  const deleteCustomTheme = (id: string) => {
    const newCustomThemes = customThemes.filter((t) => t.id !== id);
    setCustomThemes(newCustomThemes);

    if (currentTheme.id === id) {
      const newCurrent = newCustomThemes.length > 0 ? newCustomThemes[0] : defaultTheme;
      setCurrentTheme(newCurrent);
      saveThemeToSupabase(newCurrent, newCustomThemes);
    } else {
      saveThemeToSupabase(currentTheme, newCustomThemes);
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

