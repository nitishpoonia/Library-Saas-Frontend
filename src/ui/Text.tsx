import { Text as RNText, type TextProps } from "react-native";
import { type as typeStyles, type TextVariant } from "./theme";

type Props = TextProps & { variant?: TextVariant; color?: string };

/** All app text goes through this, so fonts and sizes stay consistent. */
export function Text({ variant = "body", color, style, ...rest }: Props) {
  return <RNText {...rest} style={[typeStyles[variant], color ? { color } : null, style]} />;
}
