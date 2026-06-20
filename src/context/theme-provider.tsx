import { createContext, useContext, useEffect } from 'react'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  defaultTheme: Theme
  resolvedTheme: ResolvedTheme
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const initialState: ThemeProviderState = {
  defaultTheme: 'light',
  resolvedTheme: 'light',
  theme: 'light',
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Always force the light theme
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
  }, [])

  const contextValue: ThemeProviderState = {
    defaultTheme: 'light',
    resolvedTheme: 'light',
    theme: 'light',
    setTheme: () => null,
    resetTheme: () => null,
  }

  return (
    <ThemeContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
