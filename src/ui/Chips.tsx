import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { colors, radius, spacing } from "./theme";

type Option<T extends string | number> = { value: T; label: string };

/** A row of choices where one is selected: filters, payment modes, day presets. */
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
  const chips = options.map((o) => {
    const selected = o.value === value;
    return (
      <Pressable
        key={String(o.value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange(o.value)}
        style={[styles.chip, selected && styles.selected]}
      >
        <Text variant="bodyStrong" color={selected ? "#FFFFFF" : colors.text} style={styles.label}>
          {o.label}
        </Text>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {chips}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.wrap]}>{chips}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  wrap: { flexWrap: "wrap" },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 13 },
});
