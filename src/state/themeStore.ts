import { create } from 'zustand'

type ThemeState = {
  headerGradientTop?: string
  headerGradientBottom?: string
  setTheme: (theme: { headerGradientTop?: string; headerGradientBottom?: string }) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  headerGradientTop: undefined,
  headerGradientBottom: undefined,
  setTheme: (theme) => set(theme),
}))

