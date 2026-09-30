import type { ReactNode } from "react";
import { Platform, Pressable, View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

type CardProps = { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; accessibilityLabel?: string };

/**
 * A grouped block of content: an inset-grouped cell on iOS, a filled card on Android.
 */
export function Card({ children, onPress, style, accessibilityLabel }: CardProps) {
  const t = useTheme();
  const styles = useStyles();
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        android_ripple={{ color: t.colors.ripple, foreground: true }}
        style={({ pressed }) => [styles.card, style, Platform.OS === "ios" && pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export type Tone = "default" | "success" | "warning" | "danger";

/** A number with a label, for dashboards and summaries. */
export function StatCard({
  label,
  value,
  hint,
  tone,
  onPress,
  style,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const valueColor: ColorValue =
    tone === "success" ? t.colors.success : tone === "warning" ? t.colors.warning : tone === "danger" ? t.colors.danger : t.colors.text;
  return (
    <Card onPress={onPress} style={style} accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ""}`}>
      <Text variant={Platform.OS === "ios" ? "label" : "caption"}>{label}</Text>
      <Text variant="value" color={valueColor} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text variant="label">{hint}</Text> : null}
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: radius.lg,
    borderCurve: "continuous",
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: "hidden",
  },
  pressed: { opacity: 0.6 },
}));
