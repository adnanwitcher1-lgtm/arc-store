import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "arc_theme";

export const THEMES = [
  { id: "light", label: "Light", swatch: ["#f3f1ec", "#1e4638"] },
  { id: "gold", label: "Gold & Black", swatch: ["#15120d", "#d9b64e"] },
  { id: "forest", label: "Forest", swatch: ["#0e2019", "#3fa66b"] },
  { id: "midnight", label: "Midnight", swatch: ["#0c1526", "#2f6fed"] },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
