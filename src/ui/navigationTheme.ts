import { DarkTheme, DefaultTheme, type NativeStackNavigationOptions } from "expo-router";
import { Platform } from "react-native";
import type { Theme } from "./theme";

type NavTheme = typeof DefaultTheme;

/**
 * The React Navigation theme, needed so native tabs and stacks don't flash white in dark
 * mode (and so their defaults match our colors). React Navigation wants plain strings, so
 * iOS gets Apple's hex values; Android's palette is already strings (Material You resolves
 * to hex).
 */
export function navigationTheme(t: Theme): NavTheme {
  const base = t.dark ? DarkTheme : DefaultTheme;
  if (Platform.OS === "ios") {
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: t.dark ? "#0A84FF" : "#007AFF",
        background: t.dark ? "#000000" : "#F2F2F7",
        card: t.dark ? "#1C1C1E" : "#FFFFFF",
        text: t.dark ? "#FFFFFF" : "#000000",
        border: t.dark ? "#38383A" : "#C6C6C8",
      },
    };
  }
  const c = t.colors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: String(c.primary),
      background: String(c.background),
      card: String(c.background),
      text: String(c.text),
      border: String(c.border),
    },
  };
}

/**
 * Header setup shared by every stack.
 * iOS: the system navigation bar. On iOS 26 it's transparent with Liquid Glass buttons and
 * the content blurs softly under it (scroll edge effect); earlier versions get the classic
 * translucent blurred bar. Back buttons show only the chevron, as in iOS 26.
 * Android: a Material 3 top app bar in the page color, without a shadow.
 */
export function stackOptions(t: Theme, { largeTitle = false } = {}): NativeStackNavigationOptions {
  if (Platform.OS === "ios") {
    return {
      headerTransparent: true,
      headerBlurEffect: t.glass ? undefined : "systemChromeMaterial",
      headerLargeTitleEnabled: largeTitle,
      headerLargeTitleShadowVisible: false,
      headerBackButtonDisplayMode: "minimal",
      contentStyle: { backgroundColor: t.colors.background },
    };
  }
  return {
    headerStyle: { backgroundColor: t.colors.background },
    headerTintColor: t.colors.text,
    headerTitleStyle: { fontSize: largeTitle ? 22 : 20, fontWeight: "400", color: t.colors.text as string },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: t.colors.background },
  };
}
