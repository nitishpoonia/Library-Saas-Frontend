import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Pressable, View } from "react-native";
import { formatDate } from "@/lib/format";
import { Icon, icons } from "./Icon";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

/**
 * Date and time inputs. The app passes plain strings ("2026-01-10", "22:30") like the
 * API does; conversion to and from JS Date happens only here.
 *
 * iOS: a row with Apple's compact date/time button, which opens the system calendar or
 * wheel in a popover. Android: a field that opens the Material 3 date/time dialog.
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

type FieldProps = {
  mode: "date" | "time";
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function PickerField(props: FieldProps) {
  return Platform.OS === "ios" ? <IOSPicker {...props} /> : <AndroidPicker {...props} />;
}

function IOSPicker({ mode, label, value, onChange, error }: FieldProps) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iosRow, error ? styles.iosError : null]}>
        <Text variant="body" style={styles.flex} numberOfLines={1}>
          {label}
        </Text>
        <DateTimePicker
          mode={mode}
          display="compact"
          value={toDate(mode, value)}
          onValueChange={(_event, date) => onChange(fromDate(mode, date))}
          accessibilityLabel={label}
        />
      </View>
      {error ? (
        <Text variant="label" color={t.colors.danger} style={styles.support}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function AndroidPicker({ mode, label, value, onChange, error }: FieldProps) {
  const t = useTheme();
  const styles = useStyles();
  const display = mode === "date" ? formatDate(value) : formatTime12(value);
  const accent = error ? t.colors.danger : t.colors.textMuted;

  const open = () =>
    DateTimePickerAndroid.open({
      mode,
      design: "material",
      title: label,
      value: toDate(mode, value),
      is24Hour: false,
      onValueChange: (_event, date) => onChange(fromDate(mode, date)),
    });

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display}`}
        onPress={open}
        android_ripple={{ color: t.colors.ripple, foreground: true }}
        style={[styles.androidField, { borderBottomColor: accent, borderBottomWidth: error ? 2 : 1 }]}
      >
        <View style={styles.flex}>
          <Text variant="label" color={accent} numberOfLines={1}>
            {label}
          </Text>
          <Text variant="body">{display}</Text>
        </View>
        <Icon name={mode === "date" ? icons.calendar : icons.time} size={22} color={t.colors.textMuted} />
      </Pressable>
      {error ? (
        <Text variant="label" color={t.colors.danger} style={styles.support}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export const DateField = (props: Omit<FieldProps, "mode">) => <PickerField mode="date" {...props} />;
export const TimeField = (props: Omit<FieldProps, "mode">) => <PickerField mode="time" {...props} />;

const useStyles = makeStyles((t) => ({
  wrap: { gap: spacing.xs, flex: 1 },
  flex: { flex: 1 },
  support: { paddingHorizontal: spacing.lg },
  iosRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    backgroundColor: t.colors.surface,
    borderRadius: radius.md,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "transparent",
  },
  iosError: { borderColor: t.colors.danger },
  androidField: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: t.colors.fill,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    overflow: "hidden",
  },
}));
