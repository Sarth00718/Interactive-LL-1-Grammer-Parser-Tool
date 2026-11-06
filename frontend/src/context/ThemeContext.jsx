import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('laboratory_theme')
      return saved === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('laboratory_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('laboratory_theme', 'light')
      }
    } catch {
      // ignore localStorage quota errors
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: isDark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return { isDark: false, toggleTheme: () => {}, theme: 'light' }
  }
  return context
}
