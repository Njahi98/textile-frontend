import { createContext, use, useEffect, useMemo, useState } from "react"

type Theme = "dark" | "light" | "system"
type ColorTheme = "neutral" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet" | "zinc" | "slate" | "indigo"

interface ThemeProviderProps  {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
  colorStorageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  colorTheme: "neutral",
  setTheme: () => null,
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "neutral",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [colorTheme, setColorTheme] = useState<ColorTheme>(
    () => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme
  )

  const applyTheme = (newTheme: Theme, newColorTheme: ColorTheme) => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.remove("theme-neutral", "theme-rose", "theme-orange", "theme-green", "theme-blue", "theme-yellow", "theme-violet", "theme-zinc", "theme-slate","theme-indigo")

    root.classList.add(`theme-${newColorTheme}`)

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  useEffect(() => {
    applyTheme(theme, colorTheme)
  }, [theme, colorTheme])

  const value = useMemo(() => ({
    theme,
    colorTheme,
    setTheme: (newTheme: Theme) => {
      // Check if View Transitions API is supported
      if (!document.startViewTransition) {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
        return
      }

      document.startViewTransition(() => {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      })
    },
    setColorTheme: (newColorTheme: ColorTheme) => {
      // Check if View Transitions API is supported
      if (!document.startViewTransition) {
        localStorage.setItem(colorStorageKey, newColorTheme)
        setColorTheme(newColorTheme)
        return
      }

      document.startViewTransition(() => {
        localStorage.setItem(colorStorageKey, newColorTheme)
        setColorTheme(newColorTheme)
      })
    },
  }), [theme, colorTheme, storageKey, colorStorageKey])

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  )
}

export const useTheme = () => {
  const context = use(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}