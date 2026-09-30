import { forwardRef } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Text } from "./Text";
import { colors, fonts, radius, spacing } from "./theme";

type Props = TextInputProps & { label: string; error?: string; hint?: string };

export const TextField = forwardRef<TextInput, Props>(function TextField({ label, error, hint, style, ...rest }, ref) {
  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textFaint}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});

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

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.danger },
});
