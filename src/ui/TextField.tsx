import { forwardRef, useState } from "react";
import { Platform, TextInput, View, type TextInputProps } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

type Props = TextInputProps & { label?: string; error?: string; hint?: string };

const isIOS = Platform.OS === "ios";

/**
 * iOS: label above a rounded, filled field (like Apple's forms).
 * Android: a Material 3 "filled" text field: label inside the top of the field and an
 * underline that turns primary and thicker while focused, red on error.
 */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, style, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const t = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  const input = (
    <TextInput
      ref={ref}
      placeholderTextColor={t.colors.textFaint}
      selectionColor={t.colors.primary}
      cursorColor={t.colors.primary}
      accessibilityLabel={label}
      multiline={multiline}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[isIOS ? styles.iosInput : styles.androidInput, multiline && styles.multiline, style]}
      {...rest}
    />
  );

  const support = error ? (
    <Text variant="label" color={t.colors.danger} style={styles.support}>
      {error}
    </Text>
  ) : hint ? (
    <Text variant="label" style={styles.support}>
      {hint}
    </Text>
  ) : null;

  if (isIOS) {
    return (
      <View style={styles.wrap}>
        {label ? (
          <Text variant="label" style={styles.iosLabel}>
            {label}
          </Text>
        ) : null}
        <View style={[styles.iosField, focused && styles.iosFocused, error ? styles.iosError : null]}>{input}</View>
        {support}
      </View>
    );
  }

  const accent = error ? t.colors.danger : focused ? t.colors.primary : undefined;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.androidField,
          { borderBottomColor: accent ?? t.colors.textMuted, borderBottomWidth: focused || error ? 2 : 1 },
        ]}
      >
        {label ? (
          <Text variant="label" color={accent ?? t.colors.textMuted} style={styles.androidLabel} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        {input}
      </View>
      {support}
    </View>
  );
});

/** A label above a group of controls (chips, a seat grid), lined up with field labels. */
export function FieldLabel({ children }: { children: string }) {
  const styles = useStyles();
  return (
    <Text variant="label" style={isIOS ? styles.iosLabel : styles.groupLabel}>
      {children}
    </Text>
  );
}

/** A TextField wired to react-hook-form: value, change and error come from the form. */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: Omit<Props, "value" | "onChangeText" | "error"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- forms whose parsed values differ from their inputs
  control: Control<T, any, any>;
  name: Path<T>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          value={field.value === undefined || field.value === null ? "" : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: spacing.xs },
  support: { paddingHorizontal: spacing.lg },

  iosLabel: { paddingHorizontal: spacing.lg },
  groupLabel: { paddingHorizontal: spacing.xs },
  iosField: {
    backgroundColor: t.colors.surface,
    borderRadius: radius.md,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "transparent",
  },
  iosFocused: { borderColor: t.colors.primary },
  iosError: { borderColor: t.colors.danger },
  iosInput: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 17,
    color: t.colors.text,
  },

  androidField: {
    backgroundColor: t.colors.fill,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    minHeight: 56,
    paddingTop: spacing.sm,
    justifyContent: "center",
  },
  androidLabel: { paddingHorizontal: spacing.lg },
  androidInput: {
    minHeight: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: 2,
    paddingBottom: spacing.sm,
    fontSize: 16,
    letterSpacing: 0.5,
    color: t.colors.text,
    // Without a background, Android draws its own underline under the input.
    backgroundColor: "transparent",
  },
  multiline: { minHeight: 88, textAlignVertical: "top" },
}));
