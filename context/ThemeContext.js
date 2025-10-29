import { createContext, useState, useEffect } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = (enabled) => {
    setIsDarkMode(enabled)
  }

  const theme = {
    dark: {
      background: "#1a1a1a",
      surface: "#2a2a2a",
      card: "#2a2a2a",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      border: "#3a3a3a",
      primary: "#FF6B35",
      accent: "#FFD700",
      tabBar: "#2a2a2a",
      tabBarInactive: "#999",
      tabBarActive: "#FFD700",
    },
    light: {
      background: "#F5F5F5",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      text: "#333333",
      textSecondary: "#666666",
      border: "#E0E0E0",
      primary: "#FF6B35",
      accent: "#FF6B35",
      tabBar: "#FFFFFF",
      tabBarInactive: "#999",
      tabBarActive: "#FF6B35",
    },
  }

  const currentTheme = isDarkMode ? theme.dark : theme.light

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
