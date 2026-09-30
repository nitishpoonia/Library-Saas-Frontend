import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { formatDate } from "@/lib/format";
import { Text } from "./Text";
import { colors, radius, spacing } from "./theme";

/**
 * Date and time inputs. The app passes plain strings ("2026-01-10", "22:30") like the
 * API does; conversion to and from JS Date happens only here.
 */

const pad = (n: number) => String(n).padStart(2, "0");

function toDate(mode: "date" | "time", value: string): Date {
  if (mode === "date") {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
  }
  const [h, min] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(h ?? 0, min ?? 0, 0, 0);
  return date;
}

function fromDate(mode: "date" | "time", date: Date): string {
  return mode === "date"
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "22:30" -> "10:30 PM" */
export function formatTime12(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const suffix = (h ?? 0) >= 12 ? "PM" : "AM";
  const hour = ((h ?? 0) % 12) || 12;
  return `${hour}:${pad(m ?? 0)} ${suffix}`;
}

function PickerField({
  mode,
  label,
  value,
  onChange,
  error,
}: {
  mode: "date" | "time";
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [iosOpen, setIosOpen] = useState(false);
  const display = mode === "date" ? formatDate(value) : formatTime12(value);

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode,
        value: toDate(mode, value),
        is24Hour: false,
        onValueChange: (_event, date) => onChange(fromDate(mode, date)),
      });
    } else {
      setIosOpen((o) => !o);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display}`}
        onPress={open}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <Text variant="body">{display}</Text>
        <Ionicons name={mode === "date" ? "calendar-outline" : "time-outline"} size={20} color={colors.textMuted} />
      </Pressable>
      {Platform.OS === "ios" && iosOpen ? (
        <DateTimePicker
          mode={mode}
          display="spinner"
          value={toDate(mode, value)}
          onValueChange={(_event, date) => onChange(fromDate(mode, date))}
        />
      ) : null}
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export const DateField = (props: Omit<Parameters<typeof PickerField>[0], "mode">) => <PickerField mode="date" {...props} />;
export const TimeField = (props: Omit<Parameters<typeof PickerField>[0], "mode">) => <PickerField mode="time" {...props} />;

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, flex: 1 },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldError: { borderColor: colors.danger },
});
