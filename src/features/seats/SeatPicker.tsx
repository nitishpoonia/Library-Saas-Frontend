import { Platform, Pressable, View } from "react-native";
import type { SeatAvailability } from "@/api/types";
import { Text, makeStyles, radius, spacing, useTheme } from "@/ui";

/** Grid of seats: free ones can be picked, taken ones are greyed out. */
export function SeatPicker({
  seats,
  value,
  onChange,
}: {
  seats: SeatAvailability[];
  value: number | null;
  onChange: (seatId: number) => void;
}) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {seats.map((seat) => {
        const selected = seat.id === value;
        return (
          <Pressable
            key={seat.id}
            disabled={!seat.available}
            accessibilityRole="button"
            accessibilityLabel={`Seat ${seat.label}${seat.available ? "" : ", taken"}`}
            accessibilityState={{ selected, disabled: !seat.available }}
            onPress={() => onChange(seat.id)}
            android_ripple={{ color: t.colors.ripple, foreground: true }}
            style={({ pressed }) => [
              styles.seat,
              !seat.available && styles.taken,
              selected && styles.selected,
              Platform.OS === "ios" && pressed && styles.pressed,
            ]}
          >
            <Text
              variant="bodyStrong"
              color={
                selected
                  ? Platform.OS === "ios"
                    ? t.colors.onPrimary
                    : t.colors.onSecondaryContainer
                  : seat.available
                    ? t.colors.text
                    : t.colors.textFaint
              }
              style={!seat.available ? styles.strike : undefined}
            >
              {seat.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  seat: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderCurve: "continuous",
    borderWidth: Platform.OS === "ios" ? 0 : 1,
    borderColor: t.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "ios" ? t.colors.surface : "transparent",
    overflow: "hidden",
  },
  taken: { backgroundColor: t.colors.fill, borderColor: "transparent" },
  selected:
    Platform.OS === "ios"
      ? { backgroundColor: t.colors.primary }
      : { backgroundColor: t.colors.secondaryContainer, borderColor: "transparent" },
  pressed: { opacity: 0.6 },
  strike: { textDecorationLine: "line-through" },
}));
