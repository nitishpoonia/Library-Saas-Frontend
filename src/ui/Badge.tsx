import { Platform, View, type ColorValue } from "react-native";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme, type Theme } from "./theme";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

function tone(t: Theme, value: Tone): { bg: ColorValue; fg: ColorValue } {
  const c = t.colors;
  switch (value) {
    case "neutral":
      return { bg: c.fill, fg: c.textMuted };
    case "success":
      return { bg: c.successSoft, fg: c.successText };
    case "warning":
      return { bg: c.warningSoft, fg: c.warningText };
    case "danger":
      return { bg: c.dangerSoft, fg: c.dangerText };
    case "info":
      return { bg: c.primarySoft, fg: c.onPrimarySoft };
  }
}

/** A short status label: a tinted capsule on iOS, a small tonal label on Android. */
export function Badge({ label, tone: value = "neutral" }: { label: string; tone?: Tone }) {
  const t = useTheme();
  const styles = useStyles();
  const c = tone(t, value);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text variant="label" color={c.fg} style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: Platform.OS === "ios" ? radius.pill : 6,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  text: Platform.OS === "ios" ? { fontSize: 12, fontWeight: "600" } : { fontSize: 12 },
}));
