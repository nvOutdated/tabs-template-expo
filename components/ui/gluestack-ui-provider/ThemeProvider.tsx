// components/ui/ThemeProvider/ThemeProvider.tsx
"use client";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { themeColors } from "@/constants/themeColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from "react";
// 扩展主题类型
type Theme = "light" | "dark" | "blue" | "yellow" | "pink" | "green";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const { setColorScheme } = useColorScheme();

  // 添加 GluestackUIProvider 的集成
  const wrappedChildren = (
    <GluestackUIProvider mode={theme}>
      {children}
    </GluestackUIProvider>
  );

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem("theme") as Theme;
      if (savedTheme && ["light", "dark", "blue", "yellow", "pink", "green"].includes(savedTheme)) {
        setTheme(savedTheme);
        // setColorScheme(savedTheme);
      }
    })();
  }, []);

  const toggleTheme = () => {
    // 主题循环切换：light -> dark -> blue -> yellow -> pink -> green -> light
    const themeOrder: Theme[] = ["light", "dark", "blue", "yellow", "pink", "green"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const newTheme = themeOrder[nextIndex];
    setTheme(newTheme);
    // setColorScheme(newTheme);
    //console.log(newTheme,"主题切换");
    
    AsyncStorage.setItem("theme", newTheme);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // setColorScheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: changeTheme }}>
      {wrappedChildren}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useCurrentTheme = () => {
  const { theme } = useTheme();
  return themeColors[theme as keyof typeof themeColors];
};