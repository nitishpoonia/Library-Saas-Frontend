import { Pressable, StyleSheet, View } from "react-native";
import type { SeatAvailability } from "@/api/types";
import { Text, colors, radius, spacing } from "@/ui";

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
            style={[styles.seat, !seat.available && styles.taken, selected && styles.selected]}
          >
            <Text
              variant="bodyStrong"
              color={selected ? "#FFFFFF" : seat.available ? colors.text : colors.textFaint}
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

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  seat: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  taken: { backgroundColor: "#F3F4F6", borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  strike: { textDecorationLine: "line-through" },
});
