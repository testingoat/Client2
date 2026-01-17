import { create } from 'zustand'

type ThemeState = {
  headerGradientTop?: string
  headerGradientBottom?: string
  contentBackgroundColor?: string
  setTheme: (theme: { headerGradientTop?: string; headerGradientBottom?: string; contentBackgroundColor?: string }) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  headerGradientTop: undefined,
  headerGradientBottom: undefined,
  contentBackgroundColor: undefined,
  setTheme: (theme) => set(theme),
}))
