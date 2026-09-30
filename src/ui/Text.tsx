import { Text as RNText, type ColorValue, type TextProps } from "react-native";
import { useTheme, type TextVariant } from "./theme";

type Props = TextProps & { variant?: TextVariant; color?: ColorValue };

const muted: Partial<Record<TextVariant, true>> = { label: true, caption: true };

/**
 * All app text goes through this, so sizes follow the platform (Apple's text styles on iOS,
 * the Material type scale on Android) and colors follow light/dark mode.
 */
export function Text({ variant = "body", color, style, ...rest }: Props) {
  const t = useTheme();
  const base = color ?? (muted[variant] ? t.colors.textMuted : t.colors.text);
  return <RNText {...rest} style={[t.type[variant], { color: base }, style]} />;
}
