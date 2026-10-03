import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { Text } from "./Text";
import { colors, radius, spacing } from "./theme";

export function Card({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: ViewStyle }) {
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A number with a label, like the old InfoCard. */
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
  tone?: "default" | "success" | "warning" | "danger";
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const valueColor =
    tone === "success" ? colors.success : tone === "warning" ? colors.warning : tone === "danger" ? colors.danger : colors.text;
  return (
    <Card onPress={onPress} style={style}>
      <Text variant="label">{label}</Text>
      <Text variant="value" color={valueColor} style={styles.value}>
        {value}
      </Text>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.85 },
  value: { marginTop: spacing.xs },
});
