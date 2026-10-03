import { GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ColorValue, type PressableProps } from "react-native";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme, type Theme } from "./theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = Omit<PressableProps, "children"> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
};

type Look = { bg: ColorValue; fg: ColorValue; border?: ColorValue };

/**
 * iOS: capsule buttons. On iOS 26 the primary button is tinted Liquid Glass and the others
 * are clear glass; earlier versions get Apple's filled and tinted button styles.
 * Android: Material 3 filled, tonal, text and outlined (error) buttons.
 */
function look(t: Theme, variant: Variant, inactive: boolean): Look {
  const c = t.colors;
  if (Platform.OS === "ios") {
    if (inactive && variant === "primary") return { bg: c.fill, fg: c.textFaint };
    switch (variant) {
      case "primary":
        return { bg: c.primary, fg: c.onPrimary };
      case "secondary":
        return { bg: c.primarySoft, fg: c.primary };
      case "ghost":
        return { bg: "transparent", fg: c.primary };
      case "danger":
        return { bg: c.dangerSoft, fg: c.danger };
    }
  }
  switch (variant) {
    case "primary":
      return inactive ? { bg: c.fill, fg: c.textFaint } : { bg: c.primary, fg: c.onPrimary };
    case "secondary":
      return { bg: c.secondaryContainer, fg: c.onSecondaryContainer };
    case "ghost":
      return { bg: "transparent", fg: c.primary };
    case "danger":
      return { bg: "transparent", fg: c.danger, border: c.borderStrong };
  }
}

export function Button({ title, variant = "primary", loading, disabled, icon, style, ...rest }: Props) {
  const t = useTheme();
  const styles = useStyles();
  const inactive = !!(disabled || loading);
  const l = look(t, variant, !!disabled);
  // Glass can't be faded with opacity (it stops rendering), so disabled glass buttons
  // switch to a grey fill instead.
  const useGlass = t.glass && variant !== "ghost" && !disabled;

  const label = loading ? (
    <ActivityIndicator color={l.fg} />
  ) : (
    <View style={styles.row}>
      {icon}
      <Text variant="bodyStrong" color={l.fg} style={styles.label} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      android_ripple={{ color: t.colors.ripple, foreground: true }}
      style={(state) => [
        styles.base,
        !useGlass && { backgroundColor: l.bg },
        l.border ? { borderWidth: 1, borderColor: l.border } : null,
        Platform.OS === "ios" && state.pressed && (useGlass ? styles.pressedGlass : styles.pressed),
        // Primary has its own grey disabled colors; the others fade.
        disabled && variant !== "primary" && styles.dimmed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {useGlass ? (
        <GlassView
          glassEffectStyle="regular"
          pointerEvents="none"
          tintColor={variant === "primary" ? t.colors.primary : variant === "danger" ? t.colors.dangerSoft : undefined}
          style={[StyleSheet.absoluteFill, styles.glass]}
        />
      ) : null}
      {label}
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    minHeight: Platform.OS === "ios" ? 50 : 48,
    borderRadius: radius.pill,
    borderCurve: "continuous",
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glass: { borderRadius: radius.pill },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: Platform.OS === "android" ? { fontSize: 14, letterSpacing: 0.1 } : {},
  pressed: { opacity: 0.7 },
  // Fading glass breaks it, so pressed glass shrinks a little instead.
  pressedGlass: { transform: [{ scale: 0.97 }] },
  dimmed: { opacity: 0.4 },
}));
