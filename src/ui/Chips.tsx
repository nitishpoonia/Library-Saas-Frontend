import { Platform, Pressable, ScrollView, View } from "react-native";
import { Icon, icons } from "./Icon";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

type Option<T extends string | number> = { value: T; label: string };

const isIOS = Platform.OS === "ios";

/**
 * A row of choices where one is selected: filters, payment modes, day presets.
 * iOS: capsules, the selected one filled with the tint color.
 * Android: Material 3 filter chips, the selected one tonal with a check mark.
 */
export function Chips<T extends string | number>({
  options,
  value,
  onChange,
  scroll,
}: {
  options: Array<Option<T>>;
  value: T | null;
  onChange: (value: T) => void;
  /** Horizontal scroll instead of wrapping, for long filter rows. */
  scroll?: boolean;
}) {
  const t = useTheme();
  const styles = useStyles();

  const chips = options.map((o) => {
    const selected = o.value === value;
    const fg = selected ? (isIOS ? t.colors.onPrimary : t.colors.onSecondaryContainer) : isIOS ? t.colors.text : t.colors.textMuted;
    return (
      <Pressable
        key={String(o.value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange(o.value)}
        android_ripple={{ color: t.colors.ripple, foreground: true }}
        style={({ pressed }) => [styles.chip, selected && styles.selected, isIOS && pressed && styles.pressed]}
      >
        {!isIOS && selected ? <Icon name={icons.check} size={18} color={fg} /> : null}
        <Text variant="bodyStrong" color={fg} style={styles.label}>
          {o.label}
        </Text>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, styles.scrollContent]}
        style={styles.scroller}
      >
        {chips}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.wrap]}>{chips}</View>;
}

const useStyles = makeStyles((t) => ({
  // Let a scrolling row run to the screen edges while its first chip lines up with the content.
  scroller: { marginHorizontal: -spacing.lg, flexGrow: 0 },
  row: { flexDirection: "row", gap: spacing.sm },
  scrollContent: { paddingHorizontal: spacing.lg },
  wrap: { flexWrap: "wrap" },
  chip: isIOS
    ? {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 34,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        backgroundColor: t.colors.surface,
      }
    : {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        height: 32,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: t.colors.borderStrong,
        overflow: "hidden",
      },
  selected: isIOS
    ? { backgroundColor: t.colors.primary }
    : { backgroundColor: t.colors.secondaryContainer, borderColor: "transparent", paddingLeft: spacing.sm },
  pressed: { opacity: 0.6 },
  label: isIOS ? { fontSize: 15 } : { fontSize: 14, letterSpacing: 0.1 },
}));
