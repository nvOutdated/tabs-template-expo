export const themeColors = {
  blue: {
    drawerBg: "#409eff",
    textColor: "#fff",
    activeBg: "#1e88e5",
    activeTint: "#fff",
    inactiveTint: "#e3f2fd",
    headerBg: "#2979ff"
  },
  yellow: {
    drawerBg: "#ffd700",
    textColor: "#000",
    activeBg: "#ffc107",
    activeTint: "#000",
    inactiveTint: "#fff8e1",
    headerBg: "#ffb300"
  },
  pink: {
    drawerBg: "#ff69b4",
    textColor: "#fff",
    activeBg: "#e91e63",
    activeTint: "#fff",
    inactiveTint: "#fce4ec",
    headerBg: "#d81b60"
  },
  green: {
    drawerBg: "#4caf50",
    textColor: "#fff",
    activeBg: "#388e3c",
    activeTint: "#fff",
    inactiveTint: "#e8f5e9",
    headerBg: "#2e7d32"
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