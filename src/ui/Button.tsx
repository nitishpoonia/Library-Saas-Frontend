import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from "react-native";
import { Text } from "./Text";
import { colors, radius, spacing } from "./theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = Omit<PressableProps, "children"> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
};

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: "#FFFFFF", border: colors.primary },
  secondary: { bg: colors.background, fg: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", fg: colors.primary, border: "transparent" },
  danger: { bg: colors.background, fg: colors.danger, border: colors.danger },
};

export function Button({ title, variant = "primary", loading, disabled, icon, style, ...rest }: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      style={(state) => [
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border, opacity: inactive ? 0.6 : state.pressed ? 0.85 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text variant="bodyStrong" color={p.fg}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
