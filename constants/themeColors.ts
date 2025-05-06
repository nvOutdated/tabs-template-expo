export const themeColors = {
  blue: {
    drawerBg: "#409eff",
    textColor: "#fff",
    activeBg: "#1e88e5",
    activeTint: "#fff",
    inactiveTint: "#e3f2fd",
    headerBg: "#2979ff"
  },
  light: {
    drawerBg: "#f5f5f5",
    textColor: "#333",
    activeBg: "#e0e0e0",
    activeTint: "#1976d2",
    inactiveTint: "#616161",
    headerBg: "#fff"
  },
  dark: {
    drawerBg: "#121212",
    textColor: "#e0e0e0",
    activeBg: "#333333",
    activeTint: "#90caf9",
    inactiveTint: "#b0bec5",
    headerBg: "#1e1e1e"
  }
} as const;

export type ThemeType = keyof typeof themeColors; 