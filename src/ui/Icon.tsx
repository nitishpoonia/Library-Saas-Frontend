import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import { View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "./theme";

/** One icon, two native sets: SF Symbols on iOS, Material Symbols on Android. */
export type IconName = { ios: SFSymbol; android: AndroidSymbol };

export function Icon({
  name,
  size = 22,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  // Icons are decoration; the control around them carries the label. On Android the symbol
  // is a font glyph, so it's hidden explicitly or TalkBack would read the character.
  return (
    <View style={style} accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <SymbolView name={name} size={size} tintColor={color ?? t.colors.text} />
    </View>
  );
}

/** Icons used across the app, so the same idea gets the same symbol everywhere. */
export const icons = {
  add: { ios: "plus", android: "add" },
  back: { ios: "chevron.left", android: "chevron_left" },
  forward: { ios: "chevron.right", android: "chevron_right" },
  check: { ios: "checkmark", android: "check" },
  checkCircle: { ios: "checkmark.circle.fill", android: "check_circle" },
  calendar: { ios: "calendar", android: "calendar_today" },
  time: { ios: "clock", android: "schedule" },
  call: { ios: "phone.fill", android: "call" },
  message: { ios: "message.fill", android: "chat" },
  receipt: { ios: "doc.text", android: "receipt_long" },
  share: { ios: "square.and.arrow.up", android: "share" },
  edit: { ios: "pencil", android: "edit" },
  trash: { ios: "trash", android: "delete" },
  branch: { ios: "building.2", android: "store" },
  addBranch: { ios: "plus", android: "add_business" },
  seats: { ios: "square.grid.2x2", android: "event_seat" },
  staff: { ios: "person.2", android: "badge" },
  card: { ios: "creditcard", android: "credit_card" },
  person: { ios: "person", android: "person" },
  key: { ios: "key", android: "key" },
  bell: { ios: "bell", android: "notifications" },
  signOut: { ios: "rectangle.portrait.and.arrow.right", android: "logout" },
  phone: { ios: "iphone", android: "smartphone" },
  warning: { ios: "exclamationmark.triangle.fill", android: "warning" },
} satisfies Record<string, IconName>;
