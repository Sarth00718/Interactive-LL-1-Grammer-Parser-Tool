// ThemeContext removed as requested
export function ThemeProvider({ children }) {
  return children
}

export function useTheme() {
  return { isDark: false, toggleTheme: () => {} }
}
