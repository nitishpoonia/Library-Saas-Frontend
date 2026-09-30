import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { colors, radius, spacing } from "./theme";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "#F3F4F6", fg: colors.textMuted },
  success: { bg: colors.successSoft, fg: colors.successText },
  warning: { bg: colors.warningSoft, fg: "#92400E" },
  danger: { bg: "#FEE2E2", fg: colors.dangerText },
  info: { bg: colors.primarySoft, fg: colors.primaryDark },
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text variant="caption" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, alignSelf: "flex-start" },
});
