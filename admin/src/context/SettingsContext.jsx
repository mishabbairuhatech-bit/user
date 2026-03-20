import { createContext, useState, useEffect, useContext } from 'react';

// Available primary colors with full palette
export const primaryColors = [
  {
    name: 'Green',
    value: 'green',
    color: '#166534',
    shades: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#166534',
      800: '#14532d', 900: '#052e16'
    }
  },
  {
    name: 'Blue',
    value: 'blue',
    color: '#1d4ed8',
    shades: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
      800: '#1e40af', 900: '#1e3a8a'
    }
  },
  {
    name: 'Purple',
    value: 'purple',
    color: '#7c3aed',
    shades: {
      50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
      400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed',
      800: '#6b21a8', 900: '#581c87'
    }
  },
  {
    name: 'Red',
    value: 'red',
    color: '#dc2626',
    shades: {
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
      400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
      800: '#991b1b', 900: '#7f1d1d'
    }
  },
  {
    name: 'Orange',
    value: 'orange',
    color: '#ea580c',
    shades: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12'
    }
  },
  {
    name: 'Pink',
    value: 'pink',
    color: '#db2777',
    shades: {
      50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4',
      400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d',
      800: '#9d174d', 900: '#831843'
    }
  },
  {
    name: 'Teal',
    value: 'teal',
    color: '#0d9488',
    shades: {
      50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
      400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
      800: '#115e59', 900: '#134e4a'
    }
  },
  {
    name: 'Indigo',
    value: 'indigo',
    color: '#4f46e5',
    shades: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
      400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
      800: '#3730a3', 900: '#312e81'
    }
  },
];

// Available font families
export const fontFamilies = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
];

// Default settings
const defaultSettings = {
  themeMode: 'system', // 'light', 'dark', 'system'
  primaryColor: 'green',
  fontFamily: 'Inter, sans-serif',
  sidebarPosition: 'left', // 'left', 'right'
  compactMode: false,
  animations: true,
  borderRadius: 'rounded', // 'none', 'small', 'rounded', 'full'
  fontSize: 'medium', // 'small', 'medium', 'large'
  posCartPosition: 'right', // 'left', 'right'
  posViewType: 'grid', // 'grid', 'table'
  posSummaryPosition: 'right', // 'left', 'right' — table-view bill summary panel
  mailSidebarPosition: 'left', // 'left', 'right' — mail portal sidebar + list position
};

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('app-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme mode with real-time system theme listener
  useEffect(() => {
    const root = document.documentElement;

    if (settings.themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.toggle('dark', mediaQuery.matches);

      const handleChange = (e) => {
        root.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.toggle('dark', settings.themeMode === 'dark');
    }
  }, [settings.themeMode]);

  // Apply primary color CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colorData = primaryColors.find(c => c.value === settings.primaryColor);
    if (colorData && colorData.shades) {
      // Set all shade variables
      Object.entries(colorData.shades).forEach(([shade, value]) => {
        root.style.setProperty(`--primary-${shade}`, value);
      });
      root.style.setProperty('--primary-color', colorData.color);
    }
  }, [settings.primaryColor]);

  // Apply font family
  useEffect(() => {
    document.body.style.fontFamily = settings.fontFamily;
  }, [settings.fontFamily]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[settings.fontSize] || '16px';
  }, [settings.fontSize]);

  // Apply border radius
  useEffect(() => {
    document.documentElement.setAttribute('data-radius', settings.borderRadius);
  }, [settings.borderRadius]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
