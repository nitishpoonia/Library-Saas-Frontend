import { Color } from "expo-router";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useMemo } from "react";
import { DynamicColorIOS, Platform, StyleSheet, useColorScheme, type ColorValue, type TextStyle } from "react-native";

/**
 * Design tokens. The app follows each platform's own look instead of one custom style:
 *
 * - iOS uses Apple's semantic system colors (label, systemGroupedBackground, systemBlue…),
 *   the San Francisco font and Apple's type sizes. Those colors switch between light and
 *   dark mode by themselves. On iOS 26 the tab bar, headers and main buttons use Liquid Glass.
 * - Android uses Material 3: roles like surface, primaryContainer and onSurfaceVariant,
 *   Roboto and the Material type scale. On Android 12+ the colors come from the user's
 *   wallpaper (Material You); older phones get a fixed blue scheme built from the brand color.
 *
 * Screens never pick raw colors. They read roles from `useTheme()` or `makeStyles()`, so a
 * change here reaches every screen, and dark mode works everywhere.
 */

const isIOS = Platform.OS === "ios";

/** The brand blue, for places outside the app's own UI that need a plain hex (Razorpay's checkout). */
export const brandColor = "#3B82F6";

export type Palette = {
  primary: ColorValue;
  onPrimary: ColorValue;
  /** Tinted background for selected or highlighted things. */
  primarySoft: ColorValue;
  onPrimarySoft: ColorValue;
  /** Android's tonal buttons, selected chips and the tab indicator. */
  secondaryContainer: ColorValue;
  onSecondaryContainer: ColorValue;

  text: ColorValue;
  textMuted: ColorValue;
  textFaint: ColorValue;

  /** The page behind everything. */
  background: ColorValue;
  /** Cards and grouped lists. */
  surface: ColorValue;
  /** Inputs, chips and other controls. */
  fill: ColorValue;
  border: ColorValue;
  borderStrong: ColorValue;

  success: ColorValue;
  successSoft: ColorValue;
  successText: ColorValue;
  warning: ColorValue;
  warningSoft: ColorValue;
  warningText: ColorValue;
  danger: ColorValue;
  dangerSoft: ColorValue;
  dangerText: ColorValue;

  /** Touch feedback on Android. */
  ripple: ColorValue;
};

// ---------- iOS ----------

const dyn = (light: string, dark: string) => DynamicColorIOS({ light, dark });

function iosPalette(): Palette {
  return {
    primary: Color.ios.systemBlue,
    onPrimary: "#FFFFFF",
    primarySoft: dyn("rgba(0,122,255,0.12)", "rgba(10,132,255,0.24)"),
    onPrimarySoft: Color.ios.systemBlue,
    secondaryContainer: dyn("rgba(0,122,255,0.12)", "rgba(10,132,255,0.24)"),
    onSecondaryContainer: Color.ios.systemBlue,

    text: Color.ios.label,
    textMuted: Color.ios.secondaryLabel,
    textFaint: Color.ios.tertiaryLabel,

    background: Color.ios.systemGroupedBackground,
    surface: Color.ios.secondarySystemGroupedBackground,
    fill: Color.ios.tertiarySystemFill,
    border: Color.ios.separator,
    borderStrong: Color.ios.opaqueSeparator,

    success: Color.ios.systemGreen,
    successSoft: dyn("rgba(52,199,89,0.15)", "rgba(48,209,88,0.22)"),
    successText: dyn("#1E7B34", "#30D158"),
    warning: Color.ios.systemOrange,
    warningSoft: dyn("rgba(255,149,0,0.15)", "rgba(255,159,10,0.22)"),
    warningText: dyn("#A85B00", "#FF9F0A"),
    danger: Color.ios.systemRed,
    dangerSoft: dyn("rgba(255,59,48,0.12)", "rgba(255,69,58,0.22)"),
    dangerText: dyn("#C4261D", "#FF453A"),

    ripple: "transparent",
  };
}

// ---------- Android ----------

/** Material 3 scheme generated from the brand blue, for phones without Material You. */
const brandScheme = {
  light: {
    primary: "#005AC1",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D8E2FF",
    onPrimaryContainer: "#001A41",
    secondaryContainer: "#DBE2F9",
    onSecondaryContainer: "#141B2C",
    surface: "#F9F9FF",
    surfaceContainer: "#EDEDF4",
    surfaceContainerHighest: "#E2E2E9",
    onSurface: "#1A1B20",
    onSurfaceVariant: "#44474F",
    outline: "#74777F",
    outlineVariant: "#C4C6D0",
    error: "#BA1A1A",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#410002",
  },
  dark: {
    primary: "#ADC6FF",
    onPrimary: "#002E69",
    primaryContainer: "#004494",
    onPrimaryContainer: "#D8E2FF",
    secondaryContainer: "#3E4759",
    onSecondaryContainer: "#DBE2F9",
    surface: "#111318",
    surfaceContainer: "#1D2024",
    surfaceContainerHighest: "#33353A",
    onSurface: "#E2E2E9",
    onSurfaceVariant: "#C4C6D0",
    outline: "#8E9099",
    outlineVariant: "#44474F",
    error: "#FFB4AB",
    errorContainer: "#93000A",
    onErrorContainer: "#FFDAD6",
  },
} as const;

type SchemeRole = keyof (typeof brandScheme)["light"];

/** Material 3 has no success or warning roles; these are custom colors in the same style. */
const statusColors = {
  light: {
    success: "#1B6D2F",
    successSoft: "#C8F2C6",
    successText: "#00210A",
    warning: "#7C5800",
    warningSoft: "#FFDEA6",
    warningText: "#271900",
  },
  dark: {
    success: "#8BD88E",
    successSoft: "#005319",
    successText: "#A6F5A8",
    warning: "#F5BD48",
    warningSoft: "#5E4200",
    warningText: "#FFDEA6",
  },
} as const;

/** Material You needs Android 12 (API 31). */
const hasMaterialYou = Platform.OS === "android" && Number(Platform.Version) >= 31;

function androidPalette(dark: boolean): Palette {
  const fixed = dark ? brandScheme.dark : brandScheme.light;
  const role = (name: SchemeRole): ColorValue => {
    if (!hasMaterialYou) return fixed[name];
    // Read at call time; returns the wallpaper-based color for the current light/dark mode.
    return (Color.android.dynamic[name] as ColorValue | null) ?? fixed[name];
  };
  const status = dark ? statusColors.dark : statusColors.light;
  return {
    primary: role("primary"),
    onPrimary: role("onPrimary"),
    primarySoft: role("primaryContainer"),
    onPrimarySoft: role("onPrimaryContainer"),
    secondaryContainer: role("secondaryContainer"),
    onSecondaryContainer: role("onSecondaryContainer"),

    text: role("onSurface"),
    textMuted: role("onSurfaceVariant"),
    textFaint: role("outline"),

    background: role("surface"),
    surface: role("surfaceContainer"),
    fill: role("surfaceContainerHighest"),
    border: role("outlineVariant"),
    borderStrong: role("outline"),

    ...status,
    danger: role("error"),
    dangerSoft: role("errorContainer"),
    dangerText: role("onErrorContainer"),

    ripple: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
  };
}

// ---------- Type ----------

export type TextVariant = "title" | "heading" | "subheading" | "body" | "bodyStrong" | "label" | "caption" | "value";

/** Apple's text styles (Title 1, Title 3, Headline, Body, Footnote…) in San Francisco. */
const iosType: Record<TextVariant, TextStyle> = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: 0.36 },
  heading: { fontSize: 20, lineHeight: 25, fontWeight: "600", letterSpacing: 0.38 },
  subheading: { fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.43 },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: -0.43 },
  bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.43 },
  label: { fontSize: 13, lineHeight: 18, letterSpacing: -0.08 },
  caption: { fontSize: 15, lineHeight: 20, letterSpacing: -0.23 },
  value: { fontSize: 28, lineHeight: 34, fontWeight: "700", fontVariant: ["tabular-nums"] },
};

/** Material 3 type scale in Roboto (Headline Small, Title Medium, Body Large…). */
const androidType: Record<TextVariant, TextStyle> = {
  title: { fontSize: 24, lineHeight: 32 },
  heading: { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15 },
  subheading: { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15 },
  body: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.5 },
  caption: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  value: { fontSize: 24, lineHeight: 32, fontVariant: ["tabular-nums"] },
};

// ---------- Shape and space ----------

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/**
 * iOS uses larger, "continuous" corners. Material 3 uses its shape scale:
 * 4 for text fields, 8 for chips, 12 for cards, 16 for FABs, full for buttons.
 */
export const radius = isIOS
  ? ({ sm: 10, md: 12, lg: 22, pill: 999 } as const)
  : ({ sm: 8, md: 4, lg: 12, pill: 999 } as const);

// ---------- Theme ----------

export type Theme = {
  dark: boolean;
  colors: Palette;
  type: Record<TextVariant, TextStyle>;
  /** True on iOS 26+, where Liquid Glass is drawn by the system. */
  glass: boolean;
};

const glass = isIOS && isLiquidGlassAvailable();
const cache: Partial<Record<"light" | "dark", Theme>> = {};

function buildTheme(dark: boolean): Theme {
  return {
    dark,
    colors: isIOS ? iosPalette() : androidPalette(dark),
    type: isIOS ? iosType : androidType,
    glass,
  };
}

/** The current theme; re-renders the caller when the phone switches light/dark mode. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return (cache[scheme] ??= buildTheme(scheme === "dark"));
}

/**
 * Styles that depend on the theme. Define outside the component, call inside it:
 *
 *   const useStyles = makeStyles((t) => ({ box: { backgroundColor: t.colors.surface } }));
 *   function Box() { const styles = useStyles(); ... }
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
